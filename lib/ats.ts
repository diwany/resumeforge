import type { AtsResult } from "./types";

// Common words we never treat as meaningful keywords.
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "you", "our", "your", "are", "will", "have", "has",
  "this", "that", "from", "all", "any", "can", "out", "use", "who", "why", "how",
  "what", "when", "where", "their", "they", "them", "his", "her", "its", "but",
  "not", "was", "were", "been", "being", "into", "over", "such", "than", "then",
  "team", "work", "role", "job", "able", "etc", "via", "per", "across", "within",
  "must", "should", "would", "could", "may", "might", "well", "more", "most",
  "other", "some", "each", "about", "also", "like", "while", "years", "year",
  "experience", "ability", "strong", "good", "great", "looking", "join", "help",
  "including", "include", "plus", "preferred", "required", "requirements",
  "responsibilities", "qualifications", "skills", "candidate", "candidates",
]);

// Multi-word / symbol-bearing terms that simple tokenizing would split apart.
const PHRASES = [
  "machine learning", "deep learning", "computer vision", "natural language processing",
  "prompt engineering", "large language models", "data analysis", "data science",
  "full stack", "full-stack", "front end", "front-end", "back end", "back-end",
  "rest api", "ci/cd", "unit testing", "test driven", "object oriented",
  "node.js", "next.js", "react.js", "vue.js", "c++", "c#", ".net", "react native",
  "customer success", "customer support", "product management", "agile",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Pull a deduped set of meaningful keywords out of a job description. */
export function extractKeywords(jd: string): string[] {
  const text = normalize(jd);
  const found = new Set<string>();

  for (const phrase of PHRASES) {
    if (text.includes(phrase)) found.add(phrase);
  }

  // Single tokens: keep letters, digits, +, #, ., -
  const tokens = text.match(/[a-z0-9][a-z0-9+#.\-]*[a-z0-9+#]?/g) || [];
  for (const raw of tokens) {
    const t = raw.replace(/^[.\-]+|[.\-]+$/g, "");
    if (t.length < 3) continue;
    if (STOP_WORDS.has(t)) continue;
    if (/^\d+$/.test(t)) continue; // pure numbers
    found.add(t);
  }

  return Array.from(found);
}

/**
 * Score how well a generated document covers the keywords found in a JD.
 * Returns a 0–100 score plus matched / missing lists.
 */
export function scoreAts(document: string, jd: string): AtsResult {
  const keywords = extractKeywords(jd);
  if (keywords.length === 0) {
    return { score: 0, matched: [], missing: [], total: 0 };
  }

  const doc = normalize(document);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    // Word-boundary-ish check that survives +, #, . in tokens.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(doc)) matched.push(kw);
    else missing.push(kw);
  }

  const score = Math.round((matched.length / keywords.length) * 100);
  // Surface the most useful missing keywords first (longer = more specific).
  missing.sort((a, b) => b.length - a.length);

  return { score, matched, missing: missing.slice(0, 25), total: keywords.length };
}
