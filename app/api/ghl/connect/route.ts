import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { token, locationId, locationName } = await request.json();
    if (!token || !locationId) {
      return NextResponse.json({ error: "Token and Location ID are required" }, { status: 400 });
    }
    const agencyId = "00000000-0000-0000-0000-000000000001";
    const { error } = await supabase.from("ghl_connections").upsert(
      {
        agency_id: agencyId,
        ghl_location_id: locationId,
        ghl_location_name: locationName || "My Agency",
        api_token: token,
        status: "active",
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "agency_id" }
    );
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("GHL connect error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
