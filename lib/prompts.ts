import type { CandidateProfile, DocType, ResumeStyle } from "./types";

const STYLE_GUIDANCE: Record<ResumeStyle, string> = {
  modern: "Modern ATS resume: clean single-column layout, ATS-safe (no tables/columns/graphics), concise and scannable.",
  executive: "Executive resume: lead with leadership scope, business impact, and strategic outcomes. Confident senior tone.",
  technical: "Technical resume: foreground engineering depth, systems built, technologies, and measurable performance gains.",
  academic: "Academic CV: emphasize research, publications, and education; longer-form and formal.",
  student: "Student/graduate resume: highlight education, projects, internships, and transferable skills; potential over tenure.",
};

const HOUSE_STYLE = `
WRITING RULES (follow strictly):
- Sound like an experienced human resume writer, never like AI. Vary sentence structure and length.
- No buzzword soup, no clichés ("results-driven", "team player", "go-getter", "passionate about"), no hype.
- Do NOT use em-dashes in prose. Use plain punctuation.
- Every experience bullet follows Action -> Impact -> Result. Open with a strong verb
  (Led, Built, Engineered, Designed, Implemented, Optimized, Automated, Reduced, Increased, Shipped).
- NEVER fabricate employers, titles, dates, degrees, certifications, metrics, or achievements.
  Only use numbers the candidate supplied. If a bullet lacks a metric, write it well without inventing one.
- Weak input must be strengthened, not embellished with false facts.
  e.g. "Helped customers" -> "Resolved customer inquiries and support requests, keeping accounts active and satisfied."
- Naturally weave in keywords relevant to the target role; never keyword-stuff.
`.trim();

export function profileToText(p: CandidateProfile): string {
  const lines: string[] = [];
  const add = (label: string, val?: string) => {
    if (val && val.trim()) lines.push(`${label}: ${val.trim()}`);
  };

  lines.push("=== CANDIDATE ===");
  add("Full name", p.fullName);
  add("Email", p.email);
  add("Phone", p.phone);
  add("Location", p.location);
  add("LinkedIn", p.linkedin);
  add("GitHub", p.github);
  add("Website/Portfolio", p.website);

  lines.push("\n=== TARGET ===");
  add("Desired role", p.targetRole);
  add("Industry", p.industry);
  add("Seniority", p.seniority);
  add("Target country/market", p.country);

  lines.push("\n=== EDUCATION ===");
  add("Degree", p.degree);
  add("University", p.university);
  add("Graduation", p.gradDate);
  add("GPA", p.gpa);

  if (p.experience?.length) {
    lines.push("\n=== EXPERIENCE ===");
    p.experience.forEach((e, i) => {
      lines.push(`\n[${i + 1}] ${e.title || "(title)"} — ${e.company || "(company)"}`);
      add("  Dates", e.dates);
      add("  Location", e.location);
      if (e.bullets?.trim()) {
        lines.push("  Notes/achievements:");
        e.bullets.split(/\r?\n/).filter(Boolean).forEach((b) => lines.push(`    - ${b.trim()}`));
      }
    });
  }

  if (p.projects?.length) {
    lines.push("\n=== PROJECTS ===");
    p.projects.forEach((pr, i) => {
      lines.push(`\n[${i + 1}] ${pr.name || "(project)"}`);
      add("  Description", pr.description);
      add("  Tech", pr.tech);
    });
  }

  lines.push("\n=== SKILLS & EXTRAS ===");
  add("Skills", p.skills);
  add("Certifications", p.certifications);
  add("Languages", p.languages);
  add("Awards", p.awards);
  add("Additional notes", p.summaryNotes);

  return lines.join("\n");
}

function jdBlock(jd?: string): string {
  if (!jd?.trim()) return "";
  return `\n\n=== TARGET JOB DESCRIPTION (tailor to this; mirror its real terminology) ===\n${jd.trim()}`;
}

export function buildMessages(args: {
  docType: DocType;
  style?: ResumeStyle;
  profile: CandidateProfile;
  jobDescription?: string;
  companyName?: string;
}) {
  const { docType, style = "modern", profile, jobDescription, companyName } = args;
  const profileText = profileToText(profile);
  const jd = jdBlock(jobDescription);

  const system =
    "You are an elite executive resume writer, ATS optimization specialist, recruiter, and career coach. " +
    "You produce truthful, polished, recruiter-ready documents that read as naturally human-written.\n\n" +
    HOUSE_STYLE;

  let task = "";

  switch (docType) {
    case "resume":
      task = `Write a complete, ready-to-send resume for the target role.
${STYLE_GUIDANCE[style]}

Output GitHub-Flavored Markdown with this structure:
# Full Name
One contact line (email · phone · location · LinkedIn · GitHub · portfolio — only those provided), separated by " · ".

## Professional Summary
3–4 sentences: experience level, core expertise, industry focus, and the value the candidate brings to THIS role.

## Skills
Grouped, comma-separated (e.g. "Languages: ...", "Frameworks: ...", "Tools: ..."). Prioritize role-relevant skills.

## Experience
For each role: "### Title — Company" then a line with dates (and location). Then 3–5 "- " bullets, Action -> Impact -> Result.

## Projects
For each: "### Project Name" then 1–2 bullets covering what it does, the tech, and the impact.

## Education
Degree, university, graduation date, GPA if given.

(Add Certifications / Awards / Languages sections only if data exists.)
Keep it to roughly one to two pages of content. Return ONLY the resume markdown.`;
      break;

    case "cover_letter":
      task = `Write a tailored cover letter${companyName ? ` for ${companyName}` : ""}.
Structure: (1) Opening that names the role and shows specific, genuine interest. (2) Body of 1–2 paragraphs
connecting the candidate's real experience and achievements to what this role needs, with a clear value proposition.
(3) Confident closing with a professional call to action.
3–4 short paragraphs, first person, warm but professional. No generic template language. No invented facts.
Return ONLY the letter body in Markdown (start with a greeting, end with "Sincerely," and the name).`;
      break;

    case "linkedin":
      task = `Produce a LinkedIn profile optimization. Output Markdown with these sections:

## Headline options
3 distinct headlines (each under 220 characters) leading with the target role and core value.

## About section
A first-person "About" of 3–4 short paragraphs: hook, what the candidate does and the impact, key skills, and a forward-looking close. Natural and human.

## Experience rewrites
For each role provided, a punchy rewritten description (2–3 lines) optimized for search and skim-reading.

## Skills to list
15–20 relevant skills as a comma-separated list, ordered by relevance to the target role.

## Quick wins
3–5 concrete profile improvements (banner, featured section, keywords, etc.).
Return ONLY the markdown.`;
      break;

    case "ats":
      task = `Produce an ATS optimization report comparing the candidate to the target job description.
The job description is provided below; if none is present, infer the target role's standard requirements.
Output Markdown with:

## Summary
2–3 sentences on overall fit.

## Keyword coverage
A short table or list of important JD keywords and whether the candidate currently demonstrates each (Present / Partial / Missing).

## Recommended keywords to add
Bullet list of specific, truthful keywords/skills the candidate could surface (only ones plausibly true for them).

## Suggestions
4–6 concrete, prioritized edits to raise the match rate (phrasing, placement, sections).

## Optimization decisions
Briefly explain the reasoning so the candidate trusts the changes.
Do not invent experience. Return ONLY the markdown.`;
      break;
  }

  const user = `${task}\n\n${profileText}${jd}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
