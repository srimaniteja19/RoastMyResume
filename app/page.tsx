"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { extractPdfText } from "@/lib/pdfExtract";
import type { ApiProvider } from "@/lib/types";

const SESSION_API_KEY = "rmr_api_key";
const SESSION_PROVIDER = "rmr_provider";
const SESSION_RESUME_TEXT = "rmr_resume_text";
const SESSION_PDF_BASE64 = "rmr_pdf_base64";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LandingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<ApiProvider>("anthropic");
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const savedKey = sessionStorage.getItem(SESSION_API_KEY) ?? "";
    const savedProvider = (sessionStorage.getItem(SESSION_PROVIDER) as ApiProvider) ?? "anthropic";
    setApiKey(savedKey);
    setProvider(savedProvider);
  }, []);

  async function processFile(file: File) {
    setExtracting(true);
    try {
      let text = "";
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isTxt =
        file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

      if (isPdf) {
        text = await extractPdfText(file);
        const b64 = await fileToBase64(file);
        sessionStorage.setItem(SESSION_PDF_BASE64, b64);
      } else if (isTxt) {
        text = await file.text();
        sessionStorage.removeItem(SESSION_PDF_BASE64);
      } else {
        throw new Error("Please upload a PDF or TXT file.");
      }

      if (!text || text.trim().length < 100) {
        throw new Error("Could not extract enough text. Try a text-based PDF or TXT.");
      }

      setPreview(text.slice(0, 5000));
      sessionStorage.setItem(SESSION_RESUME_TEXT, text);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setExtracting(false);
    }
  }

  function triggerUpload() {
    if (!apiKey) {
      setModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processFile(file);
  }

  function saveKey(nextProvider: ApiProvider, key: string) {
    sessionStorage.setItem(SESSION_API_KEY, key);
    sessionStorage.setItem(SESSION_PROVIDER, nextProvider);
    setApiKey(key);
    setProvider(nextProvider);
    setModalOpen(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dropzoneRef.current?.classList.remove("ring-2", "ring-ink/40");
    const f = e.dataTransfer.files[0];
    if (f) void processFile(f);
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <ApiKeyModal
        open={modalOpen}
        initialKey={apiKey}
        initialProvider={provider}
        onClose={() => setModalOpen(false)}
        onSave={saveKey}
      />

      {/* Soft radial gradient — lighter in center */}
      <div
        className="fixed inset-0 -z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 20%, #e8f3fd 0%, #d4e8fa 35%, #b8d4f5 70%, #a8c8f0 100%)"
        }}
      />

      {/* Subtle clouds */}
      <div className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden opacity-70">
        <div className="absolute left-[-5%] top-[12%] h-16 w-48 animate-drift1 rounded-full bg-white/90 shadow-lg" />
        <div className="absolute right-[8%] top-[20%] h-14 w-40 animate-drift2 rounded-full bg-white/80 shadow-md" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="font-display text-[15px] font-bold tracking-wide text-ink/80">
          RoastMyResume
        </div>
        <button
          type="button"
          className="rounded-full border border-ink/15 bg-white/70 px-5 py-2.5 text-xs font-semibold text-ink/80 shadow-sm backdrop-blur-md transition hover:border-ink/25 hover:bg-white hover:shadow-md"
          onClick={() => setModalOpen(true)}
        >
          🔑 API Key
        </button>
      </nav>

      <div className="relative z-[5] mx-auto flex max-w-[900px] flex-1 flex-col items-center px-6 py-8 text-center md:py-12">
        {/* Floating document + letter tiles — layered */}
        <div className="relative mb-4">
          <div
            className="absolute left-1/2 top-0 h-[380px] w-[300px] -translate-x-1/2 -translate-y-4 rounded-2xl bg-white/95 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
            aria-hidden
            style={{ transform: "translate(-50%, -1rem) rotate(-1.5deg)" }}
          >
            <div className="mx-auto mb-5 h-4 w-2/5 rounded bg-ink/15" />
            <div className="mb-2 h-2 w-4/5 rounded bg-ink/10" />
            <div className="mb-2 h-2 w-full rounded bg-ink/10" />
            <div className="mb-2 h-2 w-3/4 rounded bg-ink/10" />
            <div className="mb-4 h-2 w-1/5 rounded bg-ink/20" />
            <div className="mb-2 h-1.5 w-full rounded bg-ink/8" />
            <div className="mb-2 h-1.5 w-5/6 rounded bg-ink/8" />
            <div className="mb-2 h-1.5 w-2/3 rounded bg-ink/8" />
          </div>

          <p className="relative z-10 mb-3 text-[13px] font-medium tracking-wide text-ink/55">
            Our AI judges it like it&apos;s the final round of Squid Game for
          </p>

          <div className="relative z-10 mb-6 flex items-center justify-center gap-2">
            {["M", "⌘", "A", "G", "N"].map((ch) => (
              <div
                key={ch}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/95 font-display text-xs font-bold text-ink/90 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-serif text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.08] text-ink drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
        >
          Your Resume Has 30s to Live.
          <br />
          <em className="text-[#1a3a6e]">Will It Pass FAANG Recruiter?</em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 w-full max-w-[420px]"
        >
          <div
            ref={dropzoneRef}
            role="button"
            tabIndex={0}
            onClick={triggerUpload}
            onKeyDown={(e) => e.key === "Enter" && triggerUpload()}
            onDragOver={(e) => {
              e.preventDefault();
              dropzoneRef.current?.classList.add("ring-2", "ring-ink/40");
            }}
            onDragLeave={() => dropzoneRef.current?.classList.remove("ring-2", "ring-ink/40")}
            onDrop={handleDrop}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-ink/15 bg-white/60 p-8 text-center shadow-sm backdrop-blur-md transition hover:border-ink/25 hover:bg-white/80"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-white">
                <path
                  d="M10 3v10M6 7l4-4 4 4M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-display text-[15px] font-bold text-ink">Drop your resume here</p>
            <p className="mt-1 text-xs text-ink/50">
              PDF or TXT — processed entirely in your browser
            </p>
          </div>
          <button
            type="button"
            onClick={triggerUpload}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-4 font-display text-sm font-bold text-white shadow-lg transition hover:bg-ink2 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="text-base">↑</span> Upload Resume
          </button>
          <p className="mt-3 text-center text-[11px] italic text-ink/45">* no signup required</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 pb-8 text-center"
        >
          <p className="text-[14px] font-bold text-ink">#1 AI Resume Roaster ★★★★★</p>
          <p className="mt-2 text-xs text-ink/50">
            Trusted by 1,000+ students from Berkeley, Harvard, MIT, Stanford, Georgia Tech
          </p>
        </motion.div>
      </div>

      {extracting && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/50 backdrop-blur-md">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 font-serif text-xl text-white md:text-2xl">
            Extracting text & layout...
          </p>
          <p className="mt-2 text-sm text-white/80">
            Preserving sections, spaces & structure
          </p>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-md">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-white/20 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-ink/60">
                Extracted Text Preview
              </p>
              <span className="text-xs text-ink/40">Layout preserved</span>
            </div>
            <pre className="max-h-[55vh] flex-1 overflow-auto whitespace-pre-wrap px-6 py-5 text-[13px] leading-relaxed text-ink/90">
              {preview}
            </pre>
            <div className="flex flex-wrap gap-3 border-t border-ink/10 px-6 py-5">
              <button
                type="button"
                className="rounded-xl border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/70 transition hover:border-ink/30 hover:bg-ink/5"
                onClick={() => setPreview("")}
              >
                Re-upload
              </button>
              <button
                type="button"
                className="rounded-xl bg-ink px-5 py-2.5 font-display text-sm font-bold text-white transition hover:bg-ink2"
                onClick={() => router.push("/results")}
              >
                Looks good? Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        id="fileInput"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
