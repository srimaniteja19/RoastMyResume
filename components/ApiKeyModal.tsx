"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiProvider } from "@/lib/types";

const PROVIDERS: { id: ApiProvider; label: string }[] = [
  { id: "anthropic", label: "Claude" },
  { id: "openai", label: "OpenAI" },
  { id: "gemini", label: "Gemini" }
];

const PLACEHOLDERS: Record<ApiProvider, string> = {
  anthropic: "sk-ant-api03-...",
  openai: "sk-...",
  gemini: "AIza..."
};

type Props = {
  open: boolean;
  initialKey: string;
  initialProvider: ApiProvider;
  onClose: () => void;
  onSave: (provider: ApiProvider, key: string) => void;
};

export function ApiKeyModal({ open, initialKey, initialProvider, onClose, onSave }: Props) {
  const [value, setValue] = useState(initialKey);
  const [provider, setProvider] = useState<ApiProvider>(initialProvider);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(initialKey);
      setProvider(initialProvider);
    }
  }, [open, initialKey, initialProvider]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,20,40,0.6)] p-4 backdrop-blur-[6px]">
      <div className="w-full max-w-[440px] rounded-[20px] bg-white p-10 shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
        <h2 className="font-serif text-[1.7rem] text-ink">Add Your API Key</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[rgba(26,26,46,0.5)]">
          Your key is stored in this browser tab only (sessionStorage) and never sent to our servers.
        </p>

        <div className="mt-4 flex gap-1.5">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProvider(p.id)}
              className={`flex-1 rounded-[10px] border-[1.5px] px-2 py-2 text-center text-[11px] font-semibold transition ${
                provider === p.id
                  ? "border-[#e040fb] text-white"
                  : "border-ink/15 bg-white text-[rgba(26,26,46,0.5)] hover:text-[#b044ff]"
              }`}
              style={provider === p.id ? { background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" } : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative mt-4">
          <input
            type={visible ? "text" : "password"}
            className="w-full rounded-[10px] border-[1.5px] border-ink/15 bg-[#fafafa] py-3 pl-4 pr-11 font-mono text-[13px] text-ink outline-none transition focus:border-ink focus:bg-white"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={PLACEHOLDERS[provider]}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(26,26,46,0.5)] hover:text-ink"
            aria-label="Toggle visibility"
            onClick={() => setVisible((s) => !s)}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 rounded-[10px] bg-[#f0f7ff] px-4 py-3 text-[11.5px] leading-relaxed text-[#2979ff]">
          🔒 Never stored. Erased when tab closes. Used only to call the AI API client-side.
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
            disabled={!value.trim()}
            onClick={() => onSave(provider, value.trim())}
          >
            Save & Continue
          </button>
          <button
            type="button"
            className="rounded-[10px] border-[1.5px] border-ink/15 bg-white px-5 py-3 text-[13px] text-[rgba(26,26,46,0.5)] transition hover:text-ink"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
