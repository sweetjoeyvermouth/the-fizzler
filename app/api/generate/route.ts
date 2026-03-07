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
  theirMessage?: string;
  theirVibe?: string;
  timeSinceContact?: string;
}): string {
  const nameStr = params.name ? `Their name is ${params.name}.` : "";

  const sincerityDesc =
    params.sincerity <= 2
      ? "very light and casual — treat this like a low-stakes thing, keep it breezy and brief, no heavy emotions at all"
      : params.sincerity <= 4
      ? "casual and friendly — friendly but not intense, like you're texting a friend, not giving a speech"
      : params.sincerity <= 6
      ? "moderately warm — a bit more thoughtful than a casual text but still conversational, not heavy"
      : params.sincerity <= 8
      ? "genuine and heartfelt — this matters to you and that comes through, but you're not overdoing it"
      : "serious and emotionally weighty — give this real gravity, like a meaningful goodbye that deserves care";

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
      ? "Write like a real casual text. Short punchy sentences only. Do not use commas to connect clauses. Mostly lowercase. Abbreviations fine. Fragment sentences are fine."
      : params.grammarLevel <= 6
      ? "Write like a thoughtful text. Short sentences, light on commas. Some proper capitalization but relaxed."
      : params.grammarLevel <= 8
      ? "Write with mostly proper grammar and capitalization. Commas are fine where they help the flow."
      : "Write with perfect grammar, capitalization, and punctuation. Commas throughout where appropriate.";

  const excuseSection = params.excuseTheme
    ? `Weave in this excuse naturally: "${params.excuseTheme}".`
    : "Give a natural reason for stepping back. Do not use the phrases 'romantic spark', 'romantic connection', 'romantic chemistry', or 'not feeling it'. Find a different, specific way to say it.";

  const vibeDesc = params.theirVibe === "really-into-me"
    ? "They seem really into me, so be extra gentle to avoid making them feel bad."
    : params.theirVibe === "intense"
    ? "They've been a bit intense or moving fast, so be clear and firm without being harsh."
    : params.theirVibe === "casual"
    ? "They seemed pretty casual about it too, so the tone can be relaxed and easy."
    : params.theirVibe === "sweet-no-spark"
    ? "They're genuinely sweet and kind, just no romantic spark on my end. Be warm."
    : params.theirVibe === "hard-to-read"
    ? "They're hard to read so I'm not sure how they'll take this. Strike a balanced, careful tone."
    : "";

  const timeDesc = params.timeSinceContact === "today"
    ? "We last talked today."
    : params.timeSinceContact === "yesterday"
    ? "We last talked yesterday."
    : params.timeSinceContact === "few-days"
    ? "It's been a few days since we last talked. Don't make a big deal of the gap but be aware of it."
    : params.timeSinceContact === "week"
    ? "It's been about a week since we last talked. A brief acknowledgment of the gap feels natural."
    : params.timeSinceContact === "weeks"
    ? "It's been 2+ weeks since we last talked. This is a bit of a delayed fizzle, so the message should acknowledge the silence in some way."
    : "";

  const theirMessageSection = params.theirMessage
    ? `They just sent me this message: "${params.theirMessage}"\n\nWrite a response to that message that naturally transitions into letting them down. Acknowledge what they said briefly before getting to the fizzle.`
    : `Write a fizzle text message to send to them.`;

  return `I've been on ${params.numDates} casual date(s) with someone. We met ${params.howMet}. ${nameStr}

${intimacyDesc}
${vibeDesc ? vibeDesc + "\n" : ""}${timeDesc ? timeDesc + "\n" : ""}
${theirMessageSection}

The tone should be ${sincerityDesc}. ${doorDesc}. ${excuseSection}

${grammarDesc}

Keep the message to approximately ${sentenceCount}. Write only the message text itself, nothing else.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, numDates, howMet, sincerity, doorOpen, length, excuseTheme, grammarLevel, intimacy, theirMessage, theirVibe, timeSinceContact } = body;

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
      theirMessage: theirMessage || "",
      theirVibe: theirVibe || "",
      timeSinceContact: timeSinceContact || "",
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: `You are a compassionate and witty assistant that helps people write kind, honest text messages to gently let someone down after casual dating. You write in a natural, human voice.

STRICT RULES:
- Never use em dashes (— or --). Use commas or short sentences instead.
- Never open with "Hey [name]," followed immediately by a compliment.
- Never use these phrases: "I've been doing a lot of thinking", "you're a great person but", "I wish you all the best", "this isn't easy for me to say", "I hope you understand", "you deserve someone who", "take care of yourself", "I think we both know", "on a deeper level", "moving forward", "at this point in my life", or the word "journey".
- Never use the phrases "romantic spark", "romantic connection", "romantic chemistry", or "not feeling it romantically". Find a fresher, more specific way to express stepping back.
- Vary your sentence structure. Do not start multiple sentences the same way.
- Sound like a specific real person texting, not a generic message.`,
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
