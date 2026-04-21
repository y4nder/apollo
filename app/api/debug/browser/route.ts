import { z } from "zod";
import { createStagehandSession } from "../../../lib/stagehand";

export const maxDuration = 600;
export const runtime = "nodejs";

const DEFAULT_URL = "https://www.linkedin.com/feed/";
const DEFAULT_HOLD_SECONDS = 30;
const MAX_HOLD_SECONDS = 300;

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const target = url.searchParams.get("url") ?? DEFAULT_URL;
  const holdRaw = Number(url.searchParams.get("hold") ?? DEFAULT_HOLD_SECONDS);
  const hold = Math.min(
    MAX_HOLD_SECONDS,
    Math.max(0, Number.isFinite(holdRaw) ? holdRaw : DEFAULT_HOLD_SECONDS)
  );

  const startedAt = Date.now();
  const session = await createStagehandSession("debug");

  try {
    const page = session.stagehand.context.activePage();
    if (!page) throw new Error("no active page");

    let gotoError: string | undefined;
    try {
      await page.goto(target, { waitUntil: "domcontentloaded", timeoutMs: 15_000 });
    } catch (err) {
      gotoError = err instanceof Error ? err.message : String(err);
    }

    const finalUrl = page.url();
    const webdriverFlag = await page
      .evaluate(() => (globalThis as { navigator?: { webdriver?: unknown } }).navigator?.webdriver ?? null)
      .catch(() => "eval-failed");

    let snapshot: string | undefined;
    let title: string | undefined;
    let loggedIn: boolean | undefined;
    let loginHint: string | undefined;
    try {
      const extracted = await session.stagehand.extract(
        'Look at this page. Extract: (1) `title`: the page title. (2) `snapshot`: 1-2 sentences describing what is visible. (3) `loggedIn`: true if the signed-in user\'s personal content (feed, profile nav avatar, dashboard) is visible; false if a login/sign-up form, "Join now" CTA, or public guest landing is the primary content. (4) `loginHint`: a short quote or element name that drove your decision.',
        z.object({
          title: z.string(),
          snapshot: z.string(),
          loggedIn: z.boolean(),
          loginHint: z.string().optional(),
        })
      );
      title = extracted.title;
      snapshot = extracted.snapshot;
      loggedIn = extracted.loggedIn;
      loginHint = extracted.loginHint;
    } catch (err) {
      snapshot = `extract failed: ${err instanceof Error ? err.message : String(err)}`;
    }

    if (hold > 0) await new Promise((resolve) => setTimeout(resolve, hold * 1000));

    return Response.json({
      target,
      finalUrl,
      title,
      loggedIn,
      loginHint,
      webdriverFlag,
      snapshot: snapshot?.slice(0, 600),
      gotoError,
      heldSeconds: hold,
      elapsedMs: Date.now() - startedAt,
    });
  } finally {
    try {
      await session.stagehand.close();
    } catch {
      // already closed
    }
  }
}
