import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/ghl";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  // If no code, the user denied or something went wrong
  if (!code) {
    const error = searchParams.get("error") || "No authorization code received";
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  try {
    // Exchange the code for tokens
    const tokenData = await exchangeCodeForTokens(code);

    /*
      tokenData looks like:
      {
        access_token: "...",
        refresh_token: "...",
        token_type: "Bearer",
        expires_in: 86400,
        scope: "contacts.write calendars.readonly ...",
        userType: "Location",
        locationId: "abc123",
        companyId: "xyz789",
        userId: "user123"
      }
    */

    const supabase = createServerClient();

    // Calculate token expiry
    const expiresAt = new Date(
      Date.now() + (tokenData.expires_in || 86400) * 1000
    ).toISOString();

    // For MVP: create or get a default agency user
    // (We'll replace this with real auth later)
    let agencyId: string;

    const { data: existingUser } = await supabase
      .from("agency_users")
      .select("id")
      .eq("email", "admin@sylon.ai")
      .single();

    if (existingUser) {
      agencyId = existingUser.id;
    } else {
      const { data: newUser, error: userError } = await supabase
        .from("agency_users")
        .insert({ email: "admin@sylon.ai", name: "Admin", plan: "pro" })
        .select("id")
        .single();

      if (userError || !newUser) {
        throw new Error(`Failed to create agency user: ${userError?.message}`);
      }
      agencyId = newUser.id;
    }

    // Check if we already have a connection for this location
    const { data: existingConnection } = await supabase
      .from("ghl_connections")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("ghl_location_id", tokenData.locationId || "")
      .single();

    const connectionData = {
      agency_id: agencyId,
      ghl_location_id: tokenData.locationId || null,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type || "Bearer",
      expires_at: expiresAt,
      scopes: tokenData.scope || "",
      user_type: tokenData.userType || "Location",
      company_id: tokenData.companyId || null,
      updated_at: new Date().toISOString(),
    };

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from("ghl_connections")
        .update(connectionData)
        .eq("id", existingConnection.id);

      if (updateError) {
        throw new Error(`Failed to update connection: ${updateError.message}`);
      }
    } else {
      // Insert new connection
      const { error: insertError } = await supabase
        .from("ghl_connections")
        .insert(connectionData);

      if (insertError) {
        throw new Error(`Failed to save connection: ${insertError.message}`);
      }
    }

    // Also create a client account for this location if it doesn't exist
    if (tokenData.locationId) {
      const { data: existingClient } = await supabase
        .from("client_accounts")
        .select("id")
        .eq("ghl_location_id", tokenData.locationId)
        .single();

      if (!existingClient) {
        await supabase.from("client_accounts").insert({
          agency_id: agencyId,
          name: tokenData.locationId, // We'll fetch the real name via API later
          ghl_location_id: tokenData.locationId,
          status: "active",
        });
      }
    }

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL("/integrations?connected=true", request.url)
    );
  } catch (error) {
    console.error("GHL OAuth callback error:", error);
    const message =
      error instanceof Error ? error.message : "OAuth connection failed";
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
