import { NextRequest } from 'next/server';
import {
  parseWebhookMessage,
  downloadMedia,
  sendTextMessage,
  sendButtonMessage,
  formatInvoiceMessage,
} from '@/lib/whatsapp';

/**
 * GET — Webhook verification (Meta sends a challenge on setup)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp] Webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

/**
 * POST — Receive incoming WhatsApp messages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta sends status updates too — ignore them
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.statuses) {
      // Delivery/read status update — acknowledge silently
      return new Response('OK', { status: 200 });
    }

    const message = parseWebhookMessage(body);

    if (!message) {
      return new Response('OK', { status: 200 });
    }

    console.log(`[WhatsApp] Message from ${message.from}: type=${message.type}`);

    // Handle different message types
    if (message.type === 'document' || message.type === 'image') {
      await handleInvoiceMedia(message);
    } else if (message.type === 'text') {
      await handleTextMessage(message);
    } else {
      await sendTextMessage(
        message.from,
        'Merhaba! Fatura PDF veya fotografini gonderebilirsiniz. Otomatik olarak isleyecegim.'
      );
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error);
    // Always return 200 to prevent Meta from retrying
    return new Response('OK', { status: 200 });
  }
}

/**
 * Handle incoming invoice documents/images
 */
async function handleInvoiceMedia(message: {
  from: string;
  mediaId?: string;
  mimeType?: string;
  fileName?: string;
}) {
  const { from, mediaId, mimeType, fileName } = message;

  if (!mediaId) {
    await sendTextMessage(from, 'Dosya alinamadi. Lutfen tekrar gondermeyi deneyin.');
    return;
  }

  // Send processing indicator
  await sendTextMessage(from, 'Fatura alindi, isleniyor... bir kac saniye bekleyin.');

  try {
    // Download the media file
    const { buffer } = await downloadMedia(mediaId);

    // Convert to base64 for AI analysis
    const base64 = buffer.toString('base64');
    const isImage = mimeType?.startsWith('image/');
    const isPDF = mimeType === 'application/pdf';

    if (!isImage && !isPDF) {
      await sendTextMessage(
        from,
        `Desteklenmeyen dosya turu: ${mimeType}. Lutfen PDF veya resim gonderin.`
      );
      return;
    }

    // Call AI to extract invoice data
    const extracted = await extractInvoiceWithAI(base64, isImage ? 'image' : 'pdf', mimeType || '');

    if (!extracted) {
      await sendTextMessage(
        from,
        'Bu dosyadan fatura bilgisi cikaramadim. Lutfen daha net bir goruntu veya PDF gonderin.'
      );
      return;
    }

    // Format and send the result
    const summary = formatInvoiceMessage(extracted);

    await sendButtonMessage(from, summary, [
      { id: `confirm_${Date.now()}`, title: 'Onayla' },
      { id: `edit_${Date.now()}`, title: 'Duzelt' },
      { id: `cancel_${Date.now()}`, title: 'Iptal' },
    ]);
  } catch (error) {
    console.error('[WhatsApp] Media processing error:', error);
    await sendTextMessage(
      from,
      'Fatura islenirken bir hata olustu. Lutfen tekrar deneyin.'
    );
  }
}

/**
 * Handle text messages (commands, confirmations, etc.)
 */
async function handleTextMessage(message: { from: string; text?: string }) {
  const { from, text } = message;
  const lower = (text || '').toLowerCase().trim();

  if (lower === 'merhaba' || lower === 'hi' || lower === 'hello' || lower === 'selam') {
    await sendTextMessage(
      from,
      '*Merhaba! Ben Remo* — AI destekli fatura asistanin.\n\n' +
        'Bana fatura PDF veya fotografini gonder, otomatik olarak okuyup kaydedeyim.\n\n' +
        '*Komutlar:*\n' +
        '  *ozet* — Bu ayin fatura ozeti\n' +
        '  *vadesi* — Vadesi yaklasan faturalar\n' +
        '  *yardim* — Kullanim kilavuzu'
    );
    return;
  }

  if (lower === 'ozet' || lower === 'summary') {
    // TODO: Pull actual data from database
    await sendTextMessage(
      from,
      '*Bu Ayin Ozeti*\n\n' +
        'Bu ozellik yakinda aktif olacak. Simdilik fatura gondererek baslayabilirsiniz!'
    );
    return;
  }

  if (lower === 'vadesi' || lower === 'overdue' || lower === 'vade') {
    await sendTextMessage(
      from,
      '*Vadesi Yaklasan Faturalar*\n\n' +
        'Bu ozellik yakinda aktif olacak. Simdilik fatura gondererek baslayabilirsiniz!'
    );
    return;
  }

  if (lower === 'yardim' || lower === 'help') {
    await sendTextMessage(
      from,
      '*Remo Kullanim Kilavuzu*\n\n' +
        '1. Fatura PDF veya fotografini gonderin\n' +
        '2. AI otomatik olarak icerigini okur\n' +
        '3. Size ozet gosterir\n' +
        '4. Onaylayin veya duzeltme yapin\n' +
        '5. Fatura sisteme kaydedilir\n\n' +
        '*Desteklenen formatlar:*\n' +
        '- PDF dosyalari\n' +
        '- Fatura fotograflari (JPG, PNG)\n' +
        '- e-Fatura XML'
    );
    return;
  }

  // Default response for unrecognized text
  await sendTextMessage(
    from,
    'Fatura islemek icin PDF veya fotograf gonderin. Yardim icin *yardim* yazin.'
  );
}

/**
 * Extract invoice data using AI (supports both images and PDFs)
 */
async function extractInvoiceWithAI(
  base64: string,
  fileType: 'image' | 'pdf',
  mimeType: string
): Promise<{
  invoiceNumber?: string;
  fromCompany?: string;
  toCompany?: string;
  totalAmount?: number;
  currency?: string;
  vatAmount?: number;
  issueDate?: string;
  dueDate?: string;
  items?: Array<{ description: string; total: number }>;
} | null> {
  const provider = process.env.WHATSAPP_AI_PROVIDER || 'anthropic';
  const apiKey = process.env.WHATSAPP_AI_KEY;

  if (!apiKey) {
    console.error('[WhatsApp] No AI API key configured');
    return null;
  }

  const prompt = `Bu bir Turk faturasi. Asagidaki bilgileri JSON olarak cikar:
{
  "invoiceNumber": "fatura numarasi",
  "fromCompany": "gonderen firma adi",
  "toCompany": "alici firma adi",
  "totalAmount": 12345.67,
  "currency": "TRY",
  "vatAmount": 1234.56,
  "issueDate": "2026-01-15",
  "dueDate": "2026-02-15",
  "items": [
    { "description": "kalem aciklamasi", "quantity": 1, "unitPrice": 100, "vatRate": 20, "total": 120 }
  ]
}

Sadece JSON dondur, baska bir sey yazma. Eger fatura degilse veya okunamiyorsa null dondur.`;

  try {
    if (provider === 'anthropic') {
      return await extractWithAnthropic(base64, fileType, mimeType, prompt, apiKey);
    } else if (provider === 'openai') {
      return await extractWithOpenAI(base64, fileType, mimeType, prompt, apiKey);
    }
    return null;
  } catch (error) {
    console.error('[WhatsApp] AI extraction error:', error);
    return null;
  }
}

async function extractWithAnthropic(
  base64: string,
  fileType: 'image' | 'pdf',
  mimeType: string,
  prompt: string,
  apiKey: string
) {
  const contentParts: Array<Record<string, unknown>> = [];

  if (fileType === 'image') {
    contentParts.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mimeType || 'image/jpeg',
        data: base64,
      },
    });
  } else {
    // For PDFs, send as document
    contentParts.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: base64,
      },
    });
  }

  contentParts.push({ type: 'text', text: prompt });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.1,
      messages: [{ role: 'user', content: contentParts }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[WhatsApp] Anthropic error:', err);
    return null;
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || '';

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  if (cleaned === 'null') return null;

  return JSON.parse(cleaned);
}

async function extractWithOpenAI(
  base64: string,
  fileType: 'image' | 'pdf',
  mimeType: string,
  prompt: string,
  apiKey: string
) {
  const contentParts: Array<Record<string, unknown>> = [];

  if (fileType === 'image') {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType || 'image/jpeg'};base64,${base64}`,
      },
    });
  }

  contentParts.push({ type: 'text', text: prompt });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: contentParts }],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[WhatsApp] OpenAI error:', err);
    return null;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  if (cleaned === 'null') return null;

  return JSON.parse(cleaned);
}
