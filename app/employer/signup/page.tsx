import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata = { title: "Apollo — Employer signup" };

export default function SignupPage() {
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
            href="/employer/login"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-ink transition-colors"
          >
            ← Sign in
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="apollo-card-strong w-full max-w-md p-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            Create account
          </div>
          <h1 className="apollo-serif text-[28px] mt-1 text-apollo-ink leading-tight">
            Employer signup
          </h1>
          <p className="text-[13px] text-apollo-ink/70 mt-2">
            One account per hiring org. You&apos;ll manage job postings, applicants, and verification under this login.
          </p>
          <SignupForm />
          <div className="apollo-divider my-6" />
          <p className="text-[12.5px] text-apollo-muted">
            Already have an account?{" "}
            <Link
              href="/employer/login"
              className="text-apollo-navy hover:underline"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
