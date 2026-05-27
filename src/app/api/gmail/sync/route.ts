/**
 * Gmail Sync Endpoint
 *
 * Searches Gmail for emails with invoice/receipt attachments,
 * downloads them, parses the content, and uses AI to extract invoice data.
 *
 * Required env vars in .env.local:
 *   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
 *   GOOGLE_CLIENT_SECRET=your-client-secret
 */

import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailMessageDetail {
  id: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<GmailPart>;
    mimeType: string;
    body?: { attachmentId?: string; size: number; data?: string };
    filename?: string;
  };
  internalDate: string;
}

interface GmailPart {
  mimeType: string;
  filename?: string;
  body?: { attachmentId?: string; size: number; data?: string };
  parts?: GmailPart[];
}

interface DetectedAttachment {
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  subject: string;
  from: string;
  date: string;
}

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

async function gmailFetch(url: string, accessToken: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function findAttachments(parts: GmailPart[], result: Array<{ attachmentId: string; filename: string; mimeType: string }>) {
  for (const part of parts) {
    if (part.body?.attachmentId && part.filename) {
      const name = part.filename.toLowerCase();
      const isInvoiceFile =
        name.endsWith('.pdf') ||
        name.endsWith('.png') ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.xlsx') ||
        name.endsWith('.xls') ||
        name.endsWith('.csv');
      if (isInvoiceFile) {
        result.push({
          attachmentId: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
        });
      }
    }
    if (part.parts) {
      findAttachments(part.parts, result);
    }
  }
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { accessToken, refreshToken, expiresAt } = body as TokenPayload;
    const { apiKey, apiProvider } = body;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Gmail tokens are required.' }, { status: 400 });
    }

    // Refresh token if expired
    let newTokens: { accessToken: string; expiresAt: number } | null = null;
    if (Date.now() >= expiresAt - 60000) {
      newTokens = await refreshAccessToken(refreshToken);
      if (!newTokens) {
        return NextResponse.json(
          { error: 'Failed to refresh Gmail token. Please reconnect Gmail.' },
          { status: 401 }
        );
      }
      accessToken = newTokens.accessToken;
      expiresAt = newTokens.expiresAt;
    }

    // Search for emails with invoice-related attachments
    const searchQuery = 'has:attachment (fatura OR fiş OR invoice OR receipt OR e-fatura OR fis) newer_than:30d';
    const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=20`;

    const searchResult = await gmailFetch(searchUrl, accessToken);
    const messages: GmailMessage[] = searchResult.messages || [];

    if (messages.length === 0) {
      return NextResponse.json({
        attachments: [],
        invoices: [],
        newTokens,
      });
    }

    // Fetch message details and find attachments
    const detectedAttachments: DetectedAttachment[] = [];

    for (const msg of messages.slice(0, 10)) {
      const detail: GmailMessageDetail = await gmailFetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        accessToken
      );

      const headers = detail.payload.headers;
      const subject = getHeader(headers, 'Subject');
      const from = getHeader(headers, 'From');
      const date = getHeader(headers, 'Date');

      const attachments: Array<{ attachmentId: string; filename: string; mimeType: string }> = [];

      if (detail.payload.parts) {
        findAttachments(detail.payload.parts, attachments);
      } else if (detail.payload.body?.attachmentId && detail.payload.filename) {
        attachments.push({
          attachmentId: detail.payload.body.attachmentId,
          filename: detail.payload.filename,
          mimeType: detail.payload.mimeType,
        });
      }

      for (const att of attachments) {
        detectedAttachments.push({
          messageId: msg.id,
          attachmentId: att.attachmentId,
          filename: att.filename,
          mimeType: att.mimeType,
          subject,
          from,
          date,
        });
      }
    }

    // For each attachment, download and parse (limit to first 5 to avoid timeout)
    const invoices: Array<{
      id: string;
      emailSubject: string;
      emailFrom: string;
      emailDate: string;
      fileName: string;
      rawText: string;
      parsedData: Record<string, unknown> | null;
    }> = [];

    for (const att of detectedAttachments.slice(0, 5)) {
      try {
        // Download attachment
        const attData = await gmailFetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${att.messageId}/attachments/${att.attachmentId}`,
          accessToken
        );

        const base64Data: string = attData.data;
        // Gmail uses URL-safe base64
        const buffer = Buffer.from(base64Data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

        // Parse based on file type
        let text = '';
        const name = att.filename.toLowerCase();

        if (name.endsWith('.pdf')) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            text = data.text;
          } catch {
            text = '[PDF parsing failed]';
          }
        } else if (name.endsWith('.csv') || name.endsWith('.txt')) {
          text = buffer.toString('utf-8');
        } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          const sheets: string[] = [];
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            sheets.push(`--- Sheet: ${sheetName} ---\n${csv}`);
          });
          text = sheets.join('\n\n');
        } else {
          // Skip image attachments for now (would need OCR)
          continue;
        }

        if (!text.trim() || text === '[PDF parsing failed]') continue;

        // Use AI to extract invoice data
        let parsedData: Record<string, unknown> | null = null;

        if (apiKey) {
          try {
            const invoicePrompt = `You are Remo, a bilingual business document AI. Extract invoice data from this document.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "invoiceNumber": "",
  "fromCompany": "",
  "toCompany": "",
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "subtotal": 0,
  "totalVat": 0,
  "totalAmount": 0,
  "currency": "TRY",
  "type": "e-fatura" | "e-arsiv" | "standard",
  "items": [{"description": "", "quantity": 1, "unit": "adet", "unitPrice": 0, "vatRate": 20, "vatAmount": 0, "total": 0}],
  "notes": ""
}

If a field is unclear, use reasonable defaults. Currency defaults to TRY.

Document (from email: "${att.subject}" by ${att.from}):
---
${text.slice(0, 4000)}
---`;

            // Call the existing analyze endpoint logic inline
            const analyzeRes = await fetch(new URL('/api/analyze', req.url).toString(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: invoicePrompt, provider: apiProvider || 'anthropic', apiKey }),
            });

            if (analyzeRes.ok) {
              const analyzeData = await analyzeRes.json();
              const cleaned = analyzeData.result
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();
              parsedData = JSON.parse(cleaned);
            }
          } catch {
            // AI parsing failed — still include with raw text
          }
        }

        invoices.push({
          id: `gmail_${att.messageId}_${att.attachmentId.slice(0, 8)}`,
          emailSubject: att.subject,
          emailFrom: att.from,
          emailDate: att.date,
          fileName: att.filename,
          rawText: text.slice(0, 2000),
          parsedData,
        });
      } catch {
        // Skip individual attachment errors
        continue;
      }
    }

    return NextResponse.json({
      attachments: detectedAttachments,
      invoices,
      newTokens,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
