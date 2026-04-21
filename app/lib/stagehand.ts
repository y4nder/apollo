import { Stagehand } from "@browserbasehq/stagehand";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export interface StagehandSession {
  stagehand: Stagehand;
  label: string;
}

function resolveUserDataDir(): string | undefined {
  const raw = process.env.APOLLO_USER_DATA_DIR;
  if (!raw) return undefined;
  if (raw.startsWith("~/")) return path.join(os.homedir(), raw.slice(2));
  return path.resolve(raw);
}

let _diagLogged = false;
function logDiagnosticsOnce(userDataDir: string | undefined, headless: boolean) {
  if (_diagLogged) return;
  _diagLogged = true;
  const chromePath = process.env.APOLLO_CHROME_PATH ?? "(auto-detect)";
  console.log("[apollo/stagehand]", {
    headless,
    userDataDir: userDataDir ?? "(temp)",
    chromePath,
    profileExists: userDataDir ? fs.existsSync(userDataDir) : false,
    cookiesExists: userDataDir
      ? fs.existsSync(path.join(userDataDir, "Default", "Cookies"))
      : false,
  });
}

// Masks the tells LinkedIn/Cloudflare/etc. use to flag CDP-controlled Chrome.
// chrome-launcher launches Chrome with --remote-debugging-port, which sets
// navigator.webdriver=true and a few other giveaways. Run before any page JS.
const STEALTH_INIT_SCRIPT = `
(() => {
  try {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => undefined });
  } catch {}
  try {
    if (!window.chrome) {
      Object.defineProperty(window, 'chrome', { value: { runtime: {} }, configurable: true });
    }
  } catch {}
  try {
    const originalQuery = window.navigator.permissions?.query;
    if (originalQuery) {
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    }
  } catch {}
  try {
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  } catch {}
  try {
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  } catch {}
})();
`;

export async function createStagehandSession(label: string): Promise<StagehandSession> {
  const headless = process.env.APOLLO_HEADLESS !== "false";
  const userDataDir = resolveUserDataDir();
  logDiagnosticsOnce(userDataDir, headless);

  const stagehand = new Stagehand({
    env: "LOCAL",
    model: process.env.APOLLO_STAGEHAND_MODEL ?? "anthropic/claude-haiku-4-5",
    localBrowserLaunchOptions: {
      headless,
      args: ["--disable-blink-features=AutomationControlled"],
      ...(userDataDir ? { userDataDir, preserveUserDataDir: true } : {}),
      ...(process.env.APOLLO_CHROME_PATH
        ? { executablePath: process.env.APOLLO_CHROME_PATH }
        : {}),
    },
    logger: () => {},
    disablePino: true,
  });

  await stagehand.init();

  // Patch navigator.webdriver BEFORE any page script runs on every new document.
  try {
    await stagehand.context.addInitScript(STEALTH_INIT_SCRIPT);
  } catch {
    // If the init-script API is unavailable in this Stagehand version, fall back to
    // per-page injection on first navigation; best-effort only.
  }

  return { stagehand, label };
}

export function getConfiguredConcurrency(): number {
  const raw = process.env.APOLLO_CONCURRENCY;
  const n = raw ? Number(raw) : 1;
  if (!Number.isFinite(n) || n < 1) return 1;
  if (process.env.APOLLO_USER_DATA_DIR && n > 1) return 1;
  return Math.min(n, 4);
}
