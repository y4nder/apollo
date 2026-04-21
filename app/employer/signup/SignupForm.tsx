"use client";

import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "../actions";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signUpAction,
    {}
  );

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <label className="block">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
          Company name
        </span>
        <input
          name="companyName"
          type="text"
          required
          className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
          placeholder="Acme Robotics"
        />
      </label>
      <label className="block">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
          Your name
        </span>
        <input
          name="contactName"
          type="text"
          className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
          placeholder="Jordan Patel"
        />
      </label>
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
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
        />
        <span className="block mt-1 text-[10.5px] text-apollo-muted">
          Minimum 8 characters.
        </span>
      </label>
      {state.error && (
        <p className="text-[12.5px] text-apollo-contradict">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 rounded-md bg-apollo-navy text-white text-[13px] font-medium hover:bg-apollo-navy-soft transition-colors disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
