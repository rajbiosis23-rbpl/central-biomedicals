import ServicesClient from "./ServicesClient";
import { getBreadcrumbSchema } from "@/lib/seo";

export const metadata = {
  title: "Biomedical & Diagnostic Instrument Services | Central Biomedicals",
  description:
    "Explore Central Biomedicals' professional biomedical equipment services, maintenance support, installation, and diagnostic consultation across India and overseas.",
  alternates: {
    canonical: "https://centralbiomedicals.com/services",
  },
  openGraph: {
    title: "Biomedical & Diagnostic Instrument Services | Central Biomedicals",
    description: "Installation, maintenance, and technical support for laboratory and diagnostic equipment.",
    url: "https://centralbiomedicals.com/services",
  },
};

export default function ServicesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ServicesClient />
    </>
  );
}