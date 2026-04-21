import Link from "next/link";
import { signOutAction } from "../../employer/actions";
import type { EmployerSession } from "../../lib/auth";

export function EmployerShell({
  session,
  children,
  breadcrumbs,
}: {
  session: EmployerSession;
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <div className="flex-1 flex flex-col apollo-grid">
      <header className="border-b border-apollo-border bg-white/60 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/employer" className="flex items-center gap-3 shrink-0">
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
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav
                aria-label="Breadcrumb"
                className="hidden md:flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted min-w-0"
              >
                <span className="text-apollo-border-strong">/</span>
                {breadcrumbs.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 min-w-0"
                  >
                    {c.href ? (
                      <Link
                        href={c.href}
                        className="hover:text-apollo-ink transition-colors truncate"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-apollo-ink/80 truncate">
                        {c.label}
                      </span>
                    )}
                    {i < breadcrumbs.length - 1 && (
                      <span className="text-apollo-border-strong">/</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[12.5px] text-apollo-ink leading-none">
                {session.employer.company_name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-apollo-muted mt-0.5">
                {session.email}
              </span>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-ink transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
