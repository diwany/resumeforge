// Shared types for ResumeForge

export type Provider = "openai" | "github";

export type DocType = "resume" | "cover_letter" | "linkedin" | "ats";

export type ResumeStyle = "modern" | "executive" | "technical" | "academic" | "student";

export interface ExperienceItem {
  title: string;
  company: string;
  dates: string;
  location?: string;
  bullets: string; // free text, one achievement per line
}

export interface ProjectItem {
  name: string;
  description: string;
  tech?: string;
}

export interface CandidateProfile {
  // Personal
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;

  // Target
  targetRole: string;
  industry?: string;
  seniority?: string;
  country?: string;

  // Education
  degree?: string;
  university?: string;
  gradDate?: string;
  gpa?: string;

  // Experience & projects
  experience: ExperienceItem[];
  projects: ProjectItem[];

  // Skills & extras
  skills?: string;
  certifications?: string;
  languages?: string;
  awards?: string;

  // Free text the model can mine
  summaryNotes?: string;
}

export interface GenerateRequest {
  docType: DocType;
  style?: ResumeStyle;
  profile: CandidateProfile;
  jobDescription?: string;
  companyName?: string;
  provider: Provider;
  apiKey: string;
  model?: string;
}

export interface AtsResult {
  score: number;
  matched: string[];
  missing: string[];
  total: number;
}

export interface GenerateResponse {
  content: string;
  ats?: AtsResult; // present when a JD is provided
  error?: string;
}
