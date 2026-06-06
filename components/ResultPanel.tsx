"use client";

import { useMemo } from "react";
import { mdToHtml } from "@/lib/markdown";
import { downloadDocx, downloadPdf } from "@/lib/export";
import type { AtsResult } from "@/lib/types";

export default function ResultPanel({
  content,
  ats,
  filename,
}: {
  content: string;
  ats?: AtsResult;
  filename: string;
}) {
  const html = useMemo(() => mdToHtml(content), [content]);

  return (
    <div className="space-y-4">
      {ats && <AtsBadge ats={ats} />}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => downloadPdf(html, filename)} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark">
          Export PDF
        </button>
        <button onClick={() => downloadDocx(content, filename)} className="rounded-lg border border-accent px-3 py-1.5 text-sm font-medium text-accent-dark hover:bg-accent/10">
          Export DOCX
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Copy markdown
        </button>
      </div>

      <div className="prose-doc rounded-xl border border-slate-200 bg-white p-6" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function AtsBadge({ ats }: { ats: AtsResult }) {
  const color = ats.score >= 80 ? "text-emerald-600" : ats.score >= 60 ? "text-amber-600" : "text-red-600";
  const ring = ats.score >= 80 ? "border-emerald-200 bg-emerald-50" : ats.score >= 60 ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50";
  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <div className="flex items-center gap-3">
        <span className={`text-3xl font-bold ${color}`}>{ats.score}</span>
        <div>
          <p className="text-sm font-semibold text-slate-700">ATS match score</p>
          <p className="text-xs text-slate-500">
            {ats.matched.length} of {ats.total} job-description keywords covered
          </p>
        </div>
      </div>
      {ats.missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-600">Missing keywords to consider:</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {ats.missing.map((k) => (
              <span key={k} className="rounded bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
