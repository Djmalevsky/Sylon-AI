import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/ghl";

export async function GET() {
  const authUrl = getAuthorizationUrl();
  return NextResponse.redirect(authUrl);
}
