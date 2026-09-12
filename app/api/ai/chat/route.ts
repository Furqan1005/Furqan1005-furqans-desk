import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";

import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, AI_MODEL, extractText } from "@/lib/ai/anthropic";
import { isDueThisWeek, isOverdue } from "@/lib/issue-utils";
import type { Issue } from "@/lib/types";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "AI is not configured on the server." }, { status: 501 });
  }

  const body: ChatBody = await request.json();
  const messages = (body.messages ?? []).slice(-20);
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const { data: issuesData } = await supabase
    .from("issues")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: false });
  const issues = (issuesData as Issue[]) ?? [];

  const context = issues
    .map((i) => {
      const flags = [isOverdue(i) && "OVERDUE", isDueThisWeek(i) && "due this week"]
        .filter(Boolean)
        .join(", ");
      return `- [${i.status}/${i.priority}] "${i.title}"${i.assigned_to ? ` (assigned: ${i.assigned_to})` : ""}${i.deadline ? ` (deadline: ${i.deadline})` : ""}${flags ? ` [${flags}]` : ""}`;
    })
    .join("\n");

  const system = `You are Desk AI, the assistant inside Furqan's Desk - a personal issue tracker.
Answer questions about the current issue list below using only this data. Be concise and direct.
If asked to do something outside answering/summarizing issue data, say you can only help with issues right now.

Current open issues (${issues.length} not archived):
${context || "(no issues yet)"}`;

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      system,
      messages: messages as Anthropic.MessageParam[],
    });

    return NextResponse.json({ reply: extractText(message) });
  } catch (error) {
    console.error("AI chat failed", error);
    return NextResponse.json({ error: "Failed to get a response." }, { status: 502 });
  }
}
