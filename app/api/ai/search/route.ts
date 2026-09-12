import { NextResponse } from "next/server";

import { requireUser } from "@/lib/ai/require-user";
import { getAnthropicClient, AI_MODEL, extractText, parseJsonLoosely } from "@/lib/ai/anthropic";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/types";

interface SearchBody {
  query?: string;
  categories?: string[];
  assignees?: string[];
}

interface ParsedFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  search?: string;
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: SearchBody = await request.json();
  const query = (body.query ?? "").trim();
  if (!query) return NextResponse.json({});

  const client = getAnthropicClient();
  if (!client) {
    // Graceful fallback: treat the whole query as a plain substring search.
    return NextResponse.json({ search: query });
  }

  const categories = body.categories ?? [];
  const assignees = body.assignees ?? [];

  const prompt = `Parse this natural-language search over an issue tracker into structured filters.

Query: "${query}"

Valid statuses: ${STATUS_OPTIONS.join(", ")}
Valid priorities: ${PRIORITY_OPTIONS.join(", ")} (P1=Critical, P2=High, P3=Medium, P4=Low, unless stated otherwise)
Known categories: ${categories.length ? categories.join(", ") : "(none)"}
Known assignees: ${assignees.length ? assignees.join(", ") : "(none)"}

Only set a field if the query clearly implies it; omit fields entirely otherwise. Put any leftover free text
(that isn't a status/priority/category/assignee) into "search" for a plain substring match.

Reply with ONLY a JSON object, no other text, in this exact shape (all fields optional):
{"status": "...", "priority": "...", "category": "...", "assignee": "...", "search": "..."}`;

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: prompt }],
    });

    const parsed = parseJsonLoosely<ParsedFilters>(extractText(message));
    if (!parsed) return NextResponse.json({ search: query });

    const status = STATUS_OPTIONS.includes(parsed.status as (typeof STATUS_OPTIONS)[number])
      ? parsed.status
      : undefined;
    const priority = PRIORITY_OPTIONS.includes(parsed.priority as (typeof PRIORITY_OPTIONS)[number])
      ? parsed.priority
      : undefined;
    const category = categories.find((c) => c.toLowerCase() === parsed.category?.toLowerCase());
    const assignee = assignees.find((a) => a.toLowerCase() === parsed.assignee?.toLowerCase());

    return NextResponse.json({
      status,
      priority,
      category,
      assignee,
      search: parsed.search?.trim() || undefined,
    });
  } catch (error) {
    console.error("AI search parse failed", error);
    return NextResponse.json({ search: query });
  }
}
