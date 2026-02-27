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
      const msg = body.message || body;
      const call = msg.call || {};
      const assistantId = call.assistantId || msg.assistant?.id || null;

      // Look up agency and location from the assistant ID
      let agencyId = null;
      let ghlLocationId = null;

      if (assistantId) {
        const { data: conn } = await supabase
          .from("ghl_connections")
          .select("agency_id, ghl_location_id")
          .eq("vapi_assistant_id", assistantId)
          .single();

        if (conn) {
          agencyId = conn.agency_id;
          ghlLocationId = conn.ghl_location_id;
        }
      }

      // Try multiple paths for duration and cost
      const durationSeconds = Math.round(
        call.duration || msg.duration || msg.durationSeconds || call.durationSeconds || 0
      );
      const costValue = call.cost || msg.cost || call.costBreakdown?.total || msg.costBreakdown?.total || 0;
      const costCents = Math.round(costValue * 100);

      const callLog = {
        agency_id: agencyId,
        ghl_location_id: ghlLocationId,
        vapi_call_id: call.id || msg.callId,
        contact_phone: call.customer?.number || msg.customer?.number || "",
        direction: call.type === "inboundPhoneCall" ? "inbound" : "outbound",
        status: call.endedReason === "customer-ended-call" || call.endedReason === "assistant-ended-call" ? "completed" : call.endedReason || "completed",
        duration_seconds: durationSeconds,
        cost_cents: costCents,
        transcript: msg.transcript || "",
        summary: msg.summary || msg.analysis?.summary || "",
        recording_url: msg.recordingUrl || call.recordingUrl || "",
        sentiment: msg.analysis?.sentiment || null,
        appointment_booked: false,
        metadata: {
          endedReason: call.endedReason,
          assistantId: assistantId,
          analysis: msg.analysis || {},
          rawDuration: { callDuration: call.duration, msgDuration: msg.duration, callDurationSeconds: call.durationSeconds, msgDurationSeconds: msg.durationSeconds },
          rawCost: { callCost: call.cost, msgCost: msg.cost, callCostBreakdown: call.costBreakdown, msgCostBreakdown: msg.costBreakdown },
        },
      };

      await supabase.from("call_logs").insert(callLog);

      // Update usage records
      if (agencyId) {
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

        const { data: existing } = await supabase
          .from("usage_records")
          .select("*")
          .eq("agency_id", agencyId)
          .eq("period_start", periodStart)
          .single();

        if (existing) {
          await supabase.from("usage_records").update({
            total_calls: (existing.total_calls || 0) + 1,
            total_minutes: (existing.total_minutes || 0) + Math.ceil(durationSeconds / 60),
            vapi_cost_cents: (existing.vapi_cost_cents || 0) + costCents,
            total_cost_cents: (existing.total_cost_cents || 0) + costCents,
            updated_at: new Date().toISOString(),
          }).eq("id", existing.id);
        } else {
          await supabase.from("usage_records").insert({
            agency_id: agencyId,
            period_start: periodStart,
            period_end: periodEnd,
            total_calls: 1,
            total_minutes: Math.ceil(durationSeconds / 60),
            vapi_cost_cents: costCents,
            total_cost_cents: costCents,
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
