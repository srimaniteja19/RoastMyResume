type TextItemLike = {
  str: string;
  transform: number[];
  width: number;
  height: number;
};

function isTextItem(item: unknown): item is TextItemLike {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof (item as TextItemLike).str === "string" &&
    "transform" in item &&
    Array.isArray((item as TextItemLike).transform)
  );
}

function extractPageText(items: unknown[]): string {
  const textItems = items.filter(isTextItem).filter((i) => i.str.trim().length > 0);
  if (textItems.length === 0) return "";

  const getX = (item: TextItemLike) => item.transform[4] ?? 0;
  const getY = (item: TextItemLike) => item.transform[5] ?? 0;

  const itemsWithPos = textItems.map((item) => ({
    str: item.str,
    x: getX(item),
    y: getY(item),
    right: getX(item) + (item.width ?? 0),
    height: item.height ?? 10
  }));

  itemsWithPos.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 2) return yDiff;
    return a.x - b.x;
  });

  const totalWidth = itemsWithPos.reduce((s, i) => s + (i.right - i.x), 0);
  const totalChars = itemsWithPos.reduce((s, i) => s + i.str.length, 0);
  const avgCharWidth = totalChars > 0 ? totalWidth / totalChars : 4;
  const spaceThreshold = Math.max(1, avgCharWidth * 0.2);

  const lineYTolerance = Math.max(2, avgCharWidth * 0.5);
  const sectionGap = Math.max(10, avgCharWidth * 2);

  const lines: string[][] = [];
  let currentLine: { y: number; items: typeof itemsWithPos } = {
    y: itemsWithPos[0].y,
    items: []
  };

  for (const item of itemsWithPos) {
    const yDiff = Math.abs(item.y - currentLine.y);
    if (yDiff <= lineYTolerance) {
      currentLine.items.push(item);
    } else {
      if (currentLine.items.length > 0) {
        lines.push(buildLine(currentLine.items, spaceThreshold));
      }
      const isNewSection = currentLine.y - item.y > sectionGap;
      currentLine = { y: item.y, items: [item] };
      if (isNewSection && lines.length > 0) {
        lines.push([]);
      }
    }
  }
  if (currentLine.items.length > 0) {
    lines.push(buildLine(currentLine.items, spaceThreshold));
  }

  const result = lines
    .map((parts) => parts.join("").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  return result.replace(/\n{3,}/g, "\n\n").trim();
}

function buildLine(items: { str: string; x: number; right: number }[], spaceThreshold: number): string[] {
  items.sort((a, b) => a.x - b.x);
  const parts: string[] = [];
  let lastRight = -Infinity;

  for (const item of items) {
    const gap = item.x - lastRight;
    if (lastRight > -Infinity && gap > spaceThreshold) {
      parts.push(" ");
    }
    parts.push(item.str);
    lastRight = item.right;
  }
  return parts;
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent({ disableNormalization: false });
    const pageText = extractPageText(textContent.items);
    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}
