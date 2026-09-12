import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, AI_MODEL, extractText } from "@/lib/ai/anthropic";
import { isOverdue, startOfToday } from "@/lib/issue-utils";
import type { Issue } from "@/lib/types";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "AI is not configured on the server." }, { status: 501 });
  }

  const today = startOfToday();
  const todayIso = today.toISOString();

  const [{ data: issuesData }, { data: activityData }] = await Promise.all([
    supabase.from("issues").select("*").eq("archived", false),
    supabase
      .from("activity_log")
      .select("*, issues(title)")
      .gte("created_at", todayIso)
      .order("created_at", { ascending: false }),
  ]);

  const issues = (issuesData as Issue[]) ?? [];
  const overdue = issues.filter(isOverdue);
  const newToday = issues.filter((i) => new Date(i.created_at) >= today);
  const inProgress = issues.filter((i) => i.status === "In Progress");
  const fixedToday = issues.filter((i) => i.fixed_date && new Date(i.fixed_date) >= today);

  const activityLines = (activityData ?? [])
    .map((a: { change_summary: string; issues?: { title?: string } | null }) =>
      `- ${a.issues?.title ? `[${a.issues.title}] ` : ""}${a.change_summary}`
    )
    .join("\n");

  const prompt = `You write short, manager-ready daily status updates for a personal issue tracker called Furqan's Desk.

Today's activity log:
${activityLines || "(no activity logged today)"}

Fixed today (${fixedToday.length}): ${fixedToday.map((i) => i.title).join("; ") || "none"}
In progress (${inProgress.length}): ${inProgress.map((i) => i.title).join("; ") || "none"}
New today (${newToday.length}): ${newToday.map((i) => i.title).join("; ") || "none"}
Overdue (${overdue.length}): ${overdue
    .map((i) => `${i.title}${i.assigned_to ? ` (${i.assigned_to})` : ""}`)
    .join("; ") || "none"}

Write a concise status update grouped into exactly these sections, using this data only (do not invent issues):
Fixed Today, In Progress, New, Overdue.
Skip a section if it has nothing in it. Use short bullet points, no preamble, no sign-off.`;

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({ summary: extractText(message) });
  } catch (error) {
    console.error("AI summarize failed", error);
    return NextResponse.json({ error: "Failed to generate summary." }, { status: 502 });
  }
}
