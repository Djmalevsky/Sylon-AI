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

    // Call GHL API to search for all locations under this agency
    const ghlRes = await fetch(
      "https://services.leadconnectorhq.com/locations/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({ skip: 0, limit: 100 }),
      }
    );

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error("GHL API error:", ghlRes.status, errText);

      if (ghlRes.status === 401) {
        return NextResponse.json(
          { error: "Invalid token. Make sure you are using an Agency-level Private Integration token with the correct scopes." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch locations from GoHighLevel. Status: " + ghlRes.status },
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

    // Save agency token to Supabase
    const agencyId = "00000000-0000-0000-0000-000000000001"; // MVP hardcoded
    const { error: dbError } = await supabase.from("agencies").upsert(
      {
        id: agencyId,
        name: "Agency",
        owner_email: "admin@sylon.ai",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (dbError) console.error("Agency upsert error:", dbError);

    return NextResponse.json({ success: true, locations });
  } catch (err: any) {
    console.error("GHL connect error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
