import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

function buildPrompt(params: {
  name?: string;
  numDates: number;
  howMet: string;
  sincerity: number;
  doorOpen: number;
  length: number;
  excuseTheme: string;
  grammarLevel: number;
  intimacy: number;
}): string {
  const nameStr = params.name ? `Their name is ${params.name}.` : "";

  const sincerityDesc =
    params.sincerity <= 3
      ? "polite but not particularly heartfelt"
      : params.sincerity <= 7
      ? "genuinely warm and kind"
      : "deeply sincere and heartfelt";

  const doorDesc =
    params.doorOpen <= 3
      ? "make it clear this is a permanent goodbye with no future possibility"
      : params.doorOpen <= 7
      ? "leave things vaguely open without making promises"
      : "strongly suggest you'd be open to reconnecting someday";

  const intimacyDesc =
    params.intimacy === 1
      ? "We only talked and flirted, no physical contact."
      : params.intimacy === 2
      ? "We kissed (first base). Be appropriately warm given that level of connection."
      : params.intimacy === 3
      ? "We made out / got to second base. Be a bit more delicate and warm given the physical intimacy."
      : params.intimacy === 4
      ? "We got to third base. Be noticeably more gentle and considerate given the significant physical intimacy."
      : "We were fully physically intimate. Be very thoughtful, warm, and delicate given how intimate things got.";

  const sentenceCount =
    params.length <= 2
      ? "1 to 2 sentences"
      : params.length <= 4
      ? "2 to 3 sentences"
      : params.length <= 6
      ? "3 to 5 sentences"
      : params.length <= 8
      ? "5 to 7 sentences"
      : "7 to 10 sentences";

  const grammarDesc =
    params.grammarLevel <= 3
      ? "Write like a real casual text message: mostly lowercase, abbreviations and contractions are fine, very informal. Like how people actually text their friends."
      : params.grammarLevel <= 6
      ? "Write casually like a thoughtful text. Use some proper capitalization but keep it relaxed and natural."
      : params.grammarLevel <= 8
      ? "Write with mostly proper grammar and capitalization, but still conversational."
      : "Write with perfect grammar, capitalization, and punctuation throughout.";

  const excuseSection = params.excuseTheme
    ? `Weave in this excuse naturally: "${params.excuseTheme}".`
    : "Use a gentle 'not feeling a romantic connection' reason.";

  return `Write a text message to send to someone I've been on ${params.numDates} casual date(s) with. We met ${params.howMet}. ${nameStr}

${intimacyDesc}

The tone should be ${sincerityDesc}. ${doorDesc}. ${excuseSection}

${grammarDesc}

Keep the message to approximately ${sentenceCount}. Write only the message text itself, nothing else.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, numDates, howMet, sincerity, doorOpen, length, excuseTheme, grammarLevel, intimacy } = body;

    if (!numDates || !howMet || sincerity == null || doorOpen == null || !length) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      name: name || "",
      numDates,
      howMet,
      sincerity,
      doorOpen,
      length,
      excuseTheme: excuseTheme || "",
      grammarLevel: grammarLevel ?? 5,
      intimacy: intimacy ?? 1,
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "You are a compassionate and witty assistant that helps people write kind, honest text messages to gently let someone down after casual dating. You write in a natural, human voice. Never use em dashes (— or --) anywhere in your messages — they look robotic and AI-generated. Use commas, periods, or just start a new sentence instead.",
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 }
    );
  }
}
