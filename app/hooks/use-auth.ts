// hooks/use-auth.ts
export function useAuth() {
  // later replace with DRF auth logic
  const user = true;
  // example later:
  // const user = { name: "Joshua", avatar: "/avatar.png" };

  return {
    isAuthenticated: Boolean(user),
    user,
  };
}
