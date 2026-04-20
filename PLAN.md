# Apollo MVP — Resume Analysis + Agent-Driven Background Check

## Context

Building an MVP at `/home/yander/Documents/codes/apollo_stack/apollo` (fresh Next.js 16.2.4 + React 19 + Tailwind v4 + strict TS, nothing else). A hiring manager drops a candidate's PDF; four parallel **mini-agents** verify resume claims and stream their reasoning + browser actions back to the UI in real time. The "research agent" concept is borrowed from the sibling `browserbase-nextjs-template` (Browserbase + Stagehand + SSE + AI SDK), but each lane is upgraded from a scripted extraction into a short Claude tool-use loop — so the UI can show "thought → action → observation → finding" as the agent digs. Output is a per-claim verification report.

**Reference repo (read-only):** `/home/yander/Documents/codes/apollo_stack/browserbase-nextjs-template`

**Warning:** Apollo's `AGENTS.md` says "This is NOT the Next.js you know." Before writing anything Next-specific (route config, fonts, dynamic imports), check `node_modules/next/dist/docs/01-app/...`. Route handlers confirmed working with standard `Request`/`Response` APIs + `maxDuration` export (verified in `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`).

## Confirmed scope (from user)

- Perspective: **hiring-side vetting**
- Input: **PDF upload only**
- Research lanes (all four): **employer verification, LinkedIn profile match, GitHub/portfolio check, news & web mentions**
- Stack: **Browserbase + Stagehand** (keep the live-view wow factor); extended with per-lane Claude agent loops so the UI shows reasoning + fetches + reactions — user quote: *"see the steps taken, what it fetches, how it reacts to the found documents, dig deeper."*

## Dependencies to install

```
npm i @ai-sdk/anthropic ai @browserbasehq/sdk @browserbasehq/stagehand zod react-markdown
```
Match template versions: `ai ^6`, `@ai-sdk/anthropic ^3`, `zod ^4`, `@browserbasehq/stagehand ^3`, `@browserbasehq/sdk ^2`.

## Env vars (`apollo/.env.example`)

```
ANTHROPIC_API_KEY=
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
APOLLO_MODEL=claude-sonnet-4-5-20250929
APOLLO_MAX_STEPS_PER_LANE=5
APOLLO_MAX_PDF_BYTES=5242880
```

## File tree

```
apollo/
├── .env.example
├── app/
│   ├── layout.tsx                    # wrap in <AnalysisProvider>, keep Geist fonts
│   ├── page.tsx                      # router: phase === 'idle' | 'analyzing' | 'done'
│   ├── globals.css                   # Tailwind v4 + Apollo palette (navy/verify-green/flag-amber/contradict-red)
│   ├── types.ts                      # z.infer re-exports
│   ├── api/analyze/route.ts          # SSE POST: multipart PDF → parse → 4 lanes → synthesize
│   ├── context/AnalysisContext.tsx   # SSE client parser + startAnalysis(file) + cancel()
│   ├── lib/
│   │   ├── schemas.ts                # all Zod schemas (see Data Model)
│   │   ├── sse.ts                    # createSSE() helper, lifted from template route.ts:415–439
│   │   ├── browserbase.ts            # getProjectConcurrency + createStagehandSession (template:48–94)
│   │   ├── parseResume.ts            # generateObject w/ PDF file content part → ResumeClaims
│   │   ├── synthesize.ts             # final generateObject → VerificationReport
│   │   ├── prompts.ts                # per-lane system + user prompt builders
│   │   └── lanes/
│   │       ├── runLane.ts            # generic Claude tool-use loop + onStepFinish → SSE
│   │       ├── tools.ts              # makeLaneTools(stagehand, emit): search, navigate, extract
│   │       ├── employer.ts           # prompt + claim-subset builder, calls runLane
│   │       ├── linkedin.ts
│   │       ├── github.ts
│   │       └── news.ts
│   └── components/
│       ├── UploadDropzone.tsx
│       ├── ClaimsPreview.tsx         # parsed-claim chips shown once parse completes
│       ├── LaneColumn.tsx            # header + iframe + trace + finding-cards
│       ├── LaneHeader.tsx
│       ├── LiveBrowserFrame.tsx      # iframe pattern from template SessionCard.tsx:28–34
│       ├── AgentTrace.tsx            # auto-scroll timeline of TraceStepItem
│       ├── TraceStepItem.tsx         # icon per type: thought/action/observation/finding/error
│       ├── ClaimStatusCard.tsx       # adapted from template FindingCard.tsx
│       ├── VerificationReport.tsx    # final report screen
│       ├── ProgressBar.tsx
│       ├── CancelButton.tsx
│       ├── ExpandedBrowserModal.tsx  # port verbatim from template
│       └── skeletons/LaneColumnSkeleton.tsx
└── public/logo.svg                   # Apollo mark
```

## Data model (`app/lib/schemas.ts`)

```ts
ResumeClaims = z.object({
  candidateName: z.string(),
  summary: z.string().optional(),
  employers: z.array(z.object({
    company: z.string(), title: z.string(),
    startDate: z.string().optional(), endDate: z.string().optional(),
    location: z.string().optional(),
  })),
  schools: z.array(z.object({
    name: z.string(), degree: z.string().optional(),
    field: z.string().optional(), gradDate: z.string().optional(),
  })),
  skills: z.array(z.string()),
  projects: z.array(z.object({ name: z.string(), description: z.string().optional() })),
  githubHandle: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  rawText: z.string(),
});

TraceStep = z.object({
  id: z.string(),                                    // uuid, client-dedupable
  laneId: z.enum(['employer','linkedin','github','news']),
  type:   z.enum(['thought','action','observation','finding','error']),
  text:   z.string(),
  link:   z.string().url().optional(),
  timestamp: z.number(),
});

LaneResult = z.object({
  laneId: TraceStep.shape.laneId,
  status: z.enum(['ok','partial','failed']),
  findings: z.array(z.object({
    claimRef: z.string(),                            // "employers[0]", "projects[1]", ...
    statement: z.string(),
    evidence: z.array(z.object({ url: z.string(), quote: z.string().optional() })),
    confidence: z.enum(['high','medium','low']),
    conclusion: z.enum(['verified','unverified','contradicted','flagged']),
  })),
  notes: z.string().optional(),
});

VerificationReport = z.object({
  candidateName: z.string(),
  overall: z.enum(['strong','mixed','weak']),
  summary: z.string(),
  claims: z.array(z.object({
    claimRef: z.string(),
    label: z.string(),                               // "Senior Eng @ Stripe, 2020–2023"
    status: z.enum(['verified','unverified','contradicted','flagged']),
    rationale: z.string(),
    sources: z.array(z.string().url()),
  })),
  redFlags: z.array(z.string()),
});
```

## `POST /api/analyze` — orchestration

Input: `multipart/form-data` with `file` (PDF). Mirror template's `TransformStream`/`writer`/`closeWriter` pattern (template `route.ts:415–439`). Keep `export const maxDuration = 300`.

SSE event catalog (exact names): `upload`, `parsing`, `claims`, `laneStarted`, `liveView`, `traceStep`, `laneFinding`, `laneComplete`, `report`, `error`, `done`. All lane-scoped events include `laneId`.

Flow:

```
1. validate file (type/size), sendEvent('upload', { filename, bytes })
2. sendEvent('parsing', { stage: 'extracting claims' })
   claims = await parseResume(file)                  // lib/parseResume.ts
3. sendEvent('claims', claims)
4. concurrency = await getProjectConcurrency()       // template:55–58
   lanes = [employerLane, linkedinLane, githubLane, newsLane]
5. if concurrency === 1: run lanes sequentially (template:470–510 pattern)
   else: await Promise.allSettled(lanes.map(l => l.run({ claims, emit, signal })))
   // each lane sends laneStarted / liveView / traceStep* / laneFinding* / laneComplete
6. report = await synthesize(claims, laneResults)
   sendEvent('report', report)
7. sendEvent('done', { elapsedMs })
```

Abort: wire `req.signal` into each Stagehand `.close()` + pass as `abortSignal` to `generateText`. Always clean up sessions in `finally`.

## Lane-agent shape (`app/lib/lanes/runLane.ts`)

```ts
// generic runner — employer/linkedin/github/news each call this with their own prompts + claim subset
async function runLane({ laneId, systemPrompt, userPrompt, claims, emit, signal }) {
  const session = await createStagehandSession(laneId);     // template:75–94
  await emit('laneStarted', { laneId });
  await emit('liveView',    { laneId, liveViewUrl: session.liveViewUrl, sessionId: session.sessionId });

  const tools = makeLaneTools(session.stagehand, (step) => emit('traceStep', { laneId, ...step }));
  //  tools.search   — DuckDuckGo query (cheap, no captcha; pattern: template:110–127)
  //  tools.navigate — page.goto + domcontentloaded, 15s timeout
  //  tools.extract  — stagehand.extract(instruction, zodSchema)

  try {
    const result = await generateText({
      model: anthropic(process.env.APOLLO_MODEL!),
      system: systemPrompt,
      prompt: userPrompt(claims),
      tools,
      stopWhen: stepCountIs(Number(process.env.APOLLO_MAX_STEPS_PER_LANE ?? 5)),
      abortSignal: signal,
      onStepFinish: async (step) => {
        if (step.text)                 await emitTrace('thought', step.text);
        for (const tc of step.toolCalls   ?? []) await emitTrace('action',      fmtCall(tc));
        for (const tr of step.toolResults ?? []) await emitTrace('observation', fmtResult(tr), tr.output?.url);
      },
    });

    // cheap second pass — structure the free-form result into LaneResult
    const lane = await generateObject({
      model: anthropic(process.env.APOLLO_MODEL!),
      schema: LaneResult,
      prompt: buildSynthPrompt(laneId, result.text, claims),
    });
    for (const f of lane.findings) await emit('laneFinding', { laneId, finding: f });
    await emit('laneComplete', { laneId, status: lane.status });
    return lane;
  } catch (err) {
    await emit('traceStep', { laneId, type: 'error', text: String(err) });
    return { laneId, status: 'failed', findings: [], notes: String(err) };
  } finally {
    try { await session.stagehand.close(); } catch {}
  }
}
```

Per-lane files (`employer.ts`, `linkedin.ts`, `github.ts`, `news.ts`) are thin: build the claim subset + system/user prompts and delegate to `runLane`. Example employer system prompt skeleton: *"For each employer in the candidate's claims, confirm the company exists, try to verify the role/dates by checking the company site + news. Use tools. Cite URLs. Prefer primary sources. Cap your investigation at 5 total steps across all employers."*

## Client state (`app/context/AnalysisContext.tsx`)

Adapted from template `ResearchContext.tsx:52–147` (same fetch → reader → `\n\n` buffer split). Shape:

```
phase: 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'synthesizing' | 'done' | 'error'
claims: ResumeClaims | null
lanes: Record<LaneId, { status, liveViewUrl?, sessionId?, trace: TraceStep[], findings: LaneFinding[], finalStatus? }>
report: VerificationReport | null
error: string | null
elapsedMs: number
```

`startAnalysis(file)` posts `FormData` (no JSON). `cancel()` calls `abortController.abort()` and resets. 1s interval updates `elapsedMs` while not idle.

## UI layout (`app/page.tsx` driven by `phase`)

- **Idle:** `UploadDropzone` centered, copy "Apollo will verify employers, LinkedIn, GitHub, and press mentions." Accept `.pdf` only; respect `APOLLO_MAX_PDF_BYTES`.
- **Analyzing:** top bar with candidate name (after parse) + `ProgressBar` (upload 5 / parse 15 / analyzing 15→85 weighted by lane completions / synth 85→100) + `CancelButton`. `ClaimsPreview` chip row (collapses after 4s). **2×2 grid of `LaneColumn`** — each column: `LaneHeader` (name, status pill, elapsed, collapse toggle) → `LiveBrowserFrame` (iframe `liveViewUrl + "&navbar=false"`, click to open `ExpandedBrowserModal`) → `AgentTrace` (auto-scroll timeline of `TraceStepItem` with per-type icons) → `ClaimStatusCard`s as `laneFinding` events arrive.
- **Done:** `VerificationReport` — overall badge + exec summary + per-claim grid grouped by status + red-flags callout + "Start new analysis".

**Theme:** keep Tailwind v4 `@theme inline` shape from current `globals.css`, swap palette to: navy `#0b2545` (primary), verify-green `#16a34a`, flag-amber `#d97706`, contradict-red `#dc2626`, paper `#f7f5f0`, ink `#0f172a`.

## Implementation order

**Phase 0 — Scaffold (~30 min)**
1. Install deps + copy `.env.example`.
2. Skim `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` (already confirmed — standard Web APIs, `maxDuration` export works).
3. Port `lib/sse.ts` + `lib/browserbase.ts` from template (`route.ts:48–94` + `415–439`).

**Phase 1 — Vertical slice: employer lane only (~half day)**
4. `lib/schemas.ts` (all schemas upfront — other lanes need them).
5. `lib/parseResume.ts` — `generateObject({ schema: ResumeClaims, messages: [{ role:'user', content:[{ type:'file', data: <bytes>, mediaType:'application/pdf' }, { type:'text', text:'Extract per schema. rawText must be the full textual content.' }] }] })`.
6. `lib/lanes/tools.ts` + `runLane.ts` + `lanes/employer.ts`.
7. Wire `/api/analyze`: parse → employer lane only → skip synthesis → emit `done`.
8. Minimal `AnalysisContext` + page with dropzone + one `LaneColumn`. Run `npm run dev`, upload a real resume, confirm SSE events flow and the live iframe renders.

**Phase 2 — Fan out (~half day)**
9. Clone employer into linkedin/github/news, tune per-lane prompts (LinkedIn expect bot walls; GitHub fallback-searches name+skills when `githubHandle` is null; news uses Google News via DuckDuckGo).
10. Switch orchestrator to `Promise.allSettled` + sequential fallback for concurrency=1.
11. `lib/synthesize.ts` + `report` event + `VerificationReport` screen.

**Phase 3 — Polish**
12. Skeletons, cancel wiring, error banner, elapsed timer, expanded browser modal port, progress weighting, empty-state copy.
13. Theme pass on `globals.css`.

## Verification plan

Golden path: upload a real resume with at least one well-known employer, a GitHub handle with public repos, and a LinkedIn URL.
- `parsing` completes <10s; `ClaimsPreview` chips reflect the resume accurately.
- All 4 panels show live browser activity within a few seconds.
- Each panel's trace shows ≥1 `thought` + ≥1 `action` (`search`/`navigate`/`extract`) + ≥1 `observation`.
- Employer lane: ≥1 claim ends `verified` with a corp-site URL in `evidence`.
- GitHub lane: either matches repos to `projects[]` OR emits a clear flag (e.g. "account age < claimed experience").
- LinkedIn lane on free/bot-walled plan: returns `partial` with a trace observation `"blocked by login"`.
- News lane: mentions or empty with `ok`.
- Final `report` renders with correct `overall` + every claim has a `status`.

Failure modes to exercise:
- Free Browserbase plan (concurrency=1) → sequential fallback, no crash.
- Scanned (image-only) PDF → empty claims → emit `error` `"Could not extract claims — is the PDF text-based?"` and halt.
- Missing `githubHandle` → GitHub lane runs a name+skills fallback and returns `unverified` with note (not an error).
- LinkedIn bot wall → `partial` + observation in trace.
- Cancel mid-run → `req.signal` propagates, all Stagehand sessions close in `finally`, UI returns to `idle`.
- Resume > 5 MB → 413 before any API calls.
- Step cap reached → partial findings + trace shows "hit step limit".

## Explicit non-goals (MVP)

No auth. No persistence (no DB, no S3, every run is ephemeral). No multi-candidate queueing/compare. No PDF re-rendering or annotation overlay. No CRM/ATS integrations. No email/Slack delivery. No rate-limiting or billing. No server-side caching of research results. English PDFs only. Desktop-first (2×2 grid assumes ≥1280px). No automated test suite — manual QA only. No retry/backoff beyond one attempt per tool call.

## Critical files to create

- `apollo/app/api/analyze/route.ts`
- `apollo/app/lib/lanes/runLane.ts`
- `apollo/app/lib/lanes/tools.ts`
- `apollo/app/lib/schemas.ts`
- `apollo/app/lib/parseResume.ts`
- `apollo/app/lib/synthesize.ts`
- `apollo/app/context/AnalysisContext.tsx`
- `apollo/app/components/LaneColumn.tsx`
- `apollo/app/components/AgentTrace.tsx`
- `apollo/app/components/VerificationReport.tsx`

## Reused primitives from `browserbase-nextjs-template`

- SSE TransformStream helper — `route.ts:415–439`
- Browserbase concurrency detection + Stagehand session factory — `route.ts:48–94`
- Sequential/parallel orchestration skeleton — `route.ts:470–541`
- `generateObject` synthesis shape — `route.ts:550–573`
- SSE client parser (fetch → reader → buffer split on `\n`) — `ResearchContext.tsx:96–139`
- Live-view iframe embed (`debuggerFullscreenUrl + "&navbar=false"`, `sandbox="allow-same-origin allow-scripts"`) — `SessionCard.tsx:28–34`
- Expanded browser modal — `ExpandedBrowserModal.tsx` (port verbatim)
- Skeleton/animate-pulse pattern — `SessionCardSkeleton.tsx`
