import HeroSection from "@/components/HeroSection";
import TrustedBrands from "@/components/TrustedBrands";
import WhyChooseUs from "@/components/WhyChooseUs";
import StatsSection from "@/components/StatsSection";
import ServicesPreview from "@/components/ServicesPreview";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";

export default function Home({ city = "" }) {
  return (
    <>
      <HeroSection city={city} />
      <TrustedBrands city={city} />
      <WhyChooseUs city={city} />
      <StatsSection city={city} />
      <ServicesPreview city={city} />
      <Testimonials city={city} />
      <CTASection city={city} />
    </>
  );
}