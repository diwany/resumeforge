// Minimal, dependency-free Markdown -> HTML for the subset our prompts produce.
// Handles headings, bullet lists, bold, and paragraphs. Escapes HTML first.

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
}

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

export function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;

    if ((m = line.match(/^###\s+(.*)$/))) {
      closeList();
      html.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = line.match(/^##\s+(.*)$/))) {
      closeList();
      html.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = line.match(/^#\s+(.*)$/))) {
      closeList();
      html.push(`<h1>${inline(m[1])}</h1>`);
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(m[1])}</li>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join("\n");
}
