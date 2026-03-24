"use client";

import type { ParsedResume } from "@/lib/types/resume";

type Props = {
  resume: ParsedResume | null;
};

export function PrintResume({ resume }: Props) {
  if (!resume) return null;

  return (
    <div
      id="print-resume"
      className="fixed left-[-9999px] top-0 w-[210mm] bg-white p-8 print:static print:left-0 print:block"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <div className="pr-name" style={{ fontSize: "18pt", fontWeight: 700, marginBottom: "2pt" }}>
        {resume.name || "Resume"}
      </div>
      {resume.contact ? (
        <div className="pr-contact" style={{ fontSize: "9pt", color: "#555", marginBottom: "12pt" }}>
          {resume.contact}
        </div>
      ) : null}

      {resume.summary ? (
        <>
          <div
            className="pr-section-title"
            style={{
              fontSize: "10pt",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "0.5pt solid #ccc",
              paddingBottom: "2pt",
              margin: "12pt 0 5pt"
            }}
          >
            Summary
          </div>
          <p style={{ fontSize: "10.5pt", lineHeight: 1.55, marginBottom: "12pt" }}>{resume.summary}</p>
        </>
      ) : null}

      {resume.experience?.length ? (
        <>
          <div
            className="pr-section-title"
            style={{
              fontSize: "10pt",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "0.5pt solid #ccc",
              paddingBottom: "2pt",
              margin: "12pt 0 5pt"
            }}
          >
            Experience
          </div>
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "12pt" }}>
              <div style={{ fontSize: "11pt", fontWeight: 700 }}>
                {exp.title} — {exp.company}
              </div>
              <div style={{ fontSize: "9pt", color: "#666", marginBottom: "4pt" }}>
                {exp.dates}
                {exp.location ? ` | ${exp.location}` : ""}
              </div>
              <ul style={{ margin: 0, paddingLeft: "14pt", fontSize: "10.5pt", lineHeight: 1.5 }}>
                {(exp.bullets ?? []).map((b, j) => (
                  <li key={j} className="pr-bullet" style={{ marginBottom: "2pt" }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      ) : null}

      {resume.education?.length ? (
        <>
          <div
            className="pr-section-title"
            style={{
              fontSize: "10pt",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "0.5pt solid #ccc",
              paddingBottom: "2pt",
              margin: "12pt 0 5pt"
            }}
          >
            Education
          </div>
          {resume.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "8pt" }}>
              <strong>{edu.degree}</strong> — {edu.school} | {edu.dates}
            </div>
          ))}
        </>
      ) : null}

      {resume.skills && (resume.skills.raw || resume.skills.categories?.length) ? (
        <>
          <div
            className="pr-section-title"
            style={{
              fontSize: "10pt",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "0.5pt solid #ccc",
              paddingBottom: "2pt",
              margin: "12pt 0 5pt"
            }}
          >
            Skills
          </div>
          {resume.skills.categories?.length ? (
            resume.skills.categories.map((cat, i) => (
              <div key={i} style={{ marginBottom: "4pt", fontSize: "10.5pt" }}>
                <strong>{cat.label}:</strong> {cat.items}
              </div>
            ))
          ) : (
            <p style={{ fontSize: "10.5pt" }}>{resume.skills.raw}</p>
          )}
        </>
      ) : null}

      {resume.projects?.length ? (
        <>
          <div
            className="pr-section-title"
            style={{
              fontSize: "10pt",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "0.5pt solid #ccc",
              paddingBottom: "2pt",
              margin: "12pt 0 5pt"
            }}
          >
            Projects
          </div>
          {resume.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "8pt" }}>
              <strong>{proj.name}</strong>
              {proj.tech ? ` (${proj.tech})` : ""}
              <ul style={{ margin: "4pt 0 0 14pt", padding: 0, fontSize: "10.5pt" }}>
                {(proj.bullets ?? []).map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
