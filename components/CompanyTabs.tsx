"use client";

import { companies, type Company } from "@/lib/types";

type Props = {
  value: Company;
  onChange: (company: Company) => void;
  loadingCompany?: Company | null;
};

export function CompanyTabs({ value, onChange, loadingCompany }: Props) {
  return (
    <div
      className="sticky top-[58px] z-40 flex gap-0 overflow-x-auto border-b border-white/50 px-8 backdrop-blur-xl md:px-12"
      style={{ background: "rgba(184,212,245,0.85)" }}
    >
      {companies.map((company) => {
        const active = company === value;
        const loading = loadingCompany === company;
        return (
          <button
            key={company}
            type="button"
            disabled={loading}
            className={`whitespace-nowrap border-b-2.5 border-transparent px-6 py-4 font-display text-xs font-bold tracking-wider transition ${
              active ? "border-ink text-ink" : "text-[rgba(26,26,46,0.5)] hover:text-ink"
            } ${loading ? "opacity-60" : ""}`}
            onClick={() => onChange(company)}
          >
            {company}
          </button>
        );
      })}
    </div>
  );
}
