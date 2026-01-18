"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

const SettingsPage = () => {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

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

    if (!profilePhoto) {
      alert("Please choose an image to upload.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("profile_photo", profilePhoto);

      const res = await fetch("/api/me", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update profile photo.");
      }

      await refreshUser();
      setProfilePhoto(null);
      alert("Profile photo updated.");
    } catch (_e) {
      alert("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-ts-bg-main px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-ts-border bg-ts-bg-card p-6">
        <h1 className="text-xl font-semibold text-ts-text-main">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-ts-text-muted">
          Update your profile photo.
        </p>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border border-ts-border overflow-hidden bg-ts-bg-main">
              <img
                src={
                  previewUrl ||
                  user?.photo_url ||
                  "/Images/avatar-placeholder.jpg"
                }
                alt={user?.username || "Profile photo"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">
                Profile photo
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                className="block w-full text-sm text-ts-text-muted file:mr-4 file:rounded-md file:border-0 file:bg-ts-primary file:px-4 file:py-2 file:text-white hover:file:opacity-90"
              />
              <p className="mt-2 text-xs text-ts-text-muted">
                PNG, JPG, or WEBP up to 2MB.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg font-medium text-white transition bg-ts-primary hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
