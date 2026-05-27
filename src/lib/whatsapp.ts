/**
 * WhatsApp Business Cloud API utility functions
 *
 * Required env vars:
 *   WHATSAPP_TOKEN          – Permanent access token from Meta Business
 *   WHATSAPP_PHONE_ID       – Phone number ID from WhatsApp Business settings
 *   WHATSAPP_VERIFY_TOKEN   – Any secret string you pick (for webhook verification)
 *   WHATSAPP_AI_PROVIDER    – 'anthropic' | 'openai' | 'gemini'
 *   WHATSAPP_AI_KEY         – API key for the AI provider
 */

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

export interface WhatsAppMessage {
  from: string;          // sender phone number
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'unknown';
  text?: string;
  mediaId?: string;
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  timestamp: number;
}

/**
 * Parse incoming webhook payload from Meta
 */
export function parseWebhookMessage(body: Record<string, unknown>): WhatsAppMessage | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
    const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
    const value = changes?.value as Record<string, unknown>;
    const messages = (value?.messages as Array<Record<string, unknown>>);

    if (!messages || messages.length === 0) return null;

    const msg = messages[0];
    const from = msg.from as string;
    const timestamp = parseInt(msg.timestamp as string, 10);
    const type = msg.type as string;

    if (type === 'text') {
      const textObj = msg.text as Record<string, string>;
      return { from, type: 'text', text: textObj.body, timestamp };
    }

    if (type === 'image') {
      const img = msg.image as Record<string, string>;
      return { from, type: 'image', mediaId: img.id, mimeType: img.mime_type, timestamp };
    }

    if (type === 'document') {
      const doc = msg.document as Record<string, string>;
      return {
        from,
        type: 'document',
        mediaId: doc.id,
        mimeType: doc.mime_type,
        fileName: doc.filename,
        timestamp,
      };
    }

    return { from, type: 'unknown', timestamp };
  } catch {
    return null;
  }
}

/**
 * Download media file from WhatsApp (images, PDFs, etc.)
 */
export async function downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const token = process.env.WHATSAPP_TOKEN!;

  // Step 1: Get media URL
  const metaRes = await fetch(`${WHATSAPP_API}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    throw new Error(`Failed to get media URL: ${metaRes.status}`);
  }

  const meta = await metaRes.json();
  const url = meta.url as string;
  const mimeType = (meta.mime_type as string) || 'application/octet-stream';

  // Step 2: Download the actual file
  const fileRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!fileRes.ok) {
    throw new Error(`Failed to download media: ${fileRes.status}`);
  }

  const arrayBuffer = await fileRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, mimeType };
}

/**
 * Send a text message via WhatsApp
 */
export async function sendTextMessage(to: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_ID!;

  const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('WhatsApp send error:', err);
    throw new Error(`Failed to send WhatsApp message: ${res.status}`);
  }
}

/**
 * Send an interactive button message (for confirm/edit flow)
 */
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_ID!;

  const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('WhatsApp button send error:', err);
  }
}

/**
 * Mark a message as read (blue ticks)
 */
export async function markAsRead(messageId: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_ID!;

  await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

/**
 * Format extracted invoice data as a WhatsApp-friendly message
 */
export function formatInvoiceMessage(data: {
  invoiceNumber?: string;
  fromCompany?: string;
  toCompany?: string;
  totalAmount?: number;
  currency?: string;
  vatAmount?: number;
  issueDate?: string;
  dueDate?: string;
  items?: Array<{ description: string; total: number }>;
}): string {
  const lines: string[] = [];

  lines.push('*Fatura Algilandi*');
  lines.push('');

  if (data.invoiceNumber) lines.push(`*Fatura No:* ${data.invoiceNumber}`);
  if (data.fromCompany) lines.push(`*Gonderen:* ${data.fromCompany}`);
  if (data.toCompany) lines.push(`*Alici:* ${data.toCompany}`);
  lines.push('');

  if (data.items && data.items.length > 0) {
    lines.push('*Kalemler:*');
    data.items.slice(0, 5).forEach((item, i) => {
      const cur = data.currency || 'TRY';
      lines.push(`  ${i + 1}. ${item.description} — ${formatAmount(item.total, cur)}`);
    });
    if (data.items.length > 5) {
      lines.push(`  ... +${data.items.length - 5} kalem daha`);
    }
    lines.push('');
  }

  if (data.vatAmount != null) {
    lines.push(`*KDV:* ${formatAmount(data.vatAmount, data.currency || 'TRY')}`);
  }
  if (data.totalAmount != null) {
    lines.push(`*TOPLAM:* ${formatAmount(data.totalAmount, data.currency || 'TRY')}`);
  }
  lines.push('');

  if (data.issueDate) lines.push(`*Tarih:* ${data.issueDate}`);
  if (data.dueDate) lines.push(`*Vade:* ${data.dueDate}`);

  return lines.join('\n');
}

function formatAmount(amount: number, currency: string): string {
  if (currency === 'TRY' || currency === 'try') {
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;
  }
  if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  if (currency === 'EUR') return `${amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR`;
  return `${amount.toLocaleString()} ${currency}`;
}
