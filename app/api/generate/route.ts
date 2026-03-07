import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

function buildPrompt(params: {
  numDates: number;
  howMet: string;
  sincerity: number;
  doorOpen: number;
  length: string;
  excuseTheme: string;
}): string {
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

  const lengthDesc =
    params.length === "short"
      ? "2-3 sentences"
      : params.length === "medium"
      ? "4-6 sentences"
      : "7-10 sentences";

  const excuseSection = params.excuseTheme
    ? `Weave in this excuse naturally: "${params.excuseTheme}".`
    : "Use a general 'not feeling a connection' reason.";

  return `Write a text message to send to someone I've been on ${params.numDates} casual date(s) with. We met ${params.howMet}.

The tone should be ${sincerityDesc}. ${doorDesc}. ${excuseSection}

Keep the message to ${lengthDesc}. Write only the message text itself — no subject line, no quotes, no explanation. It should sound natural and human, not like a template.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { numDates, howMet, sincerity, doorOpen, length, excuseTheme } = body;

    if (!numDates || !howMet || sincerity == null || doorOpen == null || !length) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      numDates,
      howMet,
      sincerity,
      doorOpen,
      length,
      excuseTheme: excuseTheme || "",
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system:
        "You are a compassionate and witty assistant that helps people write kind, honest text messages to gently let someone down after casual dating. You write in a natural, human voice — never robotic or template-sounding.",
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
