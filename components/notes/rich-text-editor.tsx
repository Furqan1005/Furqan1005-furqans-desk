"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

import { cn } from "@/lib/utils";

// A minimal rich-text field: a contentEditable div. Browsers natively wire up
// Ctrl+B / Ctrl+I / Ctrl+U for bold/italic/underline inside contentEditable,
// which a plain <textarea> can never do (it can only hold uniform plain text).
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Skip re-syncing innerHTML for changes that originated from this very
    // editor (via handleInput below) - overwriting it here would reset the
    // caret position mid-typing. Only sync when `value` changed for some
    // other reason (switching notes, the other editor instance, etc).
    if (lastEmittedRef.current !== null && value === lastEmittedRef.current) return;
    el.innerHTML = DOMPurify.sanitize(value);
    lastEmittedRef.current = value;
    setIsEmpty(!(el.textContent ?? "").trim());
  }, [value]);

  function handleInput() {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML;
    lastEmittedRef.current = html;
    setIsEmpty(!(el.textContent ?? "").trim());
    onChange(html);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={onBlur}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      autoFocus={autoFocus}
      className={cn("rich-text-editable outline-none", isEmpty && "is-empty", className)}
    />
  );
}
