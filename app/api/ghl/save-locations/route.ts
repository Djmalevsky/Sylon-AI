import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { token, locations } = await request.json();

    if (!token || !locations || locations.length === 0) {
      return NextResponse.json(
        { error: "Token and at least one location are required" },
        { status: 400 }
      );
    }

    const agencyId = "00000000-0000-0000-0000-000000000001"; // MVP hardcoded

    // Save each selected location as a ghl_connection
    for (const loc of locations) {
      const { error } = await supabase.from("ghl_connections").upsert(
        {
          agency_id: agencyId,
          ghl_location_id: loc.id,
          ghl_location_name: loc.name,
          api_token: token,
          status: "active",
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "ghl_location_id" }
      );

      if (error) {
        console.error("Error saving location:", loc.id, error);
      }
    }

    return NextResponse.json({
      success: true,
      saved: locations.length,
    });
  } catch (err: any) {
    console.error("Save locations error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
