"use client";

import { useEffect, useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import LinkComponent from "next/link";
import { fetchContactData, fetchDistrictData } from "@/lib/data-fetcher";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";

export default function Footer() {
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState(null);

  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "products",
    "export",
    "contact",
    "items",
  ];

  const district =
    pathParts.length > 0 && !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  useEffect(() => {
    const loadContact = async () => {
      try {
        const data = await fetchContactData();
        if (data) {
          setContactInfo(data.contactInfo || []);
        }
      } catch (err) {
        console.error("Error loading contact info in footer:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  useEffect(() => {
    const loadDistrict = async () => {
      if (!district) return;
      try {
        const data = await fetchDistrictData(district);
        if (data) {
          setDistrictData(data);
        }
      } catch (err) {
        console.error("Error loading district in footer:", err);
      }
    };

    loadDistrict();
  }, [district]);

  const phone =
    contactInfo.find((x) => x.label === "Phone Number")?.value || "+91 9983123469";

  const email =
    contactInfo.find((x) => x.label === "Email Address")?.value || "info@centralbiomedicals.com";

  const address =
    contactInfo.find((x) => x.label === "Office Address")?.value || "India";

  const dynamicAddress = districtData
    ? `${districtData.district}, ${districtData.state}, India`
    : address;

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  if (loading) {
    return (
      <footer className="bg-white border-t border-slate-200">
        <div className="container-custom py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-6" />
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-5 bg-slate-200 rounded animate-pulse mb-4"
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 mt-12 pt-6">
            <div className="h-5 w-72 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-sky-700">
              Central
              <span className="text-slate-900"> Biomedicals</span>
            </h2>
            <p className="mt-5 text-slate-600 leading-7">
              Delivering trusted diagnostic and biomedical solutions with
              innovation, quality, and precision healthcare support.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/rajbiosisindia/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-sky-600 hover:text-white flex items-center justify-center transition shadow-sm"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/rajbiosispvtltd/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-sky-600 hover:text-white flex items-center justify-center transition shadow-sm"
              >
                <FaFacebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Quick Links</h3>
            <div className="flex flex-col gap-3 text-slate-600">
              <LinkComponent href={makeLink("/")} className="hover:text-sky-700 transition">Home</LinkComponent>
              <LinkComponent href={makeLink("/about")} className="hover:text-sky-700 transition">About</LinkComponent>
              <LinkComponent href={makeLink("/services")} className="hover:text-sky-700 transition">Services</LinkComponent>
              <LinkComponent href={makeLink("/items")} className="hover:text-sky-700 transition">Products</LinkComponent>
              <LinkComponent href={makeLink("/export")} className="hover:text-sky-700 transition">B2B Export</LinkComponent>
              <LinkComponent href={makeLink("/contact")} className="hover:text-sky-700 transition">Contact</LinkComponent>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Product Categories</h3>
            <div className="flex flex-col gap-3 text-slate-600">
              <LinkComponent href={makeLink("/items#hematology")} className="hover:text-sky-700 transition">Hematology Analyzers</LinkComponent>
              <LinkComponent href={makeLink("/items#biochemistry")} className="hover:text-sky-700 transition">Biochemistry Analyzers</LinkComponent>
              <LinkComponent href={makeLink("/items#electrolyte")} className="hover:text-sky-700 transition">Electrolyte Reagents</LinkComponent>
              <LinkComponent href={makeLink("/items#rapid-test")} className="hover:text-sky-700 transition">Rapid Test Kits</LinkComponent>
              <LinkComponent href={makeLink("/items")} className="hover:text-sky-700 transition">Laboratory Instruments</LinkComponent>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Contact Info</h3>
            <div className="space-y-4 text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-sky-700 shrink-0" />
                <p>{dynamicAddress}</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-sky-700 shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-sky-700 transition">{phone}</a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-sky-700 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-sky-700 transition">{email}</a>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a href="https://www.instagram.com/rajbiosisindia/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-700 transition text-sm">
                  <FaInstagram className="text-pink-600" size={16} /> Instagram
                </a>
                <span>•</span>
                <a href="https://www.facebook.com/rajbiosispvtltd/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-700 transition text-sm">
                  <FaFacebook className="text-blue-600" size={16} /> Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2026 Central Biomedicals. All rights reserved.</p>
          <p className="mt-3 md:mt-0">Designed with precision for modern diagnostics.</p>
        </div>
      </div>
    </footer>
  );
}