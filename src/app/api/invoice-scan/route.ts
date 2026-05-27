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

    if (provider === 'anthropic') {
      resultText = await scanWithAnthropic(base64, mediaType, prompt, apiKey);
    } else if (provider === 'openai') {
      resultText = await scanWithOpenAI(base64, mediaType, prompt, apiKey);
    } else {
      return NextResponse.json(
        { error: 'Vision scanning is only supported with Anthropic or OpenAI.' },
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
