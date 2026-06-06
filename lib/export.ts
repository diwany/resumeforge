"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Very small Markdown -> docx converter. Handles the subset our prompts emit:
 * #/##/### headings, "- " bullets, **bold**, and blank lines.
 */
function mdToParagraphs(md: string): Paragraph[] {
  const out: Paragraph[] = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, "");
    if (!line.trim()) {
      out.push(new Paragraph({ children: [] }));
      continue;
    }

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^#\s+(.*)$/))) {
      out.push(new Paragraph({ text: m[1], heading: HeadingLevel.TITLE }));
    } else if ((m = line.match(/^##\s+(.*)$/))) {
      out.push(new Paragraph({ text: m[1], heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }));
    } else if ((m = line.match(/^###\s+(.*)$/))) {
      out.push(new Paragraph({ text: m[1], heading: HeadingLevel.HEADING_2, spacing: { before: 120 } }));
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      out.push(new Paragraph({ children: runs(m[1]), bullet: { level: 0 } }));
    } else {
      out.push(new Paragraph({ children: runs(line) }));
    }
  }
  return out;
}

// Parse **bold** segments into TextRuns.
function runs(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) => {
    const b = p.match(/^\*\*([^*]+)\*\*$/);
    return b ? new TextRun({ text: b[1], bold: true }) : new TextRun(p);
  });
}

export async function downloadDocx(markdown: string, filename: string) {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [{ properties: {}, children: mdToParagraphs(markdown) }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}

/**
 * PDF via the browser print dialog (reliable, preserves layout, lets the user
 * "Save as PDF"). Opens a clean print window with the rendered content.
 */
export function downloadPdf(htmlContent: string, title: string) {
  const w = window.open("", "_blank", "width=820,height=1000");
  if (!w) {
    alert("Please allow pop-ups to export a PDF.");
    return;
  }
  w.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
<meta charset="utf-8" />
<style>
  @page { margin: 18mm; }
  body { font-family: Calibri, Arial, sans-serif; color: #0f172a; line-height: 1.45; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 18px 0 8px; color: #0f766e; }
  h3 { font-size: 13px; margin: 12px 0 2px; }
  ul { margin: 4px 0 4px 18px; padding: 0; }
  li { margin: 2px 0; }
  p { margin: 6px 0; }
</style></head><body>${htmlContent}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}
