"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { resetSessionExpiredNotice } from "@/lib/axios";
import { refreshToken } from "@/lib/auth";
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import toast from "react-hot-toast";

type User = {
  id: number;
  username: string;
  email: string;
  photo_url?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpiredOpen(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ts-session-expired", handleSessionExpired);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ts-session-expired", handleSessionExpired);
      }
    };
  }, []);

  const handleRefreshSession = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshToken();
      await fetchUser();
      setSessionExpiredOpen(false);
      resetSessionExpiredNotice();
      toast.success("Session refreshed.");
    } catch {
      setUser(null);
      setSessionExpiredOpen(false);
      resetSessionExpiredNotice();
      toast.error("Session refresh failed. Please sign in again.");
      router.push("/login");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setSessionExpiredOpen(false);
    resetSessionExpiredNotice();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        refreshUser: fetchUser,
      }}
    >
      {children}
      <SessionExpiredModal
        open={sessionExpiredOpen}
        onConfirm={handleRefreshSession}
        onDismiss={handleDismiss}
        busy={refreshing}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
