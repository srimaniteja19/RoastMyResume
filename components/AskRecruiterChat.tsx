"use client";

import { MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { chatWithRecruiter } from "@/lib/ai";
import type { AnalysisResult, ApiProvider, Company } from "@/lib/types";

type Props = {
  result: AnalysisResult;
  company: Company;
  resumeText: string;
  provider: ApiProvider;
  apiKey: string;
};

type Message = { role: "user" | "assistant"; content: string };

export function AskRecruiterChat({ result, company, resumeText, provider, apiKey }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const nextHistory = [...messages, userMsg];
      const reply = await chatWithRecruiter(
        provider,
        apiKey,
        company,
        resumeText,
        result,
        nextHistory
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-card">
      <div className="card-eyebrow">Ask the recruiter</div>
      <p className="mb-4 text-xs text-ink/55">
        Chat as if you&apos;re talking to a {company} recruiter who just reviewed your resume.
      </p>

      <div className="mb-4 max-h-[340px] min-h-[200px] overflow-y-auto rounded-xl border border-[rgba(26,26,46,0.08)] bg-[rgba(255,255,255,0.6)] p-3">
        {messages.length === 0 ? (
          <div className="flex h-[180px] flex-col items-center justify-center text-center">
            <MessageCircle className="mb-2 h-10 w-10 text-[rgba(26,26,46,0.3)]" />
            <p className="text-[13px] text-ink/50">
              Ask anything — &quot;Why might I get rejected?&quot;, &quot;What&apos;s my biggest
              strength?&quot;, &quot;How should I tailor for a PM role?&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#b044ff] text-white"
                      : "bg-[rgba(26,26,46,0.06)] text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[rgba(26,26,46,0.06)] px-4 py-2.5 text-[13px] text-ink/60">
                  …
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {error ? (
        <p className="mb-3 text-[12px] text-[#c0001a]">⚠ {error}</p>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask a question…"
          className="min-w-0 flex-1 rounded-xl border-[1.5px] border-ink/15 bg-white px-4 py-2.5 text-[13px] text-ink outline-none transition focus:border-[#b044ff]"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!input.trim() || loading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 font-semibold text-white transition disabled:opacity-50"
          style={{
            background:
              input.trim() && !loading
                ? "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)"
                : "rgba(26,26,46,0.2)"
          }}
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </section>
  );
}
