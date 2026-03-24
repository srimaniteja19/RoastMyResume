"use client";

const STEPS = [
  "Parsing resume structure",
  "Rewriting weak bullets",
  "Enhancing summary",
  "Generating document",
  "Preparing download"
];

type Props = {
  currentStep: number;
};

export function DownloadProgress({ currentStep }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const done = currentStep > stepNum;
          const active = currentStep === stepNum;
          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active ? "bg-[rgba(176,68,255,0.08)]" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                  done
                    ? "bg-[#00c853] text-white"
                    : active
                      ? "bg-[#b044ff] text-white"
                      : "bg-ink/10 text-ink/40"
                }`}
              >
                {done ? "✓" : stepNum}
              </div>
              <span
                className={`text-[13px] font-medium ${
                  done ? "text-ink/60" : active ? "text-ink" : "text-ink/40"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
