import type { Language, AnalysisType } from './types';

export function buildAnalysisPrompt(
  text: string,
  analysisType: AnalysisType,
  outputLanguage: Language
): string {
  const languageInstruction =
    outputLanguage === 'auto'
      ? 'Detect the input language and respond in the same language.'
      : outputLanguage === 'tr'
        ? 'Respond entirely in Turkish.'
        : 'Respond entirely in English.';

  const typeInstruction =
    analysisType === 'auto'
      ? 'Automatically detect the document type.'
      : `Treat this as a ${analysisType.replace('_', ' ')} document.`;

  return `You are Remo, a bilingual (Turkish/English) business document analysis AI for SMEs.

TASK: Analyze the following business document and extract structured information.

RULES:
- ${languageInstruction}
- ${typeInstruction}
- Understand Turkish, English, and mixed language input
- Understand informal/WhatsApp-style messages
- Preserve all numbers, currencies, and dates EXACTLY as found
- NEVER invent or assume missing information
- Mark uncertain data explicitly in uncertainFields
- Detect uncertainty language: "maybe", "around", "approximately", "sanırım", "gibi", "olabilir", "tahmini", "civarı", "belki"
- Generate actionable business insights
- Be specific about risks and recommendations

OUTPUT: Return ONLY valid JSON matching this exact schema (no markdown, no code blocks):

{
  "detectedLanguage": "Turkish" | "English" | "Mixed",
  "documentType": "Supplier Offer" | "Invoice" | "Logistics Update" | "Procurement Request" | "Customer Message" | "Payment Reminder" | "General Business Communication",
  "confidenceScore": <0.0 to 1.0>,
  "executiveSummary": "<2-3 sentence business summary>",
  "keyInformation": {
    "companyName": "",
    "supplierOrCustomer": "supplier" | "customer" | "unknown",
    "contactPerson": "",
    "productOrService": "",
    "quantity": "",
    "unitPrice": "",
    "totalPrice": "",
    "currency": "",
    "vatOrTax": "",
    "deliveryDate": "",
    "deliveryTerms": "",
    "paymentTerms": "",
    "invoiceNumber": "",
    "offerNumber": "",
    "dueDate": "",
    "bankDetails": "",
    "countryOrCity": "",
    "incoterms": "",
    "contractOrPenaltyTerms": ""
  },
  "uncertainFields": ["<field names where data is uncertain or approximate>"],
  "missingInformation": ["<important business fields that are missing>"],
  "risks": [
    {
      "severity": "low" | "medium" | "high" | "critical",
      "riskTitle": "",
      "explanation": "",
      "recommendedAction": ""
    }
  ],
  "actionItems": [
    {
      "task": "",
      "ownerSuggestion": "Finance" | "Procurement" | "Logistics" | "Management" | "Legal",
      "urgency": "low" | "medium" | "high" | "critical",
      "suggestedDeadline": "",
      "missingInputNeeded": ""
    }
  ],
  "professionalReplyDraft": "<professional business reply draft>",
  "csvRows": [{"field": "", "value": "", "status": "confirmed" | "uncertain" | "missing"}],
  "rawExtractedText": ""
}

DOCUMENT TO ANALYZE:
---
${text}
---`;
}
