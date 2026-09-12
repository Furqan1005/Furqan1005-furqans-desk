"use client";

import { useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function DeskAiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get a response.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  return (
    <div className="flex h-[calc(100svh-7.5rem)] flex-col gap-3">
      <div>
        <h1 className="text-lg font-semibold">Desk AI</h1>
        <p className="text-sm text-muted-foreground">
          Ask about your current issues, or your business terms and processes - JEMR, EMR,
          order flow, customer codes. Grounded in Settings → Business Knowledge.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-lg border border-border bg-card p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Sparkles className="size-6 text-primary" />
            <p>Try: &quot;What&apos;s overdue right now?&quot;</p>
            <p>or: &quot;What is JEMR?&quot; / &quot;Walk me through the order flow.&quot;</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                Thinking…
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask Desk AI about your issues…"
          className="min-h-11 flex-1 resize-none"
          rows={1}
        />
        <Button type="submit" disabled={loading || !input.trim()} size="icon">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
