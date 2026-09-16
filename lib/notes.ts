// Sticky note content is stored as sanitized HTML (from the rich-text editor).
// This strips it down to plain text for contexts that can't render HTML -
// issue titles/descriptions, empty-content checks, etc.
export function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html.replace(/<(div|p|br)[^>]*>/gi, "\n");
  return (div.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
