import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    // For MVP: get the default agency user's connections
    const { data: user } = await supabase
      .from("agency_users")
      .select("id")
      .eq("email", "admin@sylon.ai")
      .single();

    if (!user) {
      return NextResponse.json({ connected: false, connections: [] });
    }

    const { data: connections, error } = await supabase
      .from("ghl_connections")
      .select("*")
      .eq("agency_id", user.id)
      .order("connected_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Check if any tokens are still valid
    const activeConnections = (connections || []).map((conn) => ({
      id: conn.id,
      locationId: conn.ghl_location_id,
      locationName: conn.ghl_location_name,
      connected: true,
      tokenExpired: new Date(conn.expires_at) < new Date(),
      connectedAt: conn.connected_at,
    }));

    return NextResponse.json({
      connected: activeConnections.length > 0,
      connections: activeConnections,
    });
  } catch (error) {
    console.error("Connection status error:", error);
    return NextResponse.json(
      { connected: false, connections: [], error: "Failed to check status" },
      { status: 500 }
    );
  }
}
