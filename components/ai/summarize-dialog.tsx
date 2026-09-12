"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function SummarizeDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [errored, setErrored] = useState(false);

  async function generate() {
    setOpen(true);
    setLoading(true);
    setErrored(false);
    try {
      const res = await fetch("/api/ai/summarize", { method: "POST" });
      if (!res.ok) throw new Error("summarize-failed");
      const data = await res.json();
      setText(data.summary ?? "");
    } catch {
      setErrored(true);
      setText("");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard.");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={generate}>
        <Sparkles />
        Generate Today&apos;s Update
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Today&apos;s update</DialogTitle>
            <DialogDescription>
              Generated from today&apos;s activity log and current overdue issues. Edit freely before
              sharing.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Generating…</div>
          ) : errored ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-destructive">
                Couldn&apos;t generate a summary. Make sure ANTHROPIC_API_KEY is configured on the
                server, then try again.
              </p>
              <Button size="sm" variant="outline" onClick={generate} className="w-fit">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-64 font-mono text-sm"
              />
              <Button onClick={copy} className="w-fit">
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy to clipboard"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
