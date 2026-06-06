"use client";

import type { CandidateProfile, ExperienceItem, ProjectItem } from "@/lib/types";

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none";
const label = "block text-xs font-medium text-slate-600 mb-1";

function Field({
  label: l,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={label}>{l}</label>
      <input className={input} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
      <legend className="px-2 text-sm font-semibold text-accent-dark">{title}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function IntakeForm({
  profile,
  setProfile,
}: {
  profile: CandidateProfile;
  setProfile: (p: CandidateProfile) => void;
}) {
  const set = (patch: Partial<CandidateProfile>) => setProfile({ ...profile, ...patch });

  const setExp = (i: number, patch: Partial<ExperienceItem>) => {
    const experience = profile.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    set({ experience });
  };
  const addExp = () =>
    set({ experience: [...profile.experience, { title: "", company: "", dates: "", location: "", bullets: "" }] });
  const removeExp = (i: number) => set({ experience: profile.experience.filter((_, idx) => idx !== i) });

  const setProj = (i: number, patch: Partial<ProjectItem>) => {
    const projects = profile.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    set({ projects });
  };
  const addProj = () => set({ projects: [...profile.projects, { name: "", description: "", tech: "" }] });
  const removeProj = (i: number) => set({ projects: profile.projects.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <Section title="Personal">
        <Field label="Full name *" value={profile.fullName} onChange={(v) => set({ fullName: v })} />
        <Field label="Email" value={profile.email} onChange={(v) => set({ email: v })} />
        <Field label="Phone" value={profile.phone} onChange={(v) => set({ phone: v })} />
        <Field label="Location" value={profile.location} onChange={(v) => set({ location: v })} />
        <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => set({ linkedin: v })} />
        <Field label="GitHub" value={profile.github} onChange={(v) => set({ github: v })} />
        <Field label="Portfolio / website" value={profile.website} onChange={(v) => set({ website: v })} />
      </Section>

      <Section title="Target role">
        <Field label="Desired role *" value={profile.targetRole} onChange={(v) => set({ targetRole: v })} placeholder="AI / Software Engineer" />
        <Field label="Industry" value={profile.industry} onChange={(v) => set({ industry: v })} />
        <Field label="Seniority" value={profile.seniority} onChange={(v) => set({ seniority: v })} placeholder="Entry / Mid / Senior" />
        <Field label="Target country / market" value={profile.country} onChange={(v) => set({ country: v })} />
      </Section>

      <Section title="Education">
        <Field label="Degree" value={profile.degree} onChange={(v) => set({ degree: v })} />
        <Field label="University" value={profile.university} onChange={(v) => set({ university: v })} />
        <Field label="Graduation date" value={profile.gradDate} onChange={(v) => set({ gradDate: v })} />
        <Field label="GPA (optional)" value={profile.gpa} onChange={(v) => set({ gpa: v })} />
      </Section>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
        <legend className="px-2 text-sm font-semibold text-accent-dark">Experience</legend>
        <div className="space-y-4">
          {profile.experience.map((e, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Job title" value={e.title} onChange={(v) => setExp(i, { title: v })} />
                <Field label="Company" value={e.company} onChange={(v) => setExp(i, { company: v })} />
                <Field label="Dates" value={e.dates} onChange={(v) => setExp(i, { dates: v })} placeholder="Jan 2023 – Present" />
                <Field label="Location" value={e.location} onChange={(v) => setExp(i, { location: v })} />
              </div>
              <div className="mt-3">
                <label className={label}>Responsibilities & achievements (one per line — add metrics where you have them)</label>
                <textarea
                  className={`${input} min-h-[90px]`}
                  value={e.bullets}
                  onChange={(ev) => setExp(i, { bullets: ev.target.value })}
                  placeholder={"Built X that did Y\nManaged 6 client accounts\nShipped a bot handling 50k+ messages/day"}
                />
              </div>
              <button onClick={() => removeExp(i)} className="mt-2 text-xs text-red-500 hover:underline">
                Remove role
              </button>
            </div>
          ))}
          <button onClick={addExp} className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-accent hover:text-accent">
            + Add role
          </button>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
        <legend className="px-2 text-sm font-semibold text-accent-dark">Projects</legend>
        <div className="space-y-4">
          {profile.projects.map((p, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Project name" value={p.name} onChange={(v) => setProj(i, { name: v })} />
                <Field label="Tech used" value={p.tech} onChange={(v) => setProj(i, { tech: v })} />
              </div>
              <div className="mt-3">
                <label className={label}>Description & impact</label>
                <textarea
                  className={`${input} min-h-[60px]`}
                  value={p.description}
                  onChange={(ev) => setProj(i, { description: ev.target.value })}
                />
              </div>
              <button onClick={() => removeProj(i)} className="mt-2 text-xs text-red-500 hover:underline">
                Remove project
              </button>
            </div>
          ))}
          <button onClick={addProj} className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-accent hover:text-accent">
            + Add project
          </button>
        </div>
      </fieldset>

      <Section title="Skills & extras">
        <div className="sm:col-span-2">
          <label className={label}>Skills (comma-separated)</label>
          <textarea className={`${input} min-h-[60px]`} value={profile.skills ?? ""} onChange={(e) => set({ skills: e.target.value })} />
        </div>
        <Field label="Certifications" value={profile.certifications} onChange={(v) => set({ certifications: v })} />
        <Field label="Languages" value={profile.languages} onChange={(v) => set({ languages: v })} />
        <Field label="Awards" value={profile.awards} onChange={(v) => set({ awards: v })} />
        <div className="sm:col-span-2">
          <label className={label}>Anything else worth mentioning</label>
          <textarea className={`${input} min-h-[60px]`} value={profile.summaryNotes ?? ""} onChange={(e) => set({ summaryNotes: e.target.value })} />
        </div>
      </Section>
    </div>
  );
}
