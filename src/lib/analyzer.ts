import type { AnalysisResult, Language, AnalysisType } from './types';
import { buildAnalysisPrompt } from './ai-prompts';
import { v4 as uuid } from 'uuid';

export async function analyzeDocument(
  text: string,
  options: {
    analysisType: AnalysisType;
    outputLanguage: Language;
    apiProvider: 'openai' | 'anthropic' | 'gemini';
    apiKey: string;
    sourceType: 'upload' | 'email' | 'paste';
    fileName?: string;
  }
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(text, options.analysisType, options.outputLanguage);

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Only send a client key/provider if the user explicitly set one;
    // otherwise the server falls back to its own AI_API_KEY / AI_PROVIDER.
    body: JSON.stringify(
      options.apiKey
        ? { prompt, provider: options.apiProvider, apiKey: options.apiKey }
        : { prompt }
    ),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'API request failed');
  }

  const data = await res.json();
  const parsed = JSON.parse(data.result);

  const riskCount = parsed.risks?.filter(
    (r: { severity: string }) => r.severity === 'high' || r.severity === 'critical'
  ).length ?? 0;

  let status: AnalysisResult['status'] = 'new';
  if (riskCount > 0) status = 'high_risk';
  else if (parsed.missingInformation?.length > 2) status = 'missing_info';
  else if (parsed.risks?.length > 0) status = 'needs_review';
  else status = 'ready_to_reply';

  return {
    id: uuid(),
    createdAt: new Date().toISOString(),
    status,
    sourceType: options.sourceType,
    fileName: options.fileName,
    detectedLanguage: parsed.detectedLanguage || 'Unknown',
    documentType: parsed.documentType || 'General',
    confidenceScore: parsed.confidenceScore || 0,
    executiveSummary: parsed.executiveSummary || '',
    keyInformation: parsed.keyInformation || {},
    uncertainFields: parsed.uncertainFields || [],
    missingInformation: parsed.missingInformation || [],
    risks: parsed.risks || [],
    actionItems: parsed.actionItems || [],
    professionalReplyDraft: parsed.professionalReplyDraft || '',
    csvRows: parsed.csvRows || [],
    rawExtractedText: text,
  };
}
