"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { extractPdfText } from "@/lib/pdfExtract";
import type { ApiProvider } from "@/lib/types";

const FLOATING_SKILLS = [
  { label: "React", style: { top: "18%", left: "8%", animationDelay: "0s" } },
  { label: "Python", style: { top: "25%", right: "6%", animationDelay: "1s" } },
  { label: "AWS", style: { top: "45%", left: "4%", animationDelay: "2s" } },
  { label: "TypeScript", style: { top: "55%", right: "10%", animationDelay: "0.5s" } },
  { label: "Node.js", style: { bottom: "28%", left: "12%", animationDelay: "1.5s" } },
  { label: "SQL", style: { bottom: "22%", right: "8%", animationDelay: "2.5s" } },
  { label: "ML", style: { top: "12%", left: "22%", animationDelay: "3s" } },
  { label: "Go", style: { top: "38%", right: "3%", animationDelay: "1s" } },
  { label: "K8s", style: { bottom: "35%", right: "18%", animationDelay: "0.8s" } },
  { label: "System Design", style: { top: "8%", right: "15%", animationDelay: "2s" } },
];

const CHECK_ITEMS = ["ATS scan", "Impact bullets", "FAANG fit"];

const SESSION_API_KEY = "rmr_api_key";
const SESSION_PROVIDER = "rmr_provider";
const SESSION_RESUME_TEXT = "rmr_resume_text";
const SESSION_PDF_BASE64 = "rmr_pdf_base64";
const SESSION_CACHE = "rmr_results_cache_v3";

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
      sessionStorage.removeItem(SESSION_CACHE);
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

  const [dropzoneHover, setDropzoneHover] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafafa]">
      {/* Glow blob — pink/lavender radial */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(224,64,251,0.15) 0%, rgba(176,68,255,0.08) 40%, transparent 70%)"
        }}
      />
      <ApiKeyModal
        open={modalOpen}
        initialKey={apiKey}
        initialProvider={provider}
        onClose={() => setModalOpen(false)}
        onSave={saveKey}
      />

      {/* Floating skills — resume-relevant tech tags */}
      <div className="pointer-events-none fixed inset-0 z-0 max-md:opacity-50">
        {FLOATING_SKILLS.map(({ label, style }, i) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
            style={{
              ...style,
              position: "absolute",
              fontSize: "clamp(10px, 1.5vw, 12px)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "rgba(107,33,168,0.8)",
              background: "rgba(224,64,251,0.12)",
              padding: "4px 10px",
              borderRadius: "9999px",
              boxShadow: "0 2px 12px rgba(224,64,251,0.15)",
            }}
            className={["animate-float1", "animate-float2", "animate-float3"][i % 3]}
          >
            {label}
          </motion.span>
        ))}
      </div>

      {/* Floating mini resume card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="pointer-events-none fixed left-1/2 top-[22%] z-[1] hidden -translate-x-[180px] md:block"
        style={{ width: 80 }}
      >
        <div className="animate-resume-float rounded-lg border border-ink/10 bg-white/95 p-3 shadow-lg">
          <div className="mb-2 h-1.5 w-2/3 rounded bg-ink/20" />
          <div className="mb-1.5 h-1 w-full rounded bg-ink/10" />
          <div className="mb-1.5 h-1 w-4/5 rounded bg-ink/10" />
          <div className="h-1 w-2/3 rounded bg-ink/10" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="pointer-events-none fixed right-1/2 top-[26%] z-[1] hidden translate-x-[140px] md:block"
        style={{ width: 72 }}
      >
        <div className="animate-resume-float rounded-lg border border-ink/10 bg-white/95 p-2.5 shadow-lg" style={{ animationDelay: "1s" }}>
          <div className="mb-1.5 h-1 w-3/4 rounded bg-ink/15" />
          <div className="mb-1 h-1 w-full rounded bg-ink/10" />
          <div className="h-1 w-1/2 rounded bg-ink/10" />
        </div>
      </motion.div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <span className="font-handwritten text-2xl font-semibold text-ink">
          RoastMyResume
        </span>
        <button
          type="button"
          className="rounded-full bg-ink/5 px-4 py-2 text-sm font-medium text-ink/80 transition hover:bg-ink/10"
          onClick={() => setModalOpen(true)}
        >
          🔑 API Key
        </button>
      </nav>

      <div className="relative z-[5] mx-auto flex max-w-[520px] flex-1 flex-col items-center px-6 py-16 text-center md:py-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-handwritten text-2xl text-pop md:text-3xl"
        >
          your resume has 30 seconds to live
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] font-bold leading-[1.1] tracking-tight text-ink"
        >
          Will it pass FAANG?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-12 w-full"
        >
          <motion.div
            ref={dropzoneRef}
            role="button"
            tabIndex={0}
            onClick={triggerUpload}
            onKeyDown={(e) => e.key === "Enter" && triggerUpload()}
            onMouseEnter={() => setDropzoneHover(true)}
            onMouseLeave={() => setDropzoneHover(false)}
            onDragOver={(e) => {
              e.preventDefault();
              dropzoneRef.current?.classList.add("ring-2", "ring-pop", "bg-pop-light");
              setDropzoneHover(true);
            }}
            onDragLeave={() => {
              dropzoneRef.current?.classList.remove("ring-2", "ring-pop", "bg-pop-light");
              setDropzoneHover(false);
            }}
            onDrop={handleDrop}
            className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-ink/10 bg-white p-10 text-center transition hover:border-pop/40 hover:bg-pop-light/50"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(224,64,251,0.5)]"
              style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
              animate={dropzoneHover ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 1.5, repeat: dropzoneHover ? Infinity : 0, repeatDelay: 0.5 }}
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="text-white">
                <path
                  d="M10 3v10M6 7l4-4 4 4M3 15h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <p className="font-display text-base font-semibold text-ink">Drop your resume here</p>
            <p className="mt-1 text-sm text-ink/50">PDF or TXT · processed in your browser</p>

            {/* Checklist — appears on hover */}
            <AnimatePresence>
              {dropzoneHover && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2"
                >
                  {CHECK_ITEMS.map((item, i) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 text-xs font-medium text-ink/60"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 + i * 0.1, stiffness: 500 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-green/20 text-accent-green"
                      >
                        <Check strokeWidth={3} size={12} />
                      </motion.span>
                      We check {item}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.button
            type="button"
            onClick={triggerUpload}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-base font-bold text-white shadow-[0_4px_20px_rgba(224,64,251,0.4)] transition-colors"
            style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
            whileHover={{ y: -4, boxShadow: "0 8px 28px rgba(224,64,251,0.45)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="text-lg">↑</span> Upload Resume
          </motion.button>
          <p className="mt-4 text-xs text-ink/40">No signup required</p>
        </motion.div>

      </div>

      {extracting && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/50 backdrop-blur-md">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-white/30"
            style={{ borderTopColor: "#e040fb" }}
          />
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
                className="rounded-xl px-5 py-2.5 font-display text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
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
