import type { KnowledgeSection } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderContent(content: string) {
  // Preserve the author's own line breaks/bullets rather than re-parsing markdown.
  return escapeHtml(content).replace(/\n/g, "<br />");
}

export function buildBlueprintHtml(sections: KnowledgeSection[], categories: string[]) {
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  const toc = sections
    .map((s, i) => `<li><a href="#section-${i}">${escapeHtml(s.title)}</a></li>`)
    .join("\n");

  const body = sections
    .map(
      (s, i) => `
      <section id="section-${i}">
        <h2>${escapeHtml(s.title)}</h2>
        <p>${renderContent(s.content)}</p>
      </section>`
    )
    .join("\n");

  const categoriesList = categories.length
    ? `<ul>${categories.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
    : "<p>No categories configured yet.</p>";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Furqan's Desk - Business Blueprint</title>
<style>
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    max-width: 760px;
    margin: 0 auto;
    padding: 48px 24px 96px;
    color: #1c1f2b;
    line-height: 1.6;
  }
  header {
    border-bottom: 3px solid #362e91;
    padding-bottom: 24px;
    margin-bottom: 32px;
  }
  header .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #362e91;
    color: #fff;
    font-weight: 700;
    margin-bottom: 12px;
  }
  h1 { font-size: 28px; margin: 0 0 4px; }
  .subtitle { color: #666b7a; font-size: 14px; margin: 0; }
  .meta { color: #666b7a; font-size: 13px; margin-top: 8px; }
  h2 {
    font-size: 18px;
    color: #362e91;
    border-bottom: 1px solid #e3e5ec;
    padding-bottom: 6px;
    margin-top: 40px;
  }
  nav {
    background: #f7f8fb;
    border: 1px solid #e3e5ec;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 8px;
  }
  nav h2 { border: none; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
  nav ul { margin: 8px 0 0; padding-left: 20px; }
  nav a { color: #362e91; text-decoration: none; }
  nav a:hover { text-decoration: underline; }
  section p { white-space: normal; }
  footer {
    margin-top: 64px;
    padding-top: 16px;
    border-top: 1px solid #e3e5ec;
    color: #666b7a;
    font-size: 12px;
  }
  @media print {
    body { padding: 0 12px; }
  }
</style>
</head>
<body>
  <header>
    <div class="badge">FA</div>
    <h1>Furqan's Desk - Business Blueprint</h1>
    <p class="subtitle">Nothing falls through the cracks.</p>
    <p class="meta">Generated ${generatedAt}</p>
  </header>

  <nav>
    <h2>Contents</h2>
    <ul>
      ${toc || "<li>No sections yet.</li>"}
      <li><a href="#categories">Issue categories</a></li>
    </ul>
  </nav>

  ${body}

  <section id="categories">
    <h2>Issue categories</h2>
    ${categoriesList}
  </section>

  <footer>
    Exported from Furqan's Desk. Open this file in any browser - use your browser's Print
    (Ctrl/Cmd+P) and "Save as PDF" if you need a PDF copy to send.
  </footer>
</body>
</html>`;
}

export function downloadBlueprint(html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `furqans-desk-blueprint-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
