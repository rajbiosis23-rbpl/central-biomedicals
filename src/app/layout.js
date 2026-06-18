import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Central Biomedicals",
  description:
    "Premium Diagnostic & Biomedical Solutions",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />

        <main>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}