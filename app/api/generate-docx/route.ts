import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Packer,
  convertInchesToTwip
} from "docx";
import { NextResponse } from "next/server";
import type { DownloadOptions, ParsedResume, ResumeAnalysis } from "@/lib/types/resume";

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "resume";
}

function buildSectionTitle(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        font: "Calibri"
      })
    ],
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 4,
        color: "CCCCCC"
      }
    },
    spacing: { before: 240, after: 80 }
  });
}

function splitBulletForHighlight(
  bullet: string,
  strongPhrases: string[],
  highlightStrong: boolean
): TextRun[] {
  if (!highlightStrong || strongPhrases.length === 0) {
    return [new TextRun({ text: bullet, size: 21, font: "Calibri" })];
  }

  const lower = bullet.toLowerCase();
  let found = false;
  for (const phrase of strongPhrases) {
    if (phrase.length >= 3 && lower.includes(phrase.toLowerCase())) {
      found = true;
      break;
    }
  }
  if (!found) {
    return [new TextRun({ text: bullet, size: 21, font: "Calibri" })];
  }

  const runs: TextRun[] = [];
  let remaining = bullet;
  let matchFound = true;
  while (matchFound && remaining.length > 0) {
    matchFound = false;
    for (const phrase of strongPhrases) {
      if (phrase.length < 3) continue;
      const idx = remaining.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx >= 0) {
        if (idx > 0) {
          runs.push(
            new TextRun({ text: remaining.slice(0, idx), size: 21, font: "Calibri" })
          );
        }
        runs.push(
          new TextRun({
            text: remaining.slice(idx, idx + phrase.length),
            bold: true,
            size: 21,
            font: "Calibri"
          })
        );
        remaining = remaining.slice(idx + phrase.length);
        matchFound = true;
        break;
      }
    }
    if (!matchFound && remaining.length > 0) {
      runs.push(new TextRun({ text: remaining, size: 21, font: "Calibri" }));
      break;
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: bullet, size: 21, font: "Calibri" })];
}

export async function POST(req: Request) {
  try {
    const { resume, options, analysis } = (await req.json()) as {
      resume: ParsedResume;
      options: DownloadOptions;
      analysis: ResumeAnalysis;
    };

    if (!resume) {
      return NextResponse.json({ error: "resume required" }, { status: 400 });
    }

    const opts = options ?? {
      applyRewrites: true,
      highlightStrong: true,
      rewriteSummary: false
    };
    const strongPhrases = (analysis?.strongPhrases ?? []).map((p) =>
      typeof p === "string" ? p : (p as { phrase: string }).phrase
    );

    const children: Paragraph[] = [];

    // Name
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.name || "Resume",
            bold: true,
            size: 56,
            font: "Calibri"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 }
      })
    );

    // Contact
    if (resume.contact) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.contact,
              size: 20,
              color: "666666",
              font: "Calibri"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 }
        })
      );
    }

    // Summary
    if (resume.summary) {
      children.push(buildSectionTitle("Summary"));
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: resume.summary, size: 21, font: "Calibri" })
          ],
          spacing: { after: 40 }
        })
      );
    }

    // Experience
    if (resume.experience?.length) {
      children.push(buildSectionTitle("Experience"));
      for (const exp of resume.experience) {
        const titleLine = [
          new TextRun({ text: exp.title, bold: true, size: 24, font: "Calibri" }),
          new TextRun({ text: ` — ${exp.company}`, size: 22, color: "666666", font: "Calibri" }),
          new TextRun({ text: `  |  ${exp.dates}`, size: 20, color: "999999", font: "Calibri" })
        ];
        children.push(
          new Paragraph({
            children: titleLine,
            spacing: { before: 60, after: 20 }
          })
        );
        if (exp.location) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.location, size: 20, color: "888888", font: "Calibri" })
              ],
              spacing: { after: 20 }
            })
          );
        }
        for (const bullet of exp.bullets ?? []) {
          const runs = splitBulletForHighlight(bullet, strongPhrases, opts.highlightStrong);
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: "• ", size: 21, font: "Calibri" }),
                ...runs
              ],
              indent: { left: convertInchesToTwip(0.25) },
              spacing: { after: 40 }
            })
          );
        }
      }
    }

    // Education
    if (resume.education?.length) {
      children.push(buildSectionTitle("Education"));
      for (const edu of resume.education) {
        const line = [
          new TextRun({ text: edu.degree, bold: true, size: 22, font: "Calibri" }),
          new TextRun({ text: ` — ${edu.school}`, size: 22, font: "Calibri" }),
          new TextRun({ text: `  |  ${edu.dates}`, size: 20, color: "888888", font: "Calibri" })
        ];
        children.push(
          new Paragraph({
            children: line,
            spacing: { before: 40, after: 20 }
          })
        );
      }
    }

    // Skills
    if (resume.skills) {
      children.push(buildSectionTitle("Skills"));
      if (resume.skills.categories?.length) {
        for (const cat of resume.skills.categories) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${cat.label}: `, bold: true, size: 21, font: "Calibri" }),
                new TextRun({ text: cat.items, size: 21, font: "Calibri" })
              ],
              spacing: { after: 40 }
            })
          );
        }
      } else if (resume.skills.raw) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: resume.skills.raw, size: 21, font: "Calibri" })
            ],
            spacing: { after: 40 }
          })
        );
      }
    }

    // Projects
    if (resume.projects?.length) {
      children.push(buildSectionTitle("Projects"));
      for (const proj of resume.projects) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.name, bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: proj.tech ? ` (${proj.tech})` : "", size: 21, font: "Calibri" })
            ],
            spacing: { before: 40, after: 20 }
          })
        );
        for (const bullet of proj.bullets ?? []) {
          const runs = splitBulletForHighlight(bullet, strongPhrases, opts.highlightStrong);
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: "• ", size: 21, font: "Calibri" }),
                ...runs
              ],
              indent: { left: convertInchesToTwip(0.25) },
              spacing: { after: 40 }
            })
          );
        }
      }
    }

    // Certifications
    if (resume.certifications?.length) {
      children.push(buildSectionTitle("Certifications"));
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.certifications.join(" | "),
              size: 21,
              font: "Calibri"
            })
          ],
          spacing: { after: 40 }
        })
      );
    }

    // Other sections
    if (resume.otherSections?.length) {
      for (const sec of resume.otherSections) {
        children.push(buildSectionTitle(sec.title));
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: sec.content, size: 21, font: "Calibri" })
            ],
            spacing: { after: 40 }
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1.25),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1.25),
                left: convertInchesToTwip(1)
              }
            }
          },
          children
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${safeFilename(resume.name || "resume")}_updated.docx`;
    const bytes = new Uint8Array(buffer);

    return new Response(bytes, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err) {
    console.error("generate-docx error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
