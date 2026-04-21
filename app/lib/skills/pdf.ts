import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

// unpdf's bundled pdfjs uses Promise.try, which is only available in Node 23+.
// Polyfill for older runtimes so `extractText` doesn't throw at call time.
{
  const P = Promise as unknown as {
    try?: <T>(fn: (...args: unknown[]) => T, ...args: unknown[]) => Promise<Awaited<T>>;
  };
  if (typeof P.try !== "function") {
    P.try = function <T>(
      fn: (...args: unknown[]) => T,
      ...args: unknown[]
    ): Promise<Awaited<T>> {
      return new Promise((resolve) => resolve(fn(...args) as Awaited<T>));
    };
  }
}

/**
 * Tagged error so routes can map PDF-parse failures to a 400 with a friendly
 * user-facing message instead of a generic 500.
 */
export class PdfParseError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "PdfParseError";
  }
}

/**
 * Extract plain text from a PDF.
 * Collapses runs of whitespace so the output doesn't explode the 20k-char
 * downstream cap on resumes that pad every line with tabs.
 */
export async function extractTextFromPdf(bytes: Uint8Array): Promise<string> {
  let pdf;
  try {
    pdf = await getDocumentProxy(bytes);
  } catch (err) {
    throw new PdfParseError(
      "Could not read this PDF — it may be encrypted or malformed.",
      err,
    );
  }

  let raw: string;
  try {
    const result = await extractText(pdf, { mergePages: true });
    raw = Array.isArray(result.text) ? result.text.join("\n") : result.text;
  } catch (err) {
    throw new PdfParseError("Could not extract text from this PDF.", err);
  }

  // Normalize: unify line endings, collapse long runs of whitespace, trim.
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (normalized.length === 0) {
    throw new PdfParseError(
      "This PDF has no readable text — it may be a scanned image. " +
        "Try pasting the text directly.",
    );
  }

  return normalized;
}
