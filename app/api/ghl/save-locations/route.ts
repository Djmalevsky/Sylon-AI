import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseAdmin = createClient(
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

    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const agencyId = user.id;

    for (const loc of locations) {
      const { error } = await supabaseAdmin.from("ghl_connections").upsert(
        {
          agency_id: agencyId,
          ghl_location_id: loc.id,
          ghl_location_name: loc.name,
          access_token: token,
          is_activated: false,
          created_at: new Date().toISOString(),
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
