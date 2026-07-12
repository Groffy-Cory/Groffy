import { NextResponse } from "next/server";
import { chatWithGrok } from "@/lib/specials/grok";
import { LOCAL_MODEL_LABEL } from "@/lib/ai/local-model";
import { DEFAULT_COMPANION_NAME } from "@/lib/constants";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      companionName?: string;
      history?: ChatTurn[];
      onPremMode?: boolean;
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Please say or type a message first." },
        { status: 400 },
      );
    }

    const companionName =
      body.companionName?.trim().slice(0, 40) || DEFAULT_COMPANION_NAME;
    const onPrem = Boolean(body.onPremMode);

    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

    const systemPrompt = [
      `You are ${companionName}, a warm Real Old Friend companion for older adults.`,
      "Speak in plain, friendly language. Keep replies short (2–5 sentences) unless the person asks for more.",
      "Be patient, kind, and encouraging. Avoid slang, jargon, and medical advice.",
      "If they sound lonely or worried, acknowledge their feelings gently.",
    ].join(" ");

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: systemPrompt },
      ...history
        .filter(
          (turn) =>
            (turn.role === "user" || turn.role === "assistant") &&
            typeof turn.content === "string" &&
            turn.content.trim(),
        )
        .map((turn) => ({
          role: turn.role,
          content: turn.content.trim().slice(0, 2000),
        })),
      { role: "user", content: message.slice(0, 2000) },
    ];

    const reply = await chatWithGrok(messages, {
      onPrem,
      companionName,
    });

    if (reply) {
      return NextResponse.json({
        reply,
        source: onPrem ? LOCAL_MODEL_LABEL : ("grok" as const),
      });
    }

    return NextResponse.json({
      reply: `Thank you for sharing that with me. I'm here with you. (Chat will be even warmer once Grok is connected — for now I'm listening as ${companionName}.)`,
      source: "fallback" as const,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 },
    );
  }
}
