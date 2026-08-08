import ContactClient from "./ContactClient";
import { getBreadcrumbSchema } from "@/lib/seo";

export const metadata = {
  title: "Contact & Export Quotation Inquiry | Central Biomedicals",
  description:
    "Contact Central Biomedicals for medical diagnostic equipment pricing, B2B export quotes, distributor opportunities, and OEM supply inquiries.",
  alternates: {
    canonical: "https://centralbiomedicals.com/contact",
  },
  openGraph: {
    title: "Contact & Export Inquiries | Central Biomedicals",
    description: "Submit product inquiries, request export quotations, or become an international distributor.",
    url: "https://centralbiomedicals.com/contact",
  },
};

export default function ContactPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactClient />
    </>
  );
}