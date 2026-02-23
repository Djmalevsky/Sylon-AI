import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // GHL V2 API - Search locations (GET request)
    const ghlRes = await fetch(
      "https://services.leadconnectorhq.com/locations/search?skip=0&limit=100",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          Version: "2021-07-28",
        },
      }
    );

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error("GHL API error:", ghlRes.status, errText);

      if (ghlRes.status === 401) {
        return NextResponse.json(
          { error: "Invalid or expired token. Make sure you created the Private Integration at the Agency level with Locations scope enabled." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch locations from GoHighLevel. Status: " + ghlRes.status + ". " + errText },
        { status: 500 }
      );
    }

    const ghlData = await ghlRes.json();
    const locations = (ghlData.locations || []).map((loc: any) => ({
      id: loc.id || loc._id,
      name: loc.name || "Unnamed Location",
      city: loc.city || "",
      state: loc.state || "",
      phone: loc.phone || "",
      email: loc.email || "",
    }));

    if (locations.length === 0) {
      return NextResponse.json(
        { error: "No sub-accounts found. Make sure you are using an Agency-level token (not a sub-account token)." },
        { status: 404 }
      );
    }

    // Save agency connection to Supabase
    const agencyId = "00000000-0000-0000-0000-000000000001";
    await supabase.from("agencies").upsert(
      {
        id: agencyId,
        name: "Agency",
        owner_email: "admin@sylon.ai",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return NextResponse.json({ success: true, locations });
  } catch (err: any) {
    console.error("GHL connect error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
