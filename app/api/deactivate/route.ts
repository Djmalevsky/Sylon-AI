import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const VAPI_API_KEY = process.env.VAPI_API_KEY!;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;

export async function POST(request: Request) {
  try {
    const { ghlLocationId } = await request.json();
    if (!ghlLocationId) return NextResponse.json({ error: "ghlLocationId required" }, { status: 400 });

    const { data: conn } = await supabase.from("ghl_connections").select("*").eq("ghl_location_id", ghlLocationId).single();
    if (!conn) return NextResponse.json({ error: "Location not found" }, { status: 404 });

    const twilioAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    if (conn.vapi_assistant_id) {
      await fetch(`https://api.vapi.ai/assistant/${conn.vapi_assistant_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${VAPI_API_KEY}` } }).catch(() => {});
    }
    if (conn.vapi_phone_number_id) {
      await fetch(`https://api.vapi.ai/phone-number/${conn.vapi_phone_number_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${VAPI_API_KEY}` } }).catch(() => {});
    }
    if (conn.twilio_phone_sid) {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/${conn.twilio_phone_sid}.json`, { method: "DELETE", headers: { Authorization: `Basic ${twilioAuth}` } }).catch(() => {});
    }

    await supabase.from("ghl_connections").update({
      twilio_phone_number: null, twilio_phone_sid: null, vapi_assistant_id: null,
      vapi_phone_number_id: null, is_activated: false, updated_at: new Date().toISOString(),
    }).eq("ghl_location_id", ghlLocationId);

    await supabase.from("agent_prompts").update({ active: false }).eq("ghl_location_id", ghlLocationId);

    return NextResponse.json({ success: true, message: "Location deactivated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
