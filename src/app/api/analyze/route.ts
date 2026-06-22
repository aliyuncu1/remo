import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
];

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    }

    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || '';

    if (msg.includes('not found') || msg.includes('not supported')) {
      continue;
    }

    if (msg.includes('quota') || msg.includes('rate')) {
      throw new Error(
        `Gemini rate limit reached (${model}). Wait 30-60 seconds and try again. Free tier: 15 requests/minute.`
      );
    }

    throw new Error(msg || `Gemini API error: ${res.status}`);
  }

  throw new Error('No available Gemini model found. Check your API key at https://aistudio.google.com/apikey');
}

async function callOpenAICompatible(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  models: string[],
  label: string
): Promise<string> {
  let lastError = '';
  for (const model of models) {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    }

    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || err.message || '';
    lastError = msg;
    if (res.status === 404 || msg.includes('not found') || msg.includes('unknown_model') || msg.includes('decommissioned')) continue;
    if (res.status === 429 || msg.toLowerCase().includes('rate')) {
      throw new Error(`${label} rate limit reached. Wait a moment and try again.`);
    }
    throw new Error(msg || `${label} API error: ${res.status}`);
  }
  throw new Error(lastError || `No available ${label} model found.`);
}

async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || '';
    if (res.status === 401) {
      throw new Error('Invalid API key. Check your Anthropic key in Settings.');
    }
    if (res.status === 429) {
      throw new Error('Rate limit reached. Wait a few seconds and try again.');
    }
    if (msg.includes('credit') || msg.includes('billing')) {
      throw new Error('Insufficient credits. Add funds at console.anthropic.com.');
    }
    throw new Error(msg || `Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider, apiKey } = await req.json();

    // Use client-provided key, or fall back to server-side env var
    const resolvedKey = apiKey || process.env.AI_API_KEY || '';
    const resolvedProvider = provider || process.env.AI_PROVIDER || 'anthropic';

    if (!resolvedKey) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json({ error: 'No content to analyze.' }, { status: 400 });
    }

    let result: string;

    if (resolvedProvider === 'github') {
      result = await callOpenAICompatible(
        prompt, resolvedKey,
        'https://models.github.ai/inference/chat/completions',
        ['openai/gpt-4o', 'openai/gpt-4o-mini'],
        'GitHub Models'
      );
    } else if (resolvedProvider === 'groq') {
      result = await callOpenAICompatible(
        prompt, resolvedKey,
        'https://api.groq.com/openai/v1/chat/completions',
        ['meta-llama/llama-4-scout-17b-16e-instruct', 'meta-llama/llama-4-maverick-17b-128e-instruct'],
        'Groq'
      );
    } else if (resolvedProvider === 'gemini') {
      result = await callGemini(prompt, resolvedKey);
    } else if (resolvedProvider === 'anthropic') {
      result = await callAnthropic(prompt, resolvedKey);
    } else {
      result = await callOpenAI(prompt, resolvedKey);
    }

    const cleaned = result
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: cleaned });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
