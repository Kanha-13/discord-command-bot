import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey,
});

export interface ReportAnalysis {
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
}

export async function analyzeReport(
  report: string,
): Promise<ReportAnalysis> {
  const response = await ai.models.generateContent({
    model,
    contents: `
Analyze this user report.

Return ONLY JSON:

{
  "category": "BUG | PAYMENT | ACCOUNT | PERFORMANCE | FEATURE_REQUEST | OTHER",
  "severity": "LOW | MEDIUM | HIGH",
  "summary": "one concise sentence"
}

Report:
${report}
`,
    config: {
      temperature: 0,
      maxOutputTokens: 300,
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  let parsed: ReportAnalysis;

  try {
    parsed = JSON.parse(text) as ReportAnalysis;
  } catch {
    throw new Error(
      `AI returned invalid JSON: ${text}`,
    );
  }

  if (
    typeof parsed.category !== "string" ||
    typeof parsed.summary !== "string" ||
    !["LOW", "MEDIUM", "HIGH"].includes(
      parsed.severity,
    )
  ) {
    throw new Error(
      "AI returned an invalid report analysis.",
    );
  }

  return parsed;
}