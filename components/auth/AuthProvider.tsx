"use client";

import { createContext, useContext, useState } from "react";

type User = {
  name: string;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TEMP: mocked state (replace with DRF later)
  const [user] = useState<User | null>(null);
  // {
  //   name: "Joshua",
  //   avatarUrl: "/avatar-placeholder.png",
  // }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
