"use client";

import { useActionState } from "react";
import { useToast } from "@/components/Toast";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const toast = useToast();

  return (
    <form action={action} className="space-y-12">
      <div className="grid items-center gap-2 sm:grid-cols-[155px_350px]">
        <label htmlFor="username" className="text-[17px] text-[#555]">
          Username
        </label>
        <input id="username" name="username" placeholder="Enter Username" autoComplete="username" className="u-field" required />
      </div>
      <div className="grid items-center gap-2 sm:grid-cols-[155px_350px]">
        <label htmlFor="password" className="text-[17px] text-[#555]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          autoComplete="current-password"
          className="u-field"
          required
        />
      </div>

      <div className="flex flex-col items-start gap-6 sm:pl-[150px]">
        {state.error && <p className="text-[15px] text-danger">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-green">
          {pending ? "Logging in…" : "Log In"}
        </button>
        <button
          type="button"
          className="btn-green"
          onClick={() => toast("Forgot Password is not available in this demo.")}
        >
          Forgot Password
        </button>
      </div>
    </form>
  );
}
