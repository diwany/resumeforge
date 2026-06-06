import { NextRequest, NextResponse } from "next/server";
import { buildMessages } from "@/lib/prompts";
import { chat } from "@/lib/llm";
import { scoreAts } from "@/lib/ats";
import type { GenerateRequest, GenerateResponse, Provider } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { docType, style, profile, jobDescription, companyName, provider, model } = body;

  if (!profile?.fullName || !profile?.targetRole) {
    return NextResponse.json(
      { error: "Please provide at least your full name and target role." },
      { status: 400 }
    );
  }

  // Key resolution: UI-supplied key wins; otherwise fall back to server env.
  const resolvedProvider: Provider = provider === "github" ? "github" : "openai";
  const envKey =
    resolvedProvider === "github" ? process.env.GITHUB_TOKEN : process.env.OPENAI_API_KEY;
  const apiKey = (body.apiKey && body.apiKey.trim()) || envKey || "";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "No API key. Add one in Settings, or set OPENAI_API_KEY / GITHUB_TOKEN in your environment.",
      },
      { status: 401 }
    );
  }

  const envModel =
    resolvedProvider === "github" ? process.env.GITHUB_MODEL : process.env.OPENAI_MODEL;

  try {
    const messages = buildMessages({ docType, style, profile, jobDescription, companyName });
    const content = await chat({
      provider: resolvedProvider,
      apiKey,
      model: model || envModel,
      messages,
      temperature: docType === "ats" ? 0.3 : 0.6,
    });

    const res: GenerateResponse = { content };
    if (jobDescription && jobDescription.trim() && docType !== "ats") {
      res.ats = scoreAts(content, jobDescription);
    }
    return NextResponse.json(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
