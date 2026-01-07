'use client';

import TopNav from "@/components/navigation/TopNav";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/auth/AuthProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavWrapper />
      {children}
      <Footer />
    </>
  );
}

/* Wrapper needed because layouts can’t be hooks directly */
function TopNavWrapper() {
  const { user, isAuthenticated } = useAuth();
  

  return (
    <TopNav
      isAuthenticated={isAuthenticated}
      user={user || undefined}
    />
  );
}
