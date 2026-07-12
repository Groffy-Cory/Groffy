/**
 * Local / on-prem AI stub.
 * Placeholder for a future Mac Studio (or other local) model endpoint.
 */

export const LOCAL_MODEL_LABEL = "local-model-stub";

export type LocalChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Warm companion reply without calling cloud AI. */
export async function chatWithLocalModel(
  messages: LocalChatMessage[],
  companionName = "Rofy",
): Promise<string> {
  // Simulate a little thinking time so the UI feedback feels natural
  await delay(350);

  const lastUser = [...messages]
    .reverse()
    .find((message) => message.role === "user")
    ?.content?.trim();

  if (!lastUser) {
    return `Hello — I'm ${companionName}, running on your local hardware. What would you like to talk about?`;
  }

  const shortened =
    lastUser.length > 120 ? `${lastUser.slice(0, 117)}…` : lastUser;

  return [
    `Thank you for sharing that with me.`,
    `I heard you say: “${shortened}”`,
    `I'm ${companionName}, running on local hardware for now.`,
    `A full Mac Studio model can plug in here later — until then, I'm still happy to listen.`,
  ].join(" ");
}

/** Short text generation stub (facts, words, etc.). */
export async function generateWithLocalModel(
  userPrompt: string,
  _systemPrompt?: string,
): Promise<string> {
  await delay(200);
  const topic = userPrompt.replace(/\s+/g, " ").trim().slice(0, 80);
  return `Local note: “${topic || "today"}” — generated on local hardware (Mac Studio model coming soon).`;
}

/** Vision / pantry scan stub. */
export async function analyzeImageWithLocalModel(): Promise<string> {
  await delay(250);
  return JSON.stringify([
    { name: "Eggs", quantity: "4" },
    { name: "Milk", quantity: "1 carton" },
    { name: "Apples", quantity: "3" },
  ]);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
