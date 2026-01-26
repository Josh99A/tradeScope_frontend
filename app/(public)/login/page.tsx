"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FormField from "@/components/auth/FormField";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const Page = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const { refreshUser } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

      // Sync auth state
      await refreshUser();

      toast.success("Welcome back! You're now signed in.");
      router.replace("/dashboard");

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid email or password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-ts-bg-main px-4">
      <div className="w-full max-w-md bg-ts-bg-card border border-ts-border rounded-xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ts-primary">
            Welcome back
          </h1>
          <p className="text-sm text-ts-text-muted mt-2">
            Sign in to your TradeScope account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            allowToggle
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-lg font-medium text-white transition",
              loading
                ? "bg-ts-primary/60 cursor-not-allowed"
                : "bg-ts-primary hover:opacity-90"
            )}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-ts-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-ts-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
