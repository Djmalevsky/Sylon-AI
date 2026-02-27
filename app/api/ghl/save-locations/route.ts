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
    const errors: any[] = [];
    let saved = 0;

    for (const loc of locations) {
      const { error } = await supabaseAdmin.from("ghl_connections").upsert(
        {
          agency_id: agencyId,
          ghl_location_id: loc.id,
          ghl_location_name: loc.name,
          access_token: token,
          is_activated: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "ghl_location_id" }
      );

      if (error) {
        errors.push({ locationId: loc.id, error: error.message });
      } else {
        saved++;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      saved,
      totalErrors: errors.length,
      errors: errors.slice(0, 3),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
