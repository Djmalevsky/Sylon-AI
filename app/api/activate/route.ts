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

Remember: You represent ${businessName}. Be professional but personable.
`.trim();

// Get or create a Twilio sub-account for an agency
async function getOrCreateSubAccount(agencyId: string, agencyName: string) {
  const twilioAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  // Check if agency already has a sub-account stored
  const { data: existing } = await supabase
    .from("agency_users")
    .select("id")
    .eq("id", agencyId)
    .single();

  // Check ghl_connections for an existing sub-account for this agency
  const { data: existingConn } = await supabase
    .from("ghl_connections")
    .select("twilio_subaccount_sid, twilio_subaccount_token")
    .eq("agency_id", agencyId)
    .not("twilio_subaccount_sid", "is", null)
    .limit(1)
    .single();

  if (existingConn?.twilio_subaccount_sid && existingConn?.twilio_subaccount_token) {
    return {
      sid: existingConn.twilio_subaccount_sid,
      authToken: existingConn.twilio_subaccount_token,
    };
  }

  // Create new sub-account
  const createRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        FriendlyName: `Sylon - ${agencyName || agencyId.slice(0, 8)}`,
      }),
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Twilio sub-account: ${errText}`);
  }

  const subAccount = await createRes.json();
  return {
    sid: subAccount.sid,
    authToken: subAccount.auth_token,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agencyId,
      ghlLocationId,
      ghlLocationName,
      phoneNumber,
      businessName,
      businessType,
      areaCode,
    } = body;

    if (!agencyId || !ghlLocationId) {
      return NextResponse.json(
        { error: "agencyId and ghlLocationId are required" },
        { status: 400 }
      );
    }

    const results: any = { steps: [], phoneNumber: null, vapiAssistantId: null, vapiPhoneNumberId: null };

    // =========================================
    // STEP 1: Get or Create Twilio Sub-Account
    // =========================================
    let subAccountSid: string;
    let subAccountToken: string;
    try {
      const sub = await getOrCreateSubAccount(agencyId, businessName || ghlLocationName || "Agency");
      subAccountSid = sub.sid;
      subAccountToken = sub.authToken;
      results.steps.push({ step: "create_subaccount", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "create_subaccount", status: "failed", error: err.message });
      return NextResponse.json(
        { error: `Failed to create Twilio sub-account: ${err.message}`, results },
        { status: 500 }
      );
    }

    // =========================================
    // STEP 2: Buy Phone Number under Sub-Account
    // =========================================
    let twilioNumber: any;
    try {
      const subAuth = Buffer.from(`${subAccountSid}:${subAccountToken}`).toString("base64");

      if (phoneNumber) {
        const buyRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${subAccountSid}/IncomingPhoneNumbers.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${subAuth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              PhoneNumber: phoneNumber,
              FriendlyName: `Sylon - ${ghlLocationName || ghlLocationId}`,
            }),
          }
        );

        if (!buyRes.ok) {
          const errText = await buyRes.text();
          throw new Error(`Twilio buy failed: ${errText}`);
        }
        twilioNumber = await buyRes.json();
      } else {
        const searchCode = areaCode || "415";
        const masterAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

        const searchRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/US/Local.json?AreaCode=${searchCode}&VoiceEnabled=true&Limit=1`,
          { headers: { Authorization: `Basic ${masterAuth}` } }
        );
        const searchData = await searchRes.json();

        if (!searchData.available_phone_numbers?.length) {
          throw new Error(`No numbers available for area code ${searchCode}`);
        }

        const numberToBuy = searchData.available_phone_numbers[0].phone_number;

        const buyRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${subAccountSid}/IncomingPhoneNumbers.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${subAuth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              PhoneNumber: numberToBuy,
              FriendlyName: `Sylon - ${ghlLocationName || ghlLocationId}`,
            }),
          }
        );

        if (!buyRes.ok) {
          const errText = await buyRes.text();
          throw new Error(`Twilio buy failed: ${errText}`);
        }
        twilioNumber = await buyRes.json();
      }

      results.phoneNumber = twilioNumber.phone_number;
      results.twilioSid = twilioNumber.sid;
      results.steps.push({ step: "buy_number", status: "success", number: twilioNumber.phone_number });
    } catch (err: any) {
      results.steps.push({ step: "buy_number", status: "failed", error: err.message });
      return NextResponse.json(
        { error: `Failed to buy phone number: ${err.message}`, results },
        { status: 500 }
      );
    }

    // =========================================
    // STEP 3: Import Number into VAPI (using sub-account creds)
    // =========================================
    let vapiPhoneNumber: any;
    try {
      const importRes = await fetch("https://api.vapi.ai/phone-number", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "twilio",
          number: twilioNumber.phone_number,
          twilioAccountSid: subAccountSid,
          twilioAuthToken: subAccountToken,
          name: `${ghlLocationName || ghlLocationId}`,
        }),
      });

      if (!importRes.ok) {
        const errText = await importRes.text();
        throw new Error(`VAPI import number failed: ${errText}`);
      }

      vapiPhoneNumber = await importRes.json();
      results.vapiPhoneNumberId = vapiPhoneNumber.id;
      results.steps.push({ step: "import_to_vapi", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "import_to_vapi", status: "failed", error: err.message });
    }

    // =========================================
    // STEP 4: Create VAPI Assistant
    // =========================================
    let vapiAssistant: any;
    try {
      const bName = businessName || ghlLocationName || "Your Business";
      const bType = businessType || "healthcare";

      const assistantRes = await fetch("https://api.vapi.ai/assistant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${bName.slice(0, 30)} - Inbound`,
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: DEFAULT_INBOUND_PROMPT(bName, bType) }],
          },
          voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
          transcriber: { provider: "deepgram", model: "nova-2" },
          firstMessage: `Hi, thanks for calling ${bName}! How can I help you today?`,
          endCallMessage: "Thanks for calling! Have a great day.",
          serverUrl: `${N8N_WEBHOOK_BASE_URL}/webhook/vapi-call-end`,
          metadata: {
            agency_id: agencyId,
            ghl_location_id: ghlLocationId,
            location_name: ghlLocationName,
          },
        }),
      });

      if (!assistantRes.ok) {
        const errText = await assistantRes.text();
        throw new Error(`VAPI create assistant failed: ${errText}`);
      }

      vapiAssistant = await assistantRes.json();
      results.vapiAssistantId = vapiAssistant.id;
      results.steps.push({ step: "create_assistant", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "create_assistant", status: "failed", error: err.message });
      return NextResponse.json(
        { error: `Failed to create VAPI assistant: ${err.message}`, results },
        { status: 500 }
      );
    }

    // =========================================
    // STEP 5: Link Phone Number to Assistant
    // =========================================
    if (vapiPhoneNumber?.id && vapiAssistant?.id) {
      try {
        const linkRes = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneNumber.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assistantId: vapiAssistant.id }),
        });

        if (!linkRes.ok) {
          const errText = await linkRes.text();
          throw new Error(`VAPI link failed: ${errText}`);
        }
        results.steps.push({ step: "link_number_to_assistant", status: "success" });
      } catch (err: any) {
        results.steps.push({ step: "link_number_to_assistant", status: "failed", error: err.message });
      }
    }

    // =========================================
    // STEP 6: Save to Supabase
    // =========================================
    try {
      const { error: connError } = await supabase
        .from("ghl_connections")
        .update({
          twilio_phone_number: twilioNumber.phone_number,
          twilio_phone_sid: twilioNumber.sid,
          twilio_subaccount_sid: subAccountSid,
          twilio_subaccount_token: subAccountToken,
          vapi_assistant_id: vapiAssistant?.id || null,
          vapi_phone_number_id: vapiPhoneNumber?.id || null,
          is_activated: true,
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("ghl_location_id", ghlLocationId);

      if (connError) throw connError;
      results.steps.push({ step: "save_to_database", status: "success" });
    } catch (err: any) {
      results.steps.push({ step: "save_to_database", status: "failed", error: err.message });
    }

    return NextResponse.json({
      success: true,
      message: `${ghlLocationName || ghlLocationId} is now activated with AI calling!`,
      phoneNumber: twilioNumber.phone_number,
      results,
    });
  } catch (err: any) {
    console.error("Activation error:", err);
    return NextResponse.json(
      { error: err.message || "Activation failed" },
      { status: 500 }
    );
  }
}
