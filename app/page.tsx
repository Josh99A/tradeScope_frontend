import  TopNav  from "@/components/navigation/TopNav";
import   HomePage from "@/components/home/HomePage";
import Footer from "@/components/layout/Footer";

const Page = () => {
  const isAuthenticated = false; // later from DRF
  const user = {
    name: "Joshua",
    avatarUrl: "/avatar-placeholder.png",
  };

  return (
    <>
      <TopNav isAuthenticated={isAuthenticated} user={user} />
      <HomePage />
      <Footer />
    </>
  );
}

export default Page;
