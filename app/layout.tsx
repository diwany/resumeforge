import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeForge — AI CV, Cover Letter & ATS Optimizer",
  description:
    "Generate ATS-optimized resumes, tailored cover letters, and LinkedIn profiles. Works with OpenAI or free GitHub Models.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
