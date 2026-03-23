type Props = {
  resumeText: string;
  strongPhrases: string[];
  weakPhrases: string[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, strong: string[], weak: string[]) {
  let output = text;
  strong.forEach((phrase) => {
    if (!phrase) return;
    output = output.replace(
      new RegExp(escapeRegExp(phrase), "gi"),
      `<mark class="hl-strong">${phrase}</mark>`
    );
  });
  weak.forEach((phrase) => {
    if (!phrase) return;
    output = output.replace(
      new RegExp(escapeRegExp(phrase), "gi"),
      `<mark class="hl-weak">${phrase}</mark>`
    );
  });
  return output;
}

export function ResumeHighlights({ resumeText, strongPhrases, weakPhrases }: Props) {
  return (
    <section className="ds-card col-span-full animate-fadeUp [animation-delay:220ms]">
      <div className="ds-card-label">Resume Highlights</div>
      <div
        className="resume-highlight mt-1 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-ink/10 bg-ink/5 p-4 text-sm leading-relaxed text-ink/85"
        dangerouslySetInnerHTML={{
          __html: highlight(resumeText, strongPhrases, weakPhrases)
        }}
      />
    </section>
  );
}
