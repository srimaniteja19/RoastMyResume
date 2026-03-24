"use client";

import { Wrench } from "lucide-react";
import { useState } from "react";
import { FixItMode } from "@/components/FixItMode";
import { ImprovementList } from "@/components/ImprovementList";
import type { ImprovementItem } from "@/lib/types";

type Props = {
  improvements: ImprovementItem[];
  initialScore: number;
};

export function ImprovementPlaybookCard({ improvements, initialScore }: Props) {
  const [fixItMode, setFixItMode] = useState(false);

  return (
    <div className="glass-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="card-eyebrow">Improvement Playbook</div>
        {improvements.length > 0 && !fixItMode && (
          <button
            type="button"
            onClick={() => setFixItMode(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
          >
            <Wrench className="h-4 w-4" />
            Fix it mode
          </button>
        )}
      </div>
      {fixItMode ? (
        <FixItMode
          improvements={improvements}
          initialScore={initialScore}
          onBackToList={() => setFixItMode(false)}
        />
      ) : (
        <ImprovementList improvements={improvements} />
      )}
    </div>
  );
}
