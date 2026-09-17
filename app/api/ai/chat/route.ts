import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";

import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, AI_MODEL, extractText } from "@/lib/ai/anthropic";
import { isDueThisWeek, isOverdue } from "@/lib/issue-utils";
import type { FixBankEntry, Issue, KnowledgeSection } from "@/lib/types";

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

  const [{ data: issuesData }, { data: knowledgeData }, { data: fixBankData }] = await Promise.all([
    supabase
      .from("issues")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false }),
    supabase.from("knowledge_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("fix_bank_entries").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  const issues = (issuesData as Issue[]) ?? [];
  const knowledgeSections = (knowledgeData as KnowledgeSection[]) ?? [];
  const fixBankEntries = (fixBankData as FixBankEntry[]) ?? [];

  const context = issues
    .map((i) => {
      const flags = [isOverdue(i) && "OVERDUE", isDueThisWeek(i) && "due this week"]
        .filter(Boolean)
        .join(", ");
      return `- [${i.status}/${i.priority}] "${i.title}"${i.assigned_to ? ` (assigned: ${i.assigned_to})` : ""}${i.deadline ? ` (deadline: ${i.deadline})` : ""}${flags ? ` [${flags}]` : ""}`;
    })
    .join("\n");

  const knowledgeBase = knowledgeSections
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");

  const fixBank = fixBankEntries
    .map((e) => {
      const parts = [`## ${e.title}${e.category ? ` (${e.category})` : ""}`];
      if (e.root_cause) parts.push(`Root cause: ${e.root_cause}`);
      if (e.troubleshooting_steps) parts.push(`Troubleshooting steps: ${e.troubleshooting_steps}`);
      parts.push(`Fix: ${e.fix}`);
      return parts.join("\n");
    })
    .join("\n\n");

  const system = `You are Desk AI, the assistant inside Furqan's Desk - a personal issue tracker
for a jewelry business. You are also the user's business partner who deeply knows the company's
terminology, systems, and processes described in the Business Knowledge Base below, and every
past issue and its fix recorded in the Fix Bank below.

Use the Business Knowledge Base to answer questions about terminology (e.g. what is JEMR/EMR/PDCM),
the order flow, customer codes, priorities, and team roles. Use the Current Open Issues list to
answer questions about what's currently broken, in progress, overdue, or assigned to someone. Use
the Fix Bank to recognize when a new or open issue resembles one that's already been solved, and
proactively suggest the same root cause and fix rather than treating it as unprecedented.

Only use what's written below - never invent process details, systems, or definitions that
aren't stated here. If something isn't covered by any section, say you don't have that
information yet and suggest it be added to Business Knowledge or the Fix Bank.

=== BUSINESS KNOWLEDGE BASE ===
${knowledgeBase || "(no knowledge base sections have been added yet)"}

=== FIX BANK (${fixBankEntries.length} resolved issues on record) ===
${fixBank || "(no fix bank entries yet)"}

=== CURRENT OPEN ISSUES (${issues.length} not archived) ===
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
