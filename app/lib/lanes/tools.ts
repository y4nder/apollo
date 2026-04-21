import { tool } from "ai";
import { z } from "zod";
import type { Stagehand } from "@browserbasehq/stagehand";

export interface ToolTrace {
  onAction: (text: string) => Promise<void>;
  onObservation: (text: string, link?: string) => Promise<void>;
}

const NAV_TIMEOUT_MS = 10_000;
const SNAPSHOT_RETURN_CHARS = 500;
const VALUE_RETURN_CHARS = 400;
const QUOTE_RETURN_CHARS = 200;

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

function isChromeErrorPage(url: string): boolean {
  return url.startsWith("chrome-error://") || url.startsWith("chrome://network-error");
}

export function makeLaneTools(stagehand: Stagehand, trace: ToolTrace) {
  return {
    search: tool({
      description:
        "Run a web search (Bing, with DuckDuckGo fallback) and return the top organic result titles + URLs. Use this to discover candidate pages before navigating.",
      inputSchema: z.object({
        query: z.string().describe("The search query."),
      }),
      execute: async ({ query }) => {
        await trace.onAction(`search("${query}")`);
        const page = stagehand.context.activePage();
        if (!page) {
          await trace.onObservation("search failed: no active page");
          return { results: [], error: "no active page" };
        }

        const engines: Array<{ name: string; url: string }> = [
          { name: "bing", url: `https://www.bing.com/search?q=${encodeURIComponent(query)}` },
          {
            name: "duckduckgo",
            url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          },
        ];

        let lastError: string | undefined;
        for (const engine of engines) {
          try {
            try {
              await page.goto(engine.url, {
                waitUntil: "domcontentloaded",
                timeoutMs: NAV_TIMEOUT_MS,
              });
            } catch (navErr) {
              const msg = navErr instanceof Error ? navErr.message : String(navErr);
              if (/timeout|ERR_/i.test(msg)) {
                lastError = `${engine.name} unreachable: ${msg}`;
                continue;
              }
              if (!/superseded|interrupted|aborted/i.test(msg)) throw navErr;
              // Redirect or client-nav raced the goto — give the page a moment to settle.
              await page.waitForTimeout(1500);
            }
            if (isChromeErrorPage(page.url())) {
              lastError = `${engine.name} unreachable (chrome-error page)`;
              continue;
            }
            const { results, blocked } = await stagehand.extract(
              "Return the top 5 organic result links from this search results page (skip ads/sponsored/related searches). Set `blocked: true` if the page is a captcha, rate-limit notice, or empty.",
              z.object({
                results: z
                  .array(z.object({ title: z.string(), url: z.string() }))
                  .max(5),
                blocked: z.boolean(),
              })
            );
            if (blocked || results.length === 0) {
              lastError = `${engine.name} returned no usable results${blocked ? " (blocked)" : ""}`;
              continue;
            }
            const summary = results
              .map((r, i) => `${i + 1}. ${r.title} — ${r.url}`)
              .join("\n");
            await trace.onObservation(
              `[${engine.name}] ${results.length} result(s):\n${summary}`
            );
            return { results, engine: engine.name };
          } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
          }
        }

        await trace.onObservation(`search failed on all engines: ${lastError ?? "unknown"}`);
        return { results: [], error: lastError ?? "all search engines failed" };
      },
    }),

    navigate: tool({
      description:
        "Navigate the headless browser to a URL. Use this to open a candidate's profile page, a company's about page, a news article, etc. Returns a short snapshot of the rendered page text.",
      inputSchema: z.object({
        url: z.string().describe("Absolute URL to visit."),
        purpose: z.string().describe("One short sentence: why are you going here?"),
      }),
      execute: async ({ url, purpose }) => {
        await trace.onAction(`navigate(${url}) — ${purpose}`);
        try {
          const page = stagehand.context.activePage();
          if (!page) throw new Error("no active page");
          try {
            await page.goto(url, { waitUntil: "domcontentloaded", timeoutMs: NAV_TIMEOUT_MS });
          } catch (navErr) {
            const msg = navErr instanceof Error ? navErr.message : String(navErr);
            if (/timeout|ERR_/i.test(msg)) {
              await trace.onObservation(`${url} unreachable: ${msg.split("\n")[0]}`);
              return { url, blocked: true, snapshot: "", error: msg };
            }
            if (!/superseded|interrupted|aborted/i.test(msg)) throw navErr;
            await page.waitForTimeout(1500);
          }
          const currentUrlEarly = page.url();
          if (isChromeErrorPage(currentUrlEarly)) {
            await trace.onObservation(`${url} unreachable (connection error)`, currentUrlEarly);
            return { url, blocked: true, snapshot: "", error: "chrome-error page" };
          }
          const { snapshot, blocked } = await stagehand.extract(
            "Return a ~150-word snapshot of the main content. Set `blocked: true` if the page is a login wall, captcha, 403, or empty shell.",
            z.object({
              snapshot: z.string(),
              blocked: z.boolean(),
            })
          );
          const currentUrl = page.url();
          const shortSnap = trunc(snapshot, SNAPSHOT_RETURN_CHARS);
          await trace.onObservation(
            blocked
              ? `page blocked at ${currentUrl} — ${trunc(snapshot, 200)}`
              : `arrived at ${currentUrl}: ${trunc(snapshot, 400)}`,
            currentUrl
          );
          return { url: currentUrl, blocked, snapshot: shortSnap };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await trace.onObservation(`navigation failed: ${msg}`);
          return { url, blocked: true, snapshot: "", error: msg };
        }
      },
    }),

    extract: tool({
      description:
        "Extract a targeted piece of information from the currently loaded page. Provide a plain-English instruction describing exactly what you want (dates, titles, counts, quotes).",
      inputSchema: z.object({
        instruction: z.string().describe("What to pull from the current page."),
      }),
      execute: async ({ instruction }) => {
        await trace.onAction(`extract("${instruction}")`);
        try {
          const page = stagehand.context.activePage();
          if (!page) throw new Error("no active page");
          const result = await stagehand.extract(
            instruction,
            z.object({
              value: z
                .string()
                .describe("The extracted answer, verbatim where possible. Empty string if not found."),
              quote: z.string().optional().describe("A short supporting quote from the page."),
            })
          );
          const currentUrl = page.url();
          await trace.onObservation(
            result.value
              ? `extracted: ${trunc(result.value, 400)}${result.quote ? ` — "${trunc(result.quote, 180)}"` : ""}`
              : "nothing matched the instruction on this page",
            currentUrl
          );
          return {
            value: trunc(result.value ?? "", VALUE_RETURN_CHARS),
            quote: result.quote ? trunc(result.quote, QUOTE_RETURN_CHARS) : undefined,
            url: currentUrl,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await trace.onObservation(`extract failed: ${msg}`);
          return { value: "", error: msg };
        }
      },
    }),
  } as const;
}

export type LaneTools = ReturnType<typeof makeLaneTools>;
