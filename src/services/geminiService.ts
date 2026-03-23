type GeminiResult = {
  text: string;
};

const DEFAULT_GEMINI_MODEL = "gemini-2.5-pro";

const getGeminiApiKey = () => process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const getGeminiModel = () => process.env.EXPO_PUBLIC_GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

const isLikelyPlaceholderKey = (key?: string) => {
  if (!key) return true;
  const normalized = key.trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes("your_gemini_api_key_here") ||
    normalized.includes("sua_chave_gemini_aqui") ||
    normalized.includes("coloque_sua_chave")
  );
};

const hasValidGeminiKey = () => !isLikelyPlaceholderKey(getGeminiApiKey());

export const geminiService = {
  isConfigured: (): boolean => hasValidGeminiKey(),
  getModelName: (): string => getGeminiModel(),

  generateReportInsights: async (prompt: string): Promise<GeminiResult> => {
    const apiKey = getGeminiApiKey();
    if (!hasValidGeminiKey()) {
      throw new Error("Configure EXPO_PUBLIC_GEMINI_API_KEY para usar IA nos relatórios.");
    }

    const model = getGeminiModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1400,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API falhou: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    const text =
      payload?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text)
        .filter(Boolean)
        .join("\n") || "Sem resposta da IA.";

    return { text };
  },
};
