import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL("https://centralbiomedicals.com"),

  title: {
    default: "Biomedical & Diagnostic Equipment Manufacturer & Exporter | Central Biomedicals",
    template: "%s | Central Biomedicals",
  },

  description:
    "Central Biomedicals is a leading Indian manufacturer, supplier, and exporter of medical diagnostic equipment, hematology analyzers, biochemistry analyzers, ELISA readers, and laboratory instruments worldwide.",

  keywords: [
    "Biomedical Equipment Supplier",
    "Medical Diagnostic Equipment Exporter India",
    "Laboratory Equipment Manufacturer India",
    "CBC Machine Supplier",
    "Hematology Analyzer Manufacturer Exporter",
    "Biochemistry Analyzer Supplier",
    "Diagnostic Equipment Distributor",
    "Medical Device OEM Manufacturer India",
  ],

  openGraph: {
    title: "Biomedical & Diagnostic Equipment Manufacturer & Exporter | Central Biomedicals",
    description: "Indian manufacturer and exporter of diagnostic, laboratory, and biomedical equipment for hospitals and pathology labs worldwide.",
    url: "https://centralbiomedicals.com",
    siteName: "Central Biomedicals",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Central Biomedicals Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Biomedical & Diagnostic Equipment Manufacturer & Exporter | Central Biomedicals",
    description: "Indian manufacturer and exporter of diagnostic, laboratory, and biomedical equipment.",
    images: ["/logo.png"],
  },

  alternates: {
    canonical: "https://centralbiomedicals.com",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const orgSchema = getOrganizationSchema();
  const siteSchema = getWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body className="antialiased">
        <Navbar />

        <main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}