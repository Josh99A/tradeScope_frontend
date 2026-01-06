"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import FormField from "./FormField";

const LoginForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ts-bg-main px-4">
      <div className="w-full max-w-md bg-ts-bg-card border border-ts-border rounded-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ts-primary">
            Welcome back
          </h1>
          <p className="text-sm text-ts-text-muted mt-2">
            Sign in to your TradeScope account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <FormField
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ts-text-muted">
              <input
                type="checkbox"
                className="accent-ts-primary"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="text-ts-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full py-3 rounded-lg font-medium text-white transition",
              "bg-ts-primary hover:opacity-90"
            )}
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-ts-text-muted mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-ts-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
export default LoginForm;