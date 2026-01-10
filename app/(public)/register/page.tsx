"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import FormField from "@/components/auth/FormField";
import { registerUser, loginUser } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";

const Page = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Register
      await registerUser(email, username, password);

      // 2️⃣ Auto-login
      await loginUser(email, password);

      // 3️⃣ Sync auth state
      await refreshUser();

      // 4️⃣ Redirect
      router.replace("/dashboard");

    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <FormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-lg font-medium text-white transition",
              loading
                ? "bg-ts-primary/60 cursor-not-allowed"
                : "bg-ts-primary hover:opacity-90"
            )}
          >
            {loading ? "Creating account..." : "Create Account"}
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
          <Link href="/login" className="text-ts-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
