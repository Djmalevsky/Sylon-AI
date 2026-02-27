import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VAPI_API_KEY = process.env.VAPI_API_KEY!;

export async function POST(request: Request) {
  try {
    const { ghlLocationId } = await request.json();

    if (!ghlLocationId) {
      return NextResponse.json({ error: "ghlLocationId is required" }, { status: 400 });
    }

    const { data: conn, error: fetchError } = await supabase
      .from("ghl_connections")
      .select("*")
      .eq("ghl_location_id", ghlLocationId)
      .single();

    if (fetchError || !conn) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const steps: any[] = [];

    // Delete VAPI assistant
    if (conn.vapi_assistant_id) {
      try {
        await fetch(`https://api.vapi.ai/assistant/${conn.vapi_assistant_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
        });
        steps.push({ step: "delete_assistant", status: "success" });
      } catch (err: any) {
        steps.push({ step: "delete_assistant", status: "failed", error: err.message });
      }
    }

    // Delete VAPI phone number
    if (conn.vapi_phone_number_id) {
      try {
        await fetch(`https://api.vapi.ai/phone-number/${conn.vapi_phone_number_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
        });
        steps.push({ step: "delete_vapi_number", status: "success" });
      } catch (err: any) {
        steps.push({ step: "delete_vapi_number", status: "failed", error: err.message });
      }
    }

    // Release Twilio number using sub-account creds if available
    if (conn.twilio_phone_sid) {
      try {
        const sid = conn.twilio_subaccount_sid || process.env.TWILIO_ACCOUNT_SID!;
        const token = conn.twilio_subaccount_token || process.env.TWILIO_AUTH_TOKEN!;
        const twilioAuth = Buffer.from(`${sid}:${token}`).toString("base64");

        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers/${conn.twilio_phone_sid}.json`,
          {
            method: "DELETE",
            headers: { Authorization: `Basic ${twilioAuth}` },
          }
        );
        steps.push({ step: "release_twilio_number", status: "success" });
      } catch (err: any) {
        steps.push({ step: "release_twilio_number", status: "failed", error: err.message });
      }
    }

    // Update database
    await supabase
      .from("ghl_connections")
      .update({
        twilio_phone_number: null,
        twilio_phone_sid: null,
        vapi_assistant_id: null,
        vapi_phone_number_id: null,
        is_activated: false,
        updated_at: new Date().toISOString(),
      })
      .eq("ghl_location_id", ghlLocationId);

    return NextResponse.json({
      success: true,
      message: "Location deactivated. Phone number released.",
      steps,
    });
  } catch (err: any) {
    console.error("Deactivation error:", err);
    return NextResponse.json(
      { error: err.message || "Deactivation failed" },
      { status: 500 }
    );
  }
}
