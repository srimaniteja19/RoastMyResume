import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

type ApiProvider = "anthropic" | "openai" | "gemini";

function getModel(provider: ApiProvider, apiKey: string) {
  switch (provider) {
    case "anthropic":
      return createAnthropic({
        apiKey,
        headers: { "anthropic-dangerous-direct-browser-access": "true" }
      })("claude-sonnet-4-20250514");
    case "openai":
      return createOpenAI({ apiKey })("gpt-4o");
    case "gemini":
      return createGoogleGenerativeAI({ apiKey })("gemini-2.5-flash");
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function getApiConfig(): { provider: ApiProvider; apiKey: string } {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  const gemini = process.env.GEMINI_API_KEY;
  if (anthropic) return { provider: "anthropic", apiKey: anthropic };
  if (openai) return { provider: "openai", apiKey: openai };
  if (gemini) return { provider: "gemini", apiKey: gemini };
  throw new Error("Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env.local");
}

export async function callAi(
  prompt: string,
  system: string,
  options?: { apiKey?: string; provider?: ApiProvider; maxTokens?: number }
): Promise<string> {
  const userKey = options?.apiKey;
  const userProvider = options?.provider;
  let provider: ApiProvider;
  let apiKey: string;

  if (userKey && userProvider && (userProvider === "anthropic" || userProvider === "openai" || userProvider === "gemini")) {
    provider = userProvider;
    apiKey = userKey;
  } else {
    const config = getApiConfig();
    provider = config.provider;
    apiKey = config.apiKey;
  }

  const model = getModel(provider, apiKey);
  const { text } = await generateText({
    model,
    system,
    prompt,
    maxOutputTokens: options?.maxTokens ?? 4000
  });
  return text ?? "";
}
