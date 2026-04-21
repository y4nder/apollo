"use client";

import { useActionState } from "react";
import { signInAction, type AuthActionState } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signInAction,
    {}
  );

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
          placeholder="you@company.com"
        />
      </label>
      <label className="block">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
        />
      </label>
      {state.error && (
        <p className="text-[12.5px] text-apollo-contradict">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 rounded-md bg-apollo-navy text-white text-[13px] font-medium hover:bg-apollo-navy-soft transition-colors disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
