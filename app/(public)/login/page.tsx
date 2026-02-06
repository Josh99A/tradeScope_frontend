"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { getHoldings } from "@/lib/wallet";
import { getPrices } from "@/lib/prices";
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
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextUrl = !nextParam || !nextParam.startsWith("/")
    ? "/dashboard"
    : nextParam.startsWith("/login") || nextParam.startsWith("/register")
      ? "/dashboard"
      : nextParam;


  const { refreshUser, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(nextUrl);
    }
  }, [authLoading, isAuthenticated, router, nextUrl]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Enter a valid email or username and password.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

      // Sync auth state
      await refreshUser();

      try {
        const holdingsData = await getHoldings({ forceRefresh: true });
        const holdings = Array.isArray(holdingsData?.holdings)
          ? holdingsData.holdings
          : Array.isArray(holdingsData)
          ? holdingsData
          : [];
        const symbols = holdings
          .map((holding: any) => String(holding?.asset || "").toUpperCase())
          .filter(Boolean);
        if (symbols.length > 0) {
          const priceData = await getPrices(symbols, { forceRefresh: true });
          const nextPrices = priceData?.prices || {};
          try {
            window.localStorage.removeItem("ts_prices_cache");
            window.localStorage.removeItem("ts_prices_cache_meta");
            window.localStorage.setItem(
              "ts_prices_cache",
              JSON.stringify(nextPrices)
            );
            window.localStorage.setItem(
              "ts_prices_cache_meta",
              JSON.stringify({ ts: Date.now() })
            );
          } catch {
            // ignore cache write errors
          }
        }
      } catch {
        // ignore price prefetch errors
      }

      toast.success("Welcome back! You're now signed in.");
      router.replace(nextUrl);
      router.refresh();

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid email or username or password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-ts-bg-main px-4">
      <div className="w-full max-w-md bg-ts-bg-card border border-ts-border rounded-xl p-8">

        <div className="flex items-center justify-center gap-2 text-sm mb-6">
          <Link
            href="/login"
            className="font-semibold text-ts-primary"
          >
            Login
          </Link>
          <span className="text-ts-text-muted">|</span>
          <Link
            href="/register"
            className="text-ts-text-muted hover:text-ts-text-main transition"
          >
            Sign up
          </Link>
        </div>

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
            label="Email or username"
            type="text"
            placeholder="Email or username"
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
