import { NextResponse } from "next/server";

import { requireUser } from "@/lib/ai/require-user";
import { getAnthropicClient, AI_MODEL, extractText, parseJsonLoosely } from "@/lib/ai/anthropic";
import { PRIORITY_OPTIONS } from "@/lib/types";

interface SuggestBody {
  title?: string;
  description?: string;
  categories?: string[];
}

interface Suggestion {
  category?: string;
  priority?: string;
  reason?: string;
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "AI is not configured on the server." }, { status: 501 });
  }

  const body: SuggestBody = await request.json();
  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();
  const categories = body.categories ?? [];

  if (title.length < 5) {
    return NextResponse.json({});
  }

  const prompt = `You triage issues for a small internal issue tracker.

Issue title: ${title}
Issue description: ${description || "(none)"}

Existing categories in use: ${categories.length ? categories.join(", ") : "(none yet)"}

Suggest a priority and category for this issue. Priority must be exactly one of: ${PRIORITY_OPTIONS.join(", ")}.
For category, reuse one of the existing categories if it clearly fits; otherwise suggest a short new one (1-3 words).

Reply with ONLY a JSON object, no other text, in this exact shape:
{"priority": "...", "category": "...", "reason": "one short sentence explaining why"}`;

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: prompt }],
    });

    const parsed = parseJsonLoosely<Suggestion>(extractText(message));
    if (!parsed) return NextResponse.json({});

    const priority = PRIORITY_OPTIONS.includes(parsed.priority as (typeof PRIORITY_OPTIONS)[number])
      ? parsed.priority
      : undefined;

    return NextResponse.json({
      priority,
      category: parsed.category?.trim() || undefined,
      reason: parsed.reason,
    });
  } catch (error) {
    console.error("AI suggest failed", error);
    return NextResponse.json({}, { status: 200 });
  }
}
