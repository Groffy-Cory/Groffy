import {
  analyzeImageWithLocalModel,
  chatWithLocalModel,
  generateWithLocalModel,
} from "@/lib/ai/local-model";

type GrokTextPart = {
  type: "text";
  text: string;
};

type GrokImagePart = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

type GrokMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<GrokTextPart | GrokImagePart>;
};

export type AiCallOptions = {
  /** When true, skip cloud Grok and use the local-model stub (on-prem / Mac Studio later). */
  onPrem?: boolean;
};

/** True when Settings On-Prem Mode is on, or server env ROF_ON_PREM_MODE=1. */
export function isOnPremMode(flag?: boolean): boolean {
  if (flag) return true;
  return process.env.ROF_ON_PREM_MODE === "1";
}

export async function generateWithGrok(
  userPrompt: string,
  systemPrompt =
    "You write warm, clear content for older adults. Use plain language, kindness, and a hopeful tone. Avoid slang and jargon.",
  options?: AiCallOptions,
): Promise<string | null> {
  if (isOnPremMode(options?.onPrem)) {
    return generateWithLocalModel(userPrompt, systemPrompt);
  }
  return completeGrok([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
}

/**
 * Analyze an image with Grok vision (fridge/pantry scan, receipt preview).
 * `imageDataUrl` should be a data:image/...;base64,... URL.
 */
export async function analyzeImageWithGrok(
  imageDataUrl: string,
  userPrompt: string,
  systemPrompt: string,
  options?: AiCallOptions,
): Promise<string | null> {
  if (isOnPremMode(options?.onPrem)) {
    return analyzeImageWithLocalModel();
  }
  return completeGrok(
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: imageDataUrl, detail: "high" },
          },
        ],
      },
    ],
    "grok-2-vision-1212",
  );
}

async function completeGrok(
  messages: GrokMessage[],
  model = "grok-3",
): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || apiKey === "your_xai_api_key") {
    console.error("xAI request skipped: XAI_API_KEY is not configured");
    return null;
  }

  const baseUrl = process.env.XAI_API_BASE_URL || "https://api.x.ai/v1";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages,
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("xAI request failed", {
        model,
        status: response.status,
        statusText: response.statusText,
        error: error.slice(0, 1000),
      });
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (error) {
    console.error("xAI request errored", {
      model,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** Multi-turn companion chat with Grok (or local stub in on-prem mode). */
export async function chatWithGrok(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: AiCallOptions & { companionName?: string },
): Promise<string | null> {
  if (isOnPremMode(options?.onPrem)) {
    return chatWithLocalModel(messages, options?.companionName);
  }
  return completeGrok(messages, "grok-3");
}

export type DetectedPantryItem = {
  name: string;
  quantity?: string;
};

export function parseDetectedItemsJson(
  raw: string | null,
): DetectedPantryItem[] {
  if (!raw) return [];
  try {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): DetectedPantryItem | null => {
        if (!item || typeof item !== "object") return null;
        const row = item as { name?: unknown; quantity?: unknown };
        if (typeof row.name !== "string" || !row.name.trim()) return null;
        return {
          name: row.name.trim(),
          quantity:
            typeof row.quantity === "string" && row.quantity.trim()
              ? row.quantity.trim()
              : "1",
        };
      })
      .filter((item): item is DetectedPantryItem => item !== null);
  } catch {
    return [];
  }
}
