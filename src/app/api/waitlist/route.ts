import { NextRequest, NextResponse } from 'next/server';

/**
 * Waitlist signup capture.
 * Always logs the signup (visible in Vercel logs) so it works with zero setup.
 * If WAITLIST_WEBHOOK is set (Formspree, Discord, Google Apps Script, etc.),
 * the signup is also forwarded there for nicer storage/notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, company } = await req.json();

    const clean = typeof email === 'string' ? email.trim() : '';
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    const entry = {
      email: clean,
      company: typeof company === 'string' ? company.trim() : '',
      at: new Date().toISOString(),
    };

    // Always captured here — retrievable via `vercel logs`.
    console.log('[WAITLIST]', JSON.stringify(entry));

    const webhook = process.env.WAITLIST_WEBHOOK;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (e) {
        console.error('[WAITLIST] webhook forward failed', e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}
