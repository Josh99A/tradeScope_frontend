"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import FormField from "@/components/auth/FormField";
import { registerUser, loginUser } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

const Page = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profilePhoto);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      alert("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const trimmedUsername = username.trim();

      // Register
      await registerUser({
        email,
        username: trimmedUsername ? trimmedUsername : undefined,
        password,
        profilePhoto,
      });

      // Auto-login
      await loginUser(email, password);

      // Sync auth state
      await refreshUser();

      // Redirect
      router.replace("/dashboard");

    } catch {
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
          <div>
            <label className="block text-sm mb-1">Profile photo (optional)</label>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border border-ts-border overflow-hidden bg-ts-bg-main">
                <img
                  src={previewUrl || "/Images/avatar-placeholder.jpg"}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                className="block w-full text-sm text-ts-text-muted file:mr-4 file:rounded-md file:border-0 file:bg-ts-primary file:px-4 file:py-2 file:text-white hover:file:opacity-90"
              />
            </div>
            <p className="mt-2 text-xs text-ts-text-muted">
              PNG, JPG, or WEBP up to 2MB.
            </p>
          </div>
          <FormField
            label="Username (optional)"
            type="text"
            placeholder="Pick a username"
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
            {loading ? "Creating account..." : "Create Account"}
          </Button>
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
