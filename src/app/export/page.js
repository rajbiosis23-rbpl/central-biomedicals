import ExportClient from "./ExportClient";
import { getBreadcrumbSchema } from "@/lib/seo";

export const metadata = {
  title: "B2B Medical & Diagnostic Equipment Exporter India | Central Biomedicals",
  description:
    "Central Biomedicals is a premier Indian manufacturer and exporter of medical diagnostic equipment, hematology analyzers, biochemistry instruments, and lab reagents worldwide.",
  keywords: [
    "Medical Equipment Exporter India",
    "Diagnostic Equipment Exporter",
    "Hematology Analyzer Exporter India",
    "Biochemistry Analyzer Supplier Africa",
    "Medical Device OEM Manufacturer India",
    "Laboratory Instruments Importer Supply",
    "Central Biomedicals Export",
  ],
  alternates: {
    canonical: "https://centralbiomedicals.com/export",
  },
  openGraph: {
    title: "B2B Medical & Diagnostic Equipment Exporter India | Central Biomedicals",
    description: "International supply of diagnostic instruments, lab equipment, and OEM biomedical products worldwide.",
    url: "https://centralbiomedicals.com/export",
  },
};

export default function ExportPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "B2B Export", url: "/export" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ExportClient />
    </>
  );
}
