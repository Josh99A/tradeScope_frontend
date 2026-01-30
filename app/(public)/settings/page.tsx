"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { user, loading, refreshUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profilePhoto);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!profilePhoto && !trimmedUsername) {
      const message = "Please update your username or profile photo.";
      setNotice(message);
      toast.error(message);
      return;
    }

    try {
      setSaving(true);
      setNotice(null);
      let res: Response;
      if (profilePhoto) {
        const formData = new FormData();
        formData.append("profile_photo", profilePhoto);
        if (trimmedUsername) {
          formData.append("username", trimmedUsername);
        }
        res = await fetch("/api/me", {
          method: "PATCH",
          body: formData,
          credentials: "include",
        });
      } else {
        res = await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername }),
          credentials: "include",
        });
      }

      if (!res.ok) {
        const data = await res.json();
        const detail =
          (data && typeof data === "object" && data.username && data.username[0]) ||
          data?.detail;
        throw new Error(detail || "Failed to update profile.");
      }

      await refreshUser();
      setProfilePhoto(null);
      setNotice("Profile updated.");
      toast.success("Profile updated.");
    } catch (_e) {
      const message =
        _e instanceof Error ? _e.message : "Update failed. Please try again.";
      setNotice(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4 max-w-3xl w-full">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">
              Account settings
            </h1>
            <p className="text-sm text-ts-text-muted">
              Update your username or profile photo.
            </p>
          </div>

          <div className="w-full rounded-xl border border-ts-border bg-ts-bg-card p-6">
            {notice && (
              <p className="mb-4 text-sm text-ts-text-muted">{notice}</p>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between rounded-lg border border-ts-border bg-ts-bg-main px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-ts-text-main">Theme</p>
                  <p className="text-xs text-ts-text-muted">Switch light/dark mode.</p>
                </div>
                <ThemeToggle size="sm" />
              </div>
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="block w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm text-ts-text-main"
                />
                <p className="mt-2 text-xs text-ts-text-muted">
                  This is shown on your profile and activity.
                </p>
              </div>
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
      </AppShell>
    </DashboardShell>
  );
};

export default SettingsPage;
