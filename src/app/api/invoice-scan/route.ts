import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side invoice scanning via AI vision.
 * Uses the server's AI_API_KEY env var — customers don't need their own key.
 */
export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType } = await req.json();

    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'anthropic';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!base64) {
      return NextResponse.json({ error: 'No file data provided.' }, { status: 400 });
    }

    const prompt = `Bu bir Turk faturasi. Asagidaki bilgileri JSON olarak cikar. Eger fatura degilse null dondur.
{
  "invoiceNumber": "fatura numarasi",
  "fromCompany": "gonderen firma adi",
  "toCompany": "alici firma adi",
  "totalAmount": 12345.67,
  "currency": "TRY",
  "vatAmount": 1234.56,
  "subtotal": 11111.11,
  "issueDate": "2026-01-15",
  "dueDate": "2026-02-15",
  "items": [
    { "description": "kalem aciklamasi", "quantity": 1, "unitPrice": 100, "vatRate": 20, "total": 120 }
  ]
}
Sadece JSON dondur, baska bir sey yazma.`;

    let resultText: string;

    if (provider === 'gemini') {
      resultText = await scanWithGemini(base64, mediaType, prompt, apiKey);
    } else if (provider === 'anthropic') {
      resultText = await scanWithAnthropic(base64, mediaType, prompt, apiKey);
    } else if (provider === 'openai') {
      resultText = await scanWithOpenAI(base64, mediaType, prompt, apiKey);
    } else {
      return NextResponse.json(
        { error: 'Vision scanning is only supported with Gemini, Anthropic, or OpenAI.' },
        { status: 400 }
      );
    }

    const cleaned = resultText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    if (cleaned === 'null') {
      return NextResponse.json({ result: null });
    }

    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ result: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[invoice-scan] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Free-tier Gemini models, tried in order (cheapest/fastest first).
const GEMINI_VISION_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
];

async function scanWithGemini(
  base64: string,
  mediaType: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  // Gemini accepts both images and PDFs as inline_data.
  const mimeType = mediaType.startsWith('image/') ? mediaType : 'application/pdf';

  for (const model of GEMINI_VISION_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64 } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }

    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || '';

    // Model unavailable on this key — try the next one.
    if (msg.includes('not found') || msg.includes('not supported')) continue;

    if (msg.includes('quota') || msg.includes('rate')) {
      throw new Error(
        'Gemini rate limit reached. Wait 30-60 seconds and try again. (Free tier: 15 requests/minute)'
      );
    }

    throw new Error(msg || `Gemini API error: ${res.status}`);
  }

  throw new Error('No available Gemini model found. Check your API key at https://aistudio.google.com/apikey');
}

async function scanWithAnthropic(
  base64: string,
  mediaType: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  const contentParts: Array<Record<string, unknown>> = [];

  if (mediaType.startsWith('image/')) {
    contentParts.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: base64 },
    });
  } else {
    contentParts.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: base64 },
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
    throw new Error(err.error?.message || `Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function scanWithOpenAI(
  base64: string,
  mediaType: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  const contentParts: Array<Record<string, unknown>> = [];

  if (mediaType.startsWith('image/')) {
    contentParts.push({
      type: 'image_url',
      image_url: { url: `data:${mediaType};base64,${base64}` },
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
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
