/**
 * Gmail OAuth2 Authorization Endpoint
 *
 * Required env vars in .env.local:
 *   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
 *   GOOGLE_CLIENT_SECRET=your-client-secret
 *   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/gmail/callback';

  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID is not configured. Add it to .env.local' },
      { status: 500 }
    );
  }

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
