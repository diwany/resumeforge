"use client";

import { useEffect, useState } from "react";
import IntakeForm from "@/components/IntakeForm";
import ResultPanel from "@/components/ResultPanel";
import SettingsModal, { Settings } from "@/components/SettingsModal";
import type {
  CandidateProfile,
  DocType,
  GenerateResponse,
  ResumeStyle,
} from "@/lib/types";

const EMPTY_PROFILE: CandidateProfile = {
  fullName: "",
  email: "",
  targetRole: "",
  experience: [{ title: "", company: "", dates: "", location: "", bullets: "" }],
  projects: [],
};

const DOC_TABS: { id: DocType; label: string }[] = [
  { id: "resume", label: "Resume" },
  { id: "cover_letter", label: "Cover letter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "ats", label: "ATS report" },
];

const STYLES: { id: ResumeStyle; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "executive", label: "Executive" },
  { id: "technical", label: "Technical" },
  { id: "academic", label: "Academic" },
  { id: "student", label: "Student" },
];

const SETTINGS_KEY = "resumeforge.settings";
const PROFILE_KEY = "resumeforge.profile";

export default function Home() {
  const [profile, setProfile] = useState<CandidateProfile>(EMPTY_PROFILE);
  const [settings, setSettings] = useState<Settings>({ provider: "github", apiKey: "", model: "" });
  const [showSettings, setShowSettings] = useState(false);

  const [docType, setDocType] = useState<DocType>("resume");
  const [style, setStyle] = useState<ResumeStyle>("modern");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings(JSON.parse(s));
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfile(JSON.parse(p));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist profile as the user types
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [profile]);

  const saveSettings = (s: Settings) => {
    setSettings(s);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
    setShowSettings(false);
  };

  async function generate() {
    setError("");
    setResult(null);

    if (!profile.fullName.trim() || !profile.targetRole.trim()) {
      setError("Add at least your full name and target role.");
      return;
    }
    if (!settings.apiKey) {
      setShowSettings(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          style,
          profile,
          jobDescription,
          companyName,
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
        }),
      });
      const data: GenerateResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const fileBase = `${(profile.fullName || "document").replace(/\s+/g, "_")}_${docType}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Resume<span className="text-accent">Forge</span>
          </h1>
          <p className="text-sm text-slate-500">
            AI resumes, cover letters, LinkedIn & ATS reports. Truthful, ATS-safe, human-sounding.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          {settings.apiKey ? `Settings · ${settings.provider}` : "Add API key"}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: intake */}
        <div>
          <IntakeForm profile={profile} setProfile={setProfile} />
        </div>

        {/* Right: controls + output */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium text-slate-600">Document type</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DOC_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDocType(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    docType === t.id ? "bg-accent text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {docType === "resume" && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as ResumeStyle)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                >
                  {STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {docType === "cover_letter" && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600">Company name</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  placeholder="Acme Inc."
                />
              </div>
            )}

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600">
                Job description {docType === "ats" ? "(recommended)" : "(optional — enables tailoring & ATS score)"}
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-1 min-h-[110px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                placeholder="Paste the job posting here to tailor the output and score keyword match."
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {loading ? "Generating…" : `Generate ${DOC_TABS.find((t) => t.id === docType)?.label}`}
            </button>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {result?.content ? (
            <ResultPanel content={result.content} ats={result.ats} filename={fileBase} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
              Fill in your details, pick a document type, and hit Generate. Your inputs stay in this browser.
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsModal settings={settings} onSave={saveSettings} onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}
