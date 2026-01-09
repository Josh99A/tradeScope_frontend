"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import FormField from "@/components/auth/FormField";

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ts-bg-main px-4">
      <div className="w-full max-w-md bg-ts-bg-card border border-ts-border rounded-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ts-primary">
            Create your account
          </h1>
          <p className="text-sm text-ts-text-muted mt-2">
            Start trading crypto with confidence
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <FormField
            label="Username"
            type="text"
            placeholder="Enter your username"
          />

          <FormField
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
          />

          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
          />

          <button
            type="submit"
            className={cn(
              "w-full py-3 rounded-lg font-medium text-white transition",
              "bg-ts-primary hover:opacity-90"
            )}
          >
            Create Account
          </button>
        </form>

        {/* Legal */}
        <p className="text-xs text-ts-text-muted mt-4 text-center">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-ts-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-ts-primary hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Footer */}
        <p className="text-sm text-center text-ts-text-muted mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-ts-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default page
