"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Edit3, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ImprovementItem } from "@/lib/types";

const BADGE_STYLES: Record<string, string> = {
  CRITICAL: "bg-[rgba(255,23,68,0.1)] text-[#c0001a]",
  HIGH: "bg-[rgba(255,152,0,0.1)] text-[#e65100]",
  MEDIUM: "bg-[rgba(33,150,243,0.1)] text-[#0d47a1]"
};

const POINTS_PER_PRIORITY: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2
};

type Props = {
  improvements: ImprovementItem[];
  initialScore: number;
  onBackToList?: () => void;
};

export function FixItMode({ improvements, initialScore, onBackToList }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedFixes, setAcceptedFixes] = useState<Record<number, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const item = improvements[currentIndex];
  const total = improvements.length;
  const isComplete = currentIndex >= total;

  function handleAccept() {
    const fixText = isEditing ? editDraft.trim() : item.fix;
    if (!fixText) return;

    setAcceptedFixes((prev) => ({ ...prev, [currentIndex]: fixText }));
    setIsEditing(false);
    setEditDraft("");

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(total);
    }
  }

  function handleEdit() {
    setEditDraft(acceptedFixes[currentIndex] ?? item.fix);
    setIsEditing(true);
  }

  function handleEditAccept() {
    const fixText = editDraft.trim();
    if (!fixText) return;
    setAcceptedFixes((prev) => ({ ...prev, [currentIndex]: fixText }));
    setIsEditing(false);
    setEditDraft("");
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(total);
    }
  }

  if (improvements.length === 0) return null;

  // Completion screen
  if (isComplete) {
    const finalUplift = improvements.reduce(
      (sum, imp) => sum + (POINTS_PER_PRIORITY[imp.priority] ?? 2),
      0
    );
    const finalScore = Math.min(100, Math.round(initialScore + finalUplift));

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-[1.5px] border-[rgba(0,200,83,0.3)] bg-[rgba(200,240,215,0.6)] p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,200,83,0.2)]">
            <Sparkles className="h-8 w-8 text-[#00703a]" />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-[#00703a]">
            All improvements applied
          </h3>
          <p className="mt-2 text-[14px] text-ink/70">
            You&apos;ve addressed all {total} recommended fixes.
          </p>

          {/* Score change */}
          <div className="mt-6 flex items-baseline gap-3">
            <div className="rounded-xl bg-white/80 px-4 py-2">
              <span className="text-[13px] text-ink/60">Before</span>
              <span className="ml-2 font-display text-xl font-bold text-ink/70">
                {initialScore}
              </span>
            </div>
            <span className="text-2xl text-ink/40">→</span>
            <div className="rounded-xl bg-[rgba(0,200,83,0.2)] px-4 py-2">
              <span className="text-[13px] text-[#00703a]">Estimated after</span>
              <span className="ml-2 font-display text-2xl font-extrabold text-[#00703a]">
                {finalScore}
              </span>
              <span className="ml-1 text-[13px] font-semibold text-[#00703a]">
                (+{finalScore - initialScore})
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-ink/50">
            Re-upload your resume to get your new score.
          </p>
          {onBackToList ? (
            <button
              type="button"
              onClick={onBackToList}
              className="mt-6 rounded-xl border border-ink/20 px-5 py-2 text-[13px] font-medium text-ink transition hover:bg-white/60"
            >
              Back to list view
            </button>
          ) : null}
        </div>
      </motion.div>
    );
  }

  const displayFix = isEditing ? editDraft : (acceptedFixes[currentIndex] ?? item.fix);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-ink/60">Fix it mode</span>
          <div className="flex items-center gap-4">
            <span className="text-ink/50">
              {currentIndex + 1} of {total}
            </span>
            {onBackToList ? (
              <button
                type="button"
                onClick={onBackToList}
                className="text-ink/50 underline-offset-2 hover:text-ink hover:underline"
              >
                Back to list
              </button>
            ) : null}
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(26,26,46,0.08)]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #e040fb 0%, #b044ff 100%)"
            }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      </div>

      {/* Current improvement — Problem + Fix */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div
            className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              BADGE_STYLES[item.priority] ?? BADGE_STYLES.MEDIUM
            }`}
          >
            {item.priority} · {item.category}
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink/50">
              Here&apos;s the problem
            </p>
            <p className="text-[14px] font-medium leading-relaxed text-ink">{item.issue}</p>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00703a]">
              Here&apos;s the fix
            </p>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-xl border-[1.5px] border-ink/15 bg-white px-4 py-3 text-[13px] text-ink outline-none transition focus:border-[#b044ff]"
                  placeholder="Edit the fix…"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleEditAccept}
                    disabled={!editDraft.trim()}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                    style={{
                      background:
                        editDraft.trim()
                          ? "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)"
                          : "rgba(26,26,46,0.2)"
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Accept edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-ink/20 px-4 py-2.5 text-[13px] font-medium text-ink transition hover:bg-ink/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-[rgba(0,200,83,0.2)] bg-[rgba(200,240,215,0.3)] p-4 text-[13px] leading-relaxed text-ink">
                {displayFix}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleAccept()}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
              >
                <Check className="h-4 w-4" />
                Accept
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 rounded-xl border-[1.5px] border-ink/20 bg-white px-5 py-2.5 text-[13px] font-medium text-ink transition hover:bg-ink/5"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
