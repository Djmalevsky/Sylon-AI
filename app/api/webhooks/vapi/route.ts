import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messageType = body.message?.type || body.type;

    if (messageType === "end-of-call-report") {
      const call = body.message?.call || body.call || {};
      const metadata = call.metadata || {};

      const callLog = {
        agency_id: metadata.agency_id || null,
        ghl_location_id: metadata.ghl_location_id || null,
        vapi_call_id: call.id,
        contact_phone: call.customer?.number || "",
        direction: call.type === "inboundPhoneCall" ? "inbound" : "outbound",
        status: call.endedReason === "customer-ended-call" || call.endedReason === "assistant-ended-call" ? "completed" : call.endedReason || "completed",
        duration_seconds: Math.round(call.duration || 0),
        cost_cents: Math.round((call.cost || 0) * 100),
        transcript: body.message?.transcript || body.transcript || "",
        summary: body.message?.summary || body.summary || "",
        recording_url: body.message?.recordingUrl || body.recordingUrl || "",
        sentiment: body.message?.analysis?.sentiment || null,
        appointment_booked: false,
        metadata: { endedReason: call.endedReason, assistantId: call.assistantId, analysis: body.message?.analysis || {} },
      };

      await supabase.from("call_logs").insert(callLog);

      if (metadata.agency_id) {
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

        const { data: existing } = await supabase
          .from("usage_records").select("*")
          .eq("agency_id", metadata.agency_id).eq("period_start", periodStart).single();

        if (existing) {
          await supabase.from("usage_records").update({
            total_calls: (existing.total_calls || 0) + 1,
            total_minutes: (existing.total_minutes || 0) + Math.ceil(callLog.duration_seconds / 60),
            vapi_cost_cents: (existing.vapi_cost_cents || 0) + callLog.cost_cents,
            total_cost_cents: (existing.total_cost_cents || 0) + callLog.cost_cents,
            updated_at: new Date().toISOString(),
          }).eq("id", existing.id);
        } else {
          await supabase.from("usage_records").insert({
            agency_id: metadata.agency_id, period_start: periodStart, period_end: periodEnd,
            total_calls: 1, total_minutes: Math.ceil(callLog.duration_seconds / 60),
            vapi_cost_cents: callLog.cost_cents, total_cost_cents: callLog.cost_cents,
          });
        }
      }

      return NextResponse.json({ success: true, callId: call.id });
    }

    return NextResponse.json({ success: true, type: messageType });
  } catch (err: any) {
    console.error("VAPI webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
