import Image from "next/image";
import HomeHero from "@/components/home/hero";
import TrustBar from "@/components/home/trust-bar";
import HomeFeatures from "@/components/home/features";
import ProductPreview from "@/components/home/product-preview";
import CallToAction from "@/components/home/call-to-action";
import Footer from "@/components/home/footer";
import { PublicTopNav } from "@/components/navigation/public-top-nav";

const HomePage = () => {
  return  (
    <>
      <PublicTopNav/>
      <HomeHero />
      <TrustBar />
      <HomeFeatures />
      <ProductPreview />
      <CallToAction />
      <Footer />
    </>
  );
}

export default HomePage




