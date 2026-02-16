// GoHighLevel OAuth Configuration

export const GHL_CONFIG = {
  clientId: process.env.GHL_CLIENT_ID!,
  clientSecret: process.env.GHL_CLIENT_SECRET!,
  redirectUri: process.env.GHL_REDIRECT_URI!,
  authUrl: "https://marketplace.gohighlevel.com/oauth/chooselocation",
  tokenUrl: "https://services.leadconnectorhq.com/oauth/token",
  apiBaseUrl: "https://services.leadconnectorhq.com",
  scopes: [
    "contacts.readonly",
    "contacts.write",
    "calendars.readonly",
    "calendars/events.readonly",
    "calendars/events.write",
    "locations.readonly",
    "locations/customFields.readonly",
    "opportunities.readonly",
    "users.readonly",
  ],
};

// Build the OAuth authorization URL
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: GHL_CONFIG.clientId,
    redirect_uri: GHL_CONFIG.redirectUri,
    scope: GHL_CONFIG.scopes.join(" "),
  });

  return `${GHL_CONFIG.authUrl}?${params.toString()}`;
}

// Exchange authorization code for access + refresh tokens
export async function exchangeCodeForTokens(code: string) {
  const response = await fetch(GHL_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: GHL_CONFIG.clientId,
      client_secret: GHL_CONFIG.clientSecret,
      code: code,
      redirect_uri: GHL_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL token exchange failed: ${response.status} - ${error}`);
  }

  return response.json();
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(GHL_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: GHL_CONFIG.clientId,
      client_secret: GHL_CONFIG.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL token refresh failed: ${response.status} - ${error}`);
  }

  return response.json();
}

// Make an authenticated API call to GHL
export async function ghlApiRequest(
  accessToken: string,
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${GHL_CONFIG.apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API error: ${response.status} - ${error}`);
  }

  return response.json();
}
