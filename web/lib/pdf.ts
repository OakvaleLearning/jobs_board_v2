import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OAKVALE_GREEN = rgb(0.106, 0.369, 0.125); // #1B5E20
const GOLD = rgb(0.788, 0.635, 0.153); // #C9A227
const INK = rgb(0.13, 0.13, 0.13);

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "spacer" };

/** Splits a plain-text body into headings/paragraphs. A line ending in ":" or
 *  written in ALL CAPS (short) is treated as a heading; blank lines are spacers. */
function toBlocks(body: string): Block[] {
  return body.split(/\r?\n/).map((raw): Block => {
    const line = raw.trim();
    if (!line) return { kind: "spacer" };
    const isHeading =
      (line.length < 60 && line === line.toUpperCase() && /[A-Z]/.test(line)) ||
      /^\d+\.\s/.test(line);
    return isHeading ? { kind: "heading", text: line } : { kind: "paragraph", text: line };
  });
}

function wrap(text: string, font: import("pdf-lib").PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Renders a branded, text-based PDF (contracts, welfare reports). Returns bytes.
 * Deliberately dependency-light: no headless browser, pure pdf-lib.
 */
export async function renderDocumentPdf(opts: {
  title: string;
  subtitle?: string;
  body: string;
  footer?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const newPageIfNeeded = (needed: number) => {
    if (y - needed < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  // Header band
  page.drawRectangle({ x: 0, y: pageHeight - 8, width: pageWidth, height: 8, color: OAKVALE_GREEN });
  page.drawText("OAKVALE JOBS", { x: margin, y, size: 12, font: bold, color: OAKVALE_GREEN });
  y -= 28;
  page.drawText(opts.title, { x: margin, y, size: 20, font: bold, color: INK });
  y -= 6;
  page.drawRectangle({ x: margin, y, width: 48, height: 3, color: GOLD });
  y -= 22;
  if (opts.subtitle) {
    page.drawText(opts.subtitle, { x: margin, y, size: 11, font, color: rgb(0.4, 0.4, 0.4) });
    y -= 24;
  }

  for (const block of toBlocks(opts.body)) {
    if (block.kind === "spacer") {
      y -= 8;
      continue;
    }
    const size = block.kind === "heading" ? 12 : 10.5;
    const useFont = block.kind === "heading" ? bold : font;
    const lineHeight = size + 5;
    if (block.kind === "heading") y -= 6;
    for (const line of wrap(block.text, useFont, size, maxWidth)) {
      newPageIfNeeded(lineHeight);
      page.drawText(line, { x: margin, y, size, font: useFont, color: INK });
      y -= lineHeight;
    }
  }

  if (opts.footer) {
    newPageIfNeeded(40);
    y -= 12;
    page.drawText(opts.footer, { x: margin, y, size: 8.5, font, color: rgb(0.5, 0.5, 0.5) });
  }

  return doc.save();
}
