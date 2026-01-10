import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

const LogoutButton = ({mobile}: {mobile?: boolean}) => {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    await refreshUser(); // clears user from context
    router.replace("/login");
  };

  return (
    <Button
     onClick={handleLogout} 
     className={cn(
        mobile
        ? "w-full text-center bg-ts-primary text-white py-2 rounded-md block"
        : "bg-ts-primary text-white px-4 py-2 rounded-md hover:opacity-90"
        )}>
      Logout
    </Button>
  );
};

export default LogoutButton;
