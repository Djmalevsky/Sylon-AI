import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VAPI_API_KEY = process.env.VAPI_API_KEY!;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const N8N_WEBHOOK_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || "https://n8n.sylon.ai";

const DEFAULT_INBOUND_PROMPT = (businessName: string, businessType: string) => `
You are a friendly and professional AI receptionist for ${businessName}, a ${businessType} practice.

Your primary goals:
1. Answer incoming calls warmly and professionally
2. Help callers book appointments
3. Answer basic questions about the business
4. Take messages for the team if needed

Guidelines:
- Always be polite, warm, and helpful
- If asked about pricing, say you'd be happy to have someone from the team follow up with details
- If the caller wants to book an appointment, collect: their name, phone number, preferred date/time, and reason for visit
- If you can't help with something, offer to take a message
- Keep responses concise and natural
- If asked, confirm the business name is ${businessName}
`.trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agencyId, ghlLocationId, ghlLocationName,
      phoneNumber, businessName, businessType, areaCode,
    } = body;

    if (!agencyId || !ghlLocationId) {
      return NextResponse.json({ error: "agencyId and ghlLocationId are required" }, { status: 400 });
    }

    const results: any = { steps: [], phoneNumber: null, vapiAssistantId: null, vapiPhoneNumberId: null };
    const twilioAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    // STEP 1: Buy Twilio Phone Number
    let twilioNumber: any;
    try {
      if (phoneNumber) {
        const buyRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
          {
            method: "POST",
            headers: { Authorization: `Basic ${twilioAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ PhoneNumber: phoneNumber, FriendlyName: `Sylon - ${ghlLocationName || ghlLocationId}` }),
          }
        );
        if (!buyRes.ok) throw new Error(`Twilio buy failed: ${await buyRes.text()}`);
        twilioNumber = await buyRes.json();
      } else {
        const searchRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/US/Local.json?AreaCode=${areaCode || "415"}&VoiceEnabled=true&Limit=1`,
          { headers: { Authorization: `Basic ${twilioAuth}` } }
        );
        const searchData = await searchRes.json();
        if (!searchData.available_phone_numbers?.length) throw new Error(`No numbers for area code ${areaCode || "415"}`);
        const buyRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
          {
            method: "POST",
            headers: { Authorization: `Basic ${twilioAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ PhoneNumber: searchData.available_phone_numbers[0].phone_number, FriendlyName: `Sylon - ${ghlLocationName || ghlLocationId}` }),
          }
        );
        if (!buyRes.ok) throw new Error(`Twilio buy failed: ${await buyRes.text()}`);
        twilioNumber = await buyRes.json();
      }
      results.phoneNumber = twilioNumber.phone_number;
      results.twilioSid = twilioNumber.sid;
      results.steps.push({ step: "buy_number", status: "success", number: twilioNumber.phone_number });
    } catch (err: any) {
      results.steps.push({ step: "buy_number", status: "failed", error: err.message });
      return NextResponse.json({ error: `Failed to buy phone number: ${err.message}`, results }, { status: 500 });
    }

    // STEP 2: Import Number into VAPI
    let vapiPhoneNumber: any;
    try {
      const importRes = await fetch("https://api.vapi.ai/phone-number", {
        method: "POST",
        headers: { Authorization: `Bearer ${VAPI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "twilio", number: twilioNumber.phone_number,
          twilioAccountSid: TWILIO_ACCOUNT_SID, twilioAuthToken: TWILIO_AUTH_TOKEN,
          name: ghlLocationName || ghlLocationId,
        }),
      });
      if (!importRes.ok) throw new Error(`VAPI import failed: ${await importRes.text()}`);
      vapiPhoneNumber = await importRes.json();
      results.vapiPhoneNumberId = vapiPhoneNumber.id;
      results.steps.push({ step: "import_to_vapi", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "import_to_vapi", status: "failed", error: err.message });
    }

    // STEP 3: Create VAPI Assistant
    const bName = businessName || ghlLocationName || "Your Business";
    const bType = businessType || "healthcare";
    let vapiAssistant: any;
    try {
      const assistantRes = await fetch("https://api.vapi.ai/assistant", {
        method: "POST",
        headers: { Authorization: `Bearer ${VAPI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${bName} - Inbound`,
          model: { provider: "openai", model: "gpt-4o-mini", messages: [{ role: "system", content: DEFAULT_INBOUND_PROMPT(bName, bType) }] },
          voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
          transcriber: { provider: "deepgram", model: "nova-2" },
          firstMessage: `Hi, thanks for calling ${bName}! How can I help you today?`,
          endCallMessage: "Thanks for calling! Have a great day.",
          serverUrl: `${N8N_WEBHOOK_BASE_URL}/webhook/vapi-call-end`,
          metadata: { agency_id: agencyId, ghl_location_id: ghlLocationId, location_name: ghlLocationName },
        }),
      });
      if (!assistantRes.ok) throw new Error(`VAPI assistant failed: ${await assistantRes.text()}`);
      vapiAssistant = await assistantRes.json();
      results.vapiAssistantId = vapiAssistant.id;
      results.steps.push({ step: "create_assistant", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "create_assistant", status: "failed", error: err.message });
      return NextResponse.json({ error: `Failed to create assistant: ${err.message}`, results }, { status: 500 });
    }

    // STEP 4: Link Phone Number to Assistant
    if (vapiPhoneNumber?.id && vapiAssistant?.id) {
      try {
        const linkRes = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneNumber.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${VAPI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ assistantId: vapiAssistant.id }),
        });
        if (!linkRes.ok) throw new Error(`VAPI link failed: ${await linkRes.text()}`);
        results.steps.push({ step: "link_number_to_assistant", status: "success" });
      } catch (err: any) {
        results.steps.push({ step: "link_number_to_assistant", status: "failed", error: err.message });
      }
    }

    // STEP 5: Save to Supabase
    try {
      await supabase.from("ghl_connections").update({
        twilio_phone_number: twilioNumber.phone_number, twilio_phone_sid: twilioNumber.sid,
        vapi_assistant_id: vapiAssistant?.id, vapi_phone_number_id: vapiPhoneNumber?.id,
        is_activated: true, activated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("ghl_location_id", ghlLocationId);

      await supabase.from("agent_prompts").upsert({
        client_id: null, ghl_location_id: ghlLocationId, call_type: "inbound",
        name: `${bName} - Inbound Handler`, system_prompt: DEFAULT_INBOUND_PROMPT(bName, bType),
        first_message: `Hi, thanks for calling ${bName}! How can I help you today?`,
        voice_provider: "11labs", voice_id: "21m00Tcm4TlvDq8ikWAM",
        model_provider: "openai", model_name: "gpt-4o-mini",
        business_name: bName, business_type: bType, active: true, updated_at: new Date().toISOString(),
      }, { onConflict: "ghl_location_id,call_type" }).select();

      results.steps.push({ step: "save_to_database", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "save_to_database", status: "failed", error: err.message });
    }

    return NextResponse.json({
      success: true, message: `${ghlLocationName || ghlLocationId} activated!`,
      phoneNumber: twilioNumber.phone_number, vapiAssistantId: vapiAssistant?.id, results,
    });
  } catch (err: any) {
    console.error("Activation error:", err);
    return NextResponse.json({ error: err.message || "Activation failed" }, { status: 500 });
  }
}
