import  TopNav  from "@/components/navigation/TopNav";
import   HomePage from "@/components/home/HomePage";
import Footer from "@/components/layout/Footer";

const Page = () => {
  console.log(`${process.env.BACKEND_URL}`);

  return (
    <>
      <HomePage />
    </>
  );
}

export default Page;
