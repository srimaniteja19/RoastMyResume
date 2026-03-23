"use client";

type Props = {
  pitch: string;
};

export function OneLinerPitchCard({ pitch }: Props) {
  if (!pitch?.trim()) return null;

  return (
    <div className="rounded-2xl border-2 border-ink/10 bg-ink/5 p-6">
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
        Your 30-second pitch
      </p>
      <p className="text-[15px] leading-relaxed italic text-ink">
        &ldquo;{pitch}&rdquo;
      </p>
    </div>
  );
}
