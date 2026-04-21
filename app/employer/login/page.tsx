import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = { title: "Apollo — Employer login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; msg?: string }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/employer";
  const msg = params.msg;

  return (
    <div className="flex-1 flex flex-col apollo-grid">
      <header className="border-b border-apollo-border bg-white/40 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Apollo logo" width={28} height={28} />
            <div>
              <div className="apollo-serif text-xl text-apollo-ink leading-none">
                Apollo
              </div>
              <div className="text-[9px] tracking-[0.28em] uppercase text-apollo-muted font-mono mt-0.5">
                Employer portal
              </div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-ink transition-colors"
          >
            ← Candidate intake
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="apollo-card-strong w-full max-w-md p-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            Sign in
          </div>
          <h1 className="apollo-serif text-[28px] mt-1 text-apollo-ink leading-tight">
            Employer sign-in
          </h1>
          <p className="text-[13px] text-apollo-ink/70 mt-2">
            Review applicants and run verification on your job postings.
          </p>
          {msg === "check-email" && (
            <p className="mt-4 text-[12.5px] text-apollo-navy bg-apollo-navy/5 border border-apollo-navy/15 rounded-md px-3 py-2">
              Account created. Check your inbox to confirm the email, then sign in.
            </p>
          )}
          <LoginForm next={next} />
          <div className="apollo-divider my-6" />
          <p className="text-[12.5px] text-apollo-muted">
            No account yet?{" "}
            <Link
              href="/employer/signup"
              className="text-apollo-navy hover:underline"
            >
              Create one
            </Link>
            .
          </p>
          <SeededCredentials />
        </div>
      </main>
    </div>
  );
}

function SeededCredentials() {
  const accounts = [
    {
      company: "Northwind Data Co.",
      email: "northwind@apollo.test",
      password: "ApolloDemo1!",
      hint: "Data + Ops openings",
    },
    {
      company: "Prism Engineering",
      email: "prism@apollo.test",
      password: "ApolloDemo2!",
      hint: "Engineering openings",
    },
    {
      company: "Vantage Studios",
      email: "vantage@apollo.test",
      password: "ApolloDemo3!",
      hint: "Design, marketing, ops",
    },
  ];
  return (
    <div className="mt-6 rounded-md border border-apollo-border bg-apollo-paper/60 p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-apollo-verify" />
        Demo accounts
      </div>
      <p className="text-[12px] text-apollo-ink/70 mt-2 leading-relaxed">
        Seeded for the MVP — pick one and paste the creds above.
      </p>
      <ul className="mt-3 space-y-2">
        {accounts.map((a) => (
          <li key={a.email} className="text-[12px]">
            <div className="text-apollo-ink font-medium">{a.company}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11.5px] text-apollo-muted">
              <span className="text-apollo-ink/90">{a.email}</span>
              <span className="text-apollo-ink/90">{a.password}</span>
            </div>
            <div className="text-[10.5px] text-apollo-muted italic">
              {a.hint}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
