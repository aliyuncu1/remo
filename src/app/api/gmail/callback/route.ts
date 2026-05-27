/**
 * Gmail OAuth2 Callback Handler
 *
 * Exchanges the authorization code for tokens,
 * fetches user email, and redirects to settings with token data.
 *
 * Required env vars in .env.local:
 *   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
 *   GOOGLE_CLIENT_SECRET=your-client-secret
 *   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?gmail_error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?gmail_error=no_code', req.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/gmail/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings?gmail_error=missing_config', req.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      const msg = err.error_description || err.error || 'token_exchange_failed';
      return NextResponse.redirect(
        new URL(`/settings?gmail_error=${encodeURIComponent(msg)}`, req.url)
      );
    }

    const tokenData = await tokenRes.json();

    // Fetch user email
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    let email = '';
    if (userRes.ok) {
      const userData = await userRes.json();
      email = userData.email || '';
    }

    // Build token payload for the client
    const expiresAt = Date.now() + (tokenData.expires_in || 3600) * 1000;
    const payload = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || '',
      expiresAt,
      email,
    };

    // Redirect back to settings with token data encoded in a fragment
    // (fragment stays client-side, never hits server logs)
    const encodedPayload = encodeURIComponent(JSON.stringify(payload));
    return NextResponse.redirect(
      new URL(`/settings?gmail_success=1#gmail_tokens=${encodedPayload}`, req.url)
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.redirect(
      new URL(`/settings?gmail_error=${encodeURIComponent(msg)}`, req.url)
    );
  }
}
