"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import { fetchFullCatalog } from "@/lib/data-fetcher";

export default function Footer() {
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState(null);
  const [categories, setCategories] = useState([]);

  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "products",
    "contact",
    "items",
  ];

  const district =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  /* =========================================================
     LOAD CONTACT
  ========================================================= */

  useEffect(() => {
    const loadContact = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicalcom",
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          setContactInfo(
            snap.data().contactInfo || []
          );
        }

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  /* =========================================================
     LOAD DISTRICT
  ========================================================= */

  useEffect(() => {
    const loadDistrict = async () => {
      if (!district) return;

      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicalcom",
            "districts",
            district
          )
        );

        if (snap.exists()) {
          setDistrictData(snap.data());
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadDistrict();
  }, [district]);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catalog = await fetchFullCatalog();

        const uniqueCategories =
          Array.from(
            new Set(
              catalog
                .map((item) => item.category)
                .filter(Boolean)
            )
          );

        setCategories(
          uniqueCategories.slice(0, 7)
        );
      } catch (err) {
        console.error(
          "Error loading categories in footer:",
          err
        );
      }
    };

    loadCategories();
  }, []);

  /* =========================================================
     CONTACT DATA
  ========================================================= */

  const phone =
    contactInfo.find(
      (x) => x.label === "Phone Number"
    )?.value ||
    "+91 9983123469\n+91 9983333489";

  const email =
    contactInfo.find(
      (x) => x.label === "Email Address"
    )?.value ||
    "rajbiosis@yahoo.in";

  const address =
    contactInfo.find(
      (x) => x.label === "Office Address"
    )?.value ||
    "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, on Ajmer-Delhi, 200 Feet Bypass Rd, Jaipur, Rajasthan 302021";

  const dynamicAddress = districtData
    ? `${districtData.district}, ${districtData.state}, India`
    : address;

  const phoneNumbers = phone
    ? phone
      .split(/[\n,]+/)
      .map((num) => num.trim())
      .filter(Boolean)
    : [];

  /* =========================================================
     LINK
  ========================================================= */

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <footer className="border-t border-slate-200 bg-white">

        <div className="container-custom py-14">

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            {[...Array(4)].map((_, i) => (
              <div key={i}>

                <div className="mb-6 h-8 w-40 animate-pulse rounded bg-slate-100" />

                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="mb-4 h-5 animate-pulse rounded bg-slate-100"
                  />
                ))}

              </div>
            ))}

          </div>

          <div className="mt-12 border-t border-slate-200 pt-6">

            <div className="h-5 w-72 animate-pulse rounded bg-slate-100" />

          </div>

        </div>

      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-200 bg-white">

      <div className="container-custom py-14">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* =================================================
              BRAND
          ================================================= */}

          <div>

            <h2 className="text-2xl font-bold text-sky-700">

              Raj

              <span className="text-slate-900">
                {" "}Biosis
              </span>

            </h2>

            <p className="mt-5 leading-7 text-slate-500">

              Delivering trusted diagnostic
              and biomedical solutions with
              innovation, quality, and
              precision healthcare support.

            </p>


            {/* SOCIAL */}

            <div className="mt-6 flex gap-3">

              <a
                href="https://www.facebook.com/rajbiosispvtltd/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-300 hover:border-sky-700 hover:bg-sky-700 hover:text-white"
              >

                <FaFacebookF size={17} />

              </a>


              <a
                href="https://www.instagram.com/rajbiosisindia/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-300 hover:border-sky-700 hover:bg-sky-700 hover:text-white"
              >

                <FaInstagram size={18} />

              </a>

            </div>

          </div>


          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <div className="w-fit">

            <h3 className="mb-5 text-lg font-semibold text-slate-900">
              Quick Links
            </h3>

            <div className="flex w-fit flex-col gap-3 text-slate-500">

              <Link
                href={makeLink("/")}
                className="transition hover:text-sky-700"
              >
                Home
              </Link>

              <Link
                href={makeLink("/about")}
                className="transition hover:text-sky-700"
              >
                About
              </Link>

              <Link
                href={makeLink("/services")}
                className="transition hover:text-sky-700"
              >
                Services
              </Link>

              <Link
                href={makeLink("/items")}
                className="transition hover:text-sky-700"
              >
                Products
              </Link>

              <Link
                href={makeLink("/contact")}
                className="transition hover:text-sky-700"
              >
                Contact
              </Link>

            </div>

          </div>


          {/* =================================================
              CATEGORIES
          ================================================= */}

          <div className="w-fit">

            <h3 className="mb-5 text-lg font-semibold text-slate-900">
              Our Categories
            </h3>

            <div className="flex w-fit flex-col gap-3 text-slate-500">

              {categories.map((cat) => (

                <Link
                  key={cat}
                  href={makeLink(
                    `/items#${cat
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`
                  )}
                  className="w-fit text-left transition hover:text-sky-700"
                >
                  {cat}
                </Link>

              ))}

              {categories.length === 0 && (
                <>
                  <p>Diagnostic Equipment</p>
                  <p>Laboratory Solutions</p>
                  <p>Biomedical Instruments</p>
                  <p>Maintenance Support</p>
                </>
              )}

            </div>

          </div>


          {/* =================================================
              CONTACT
          ================================================= */}

          <div>

            <h3 className="mb-5 text-lg font-semibold text-slate-900">
              Contact Info
            </h3>

            <div className="space-y-4 text-slate-500">

              {/* ADDRESS */}

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">

                  <MapPin
                    size={21}
                    className="text-sky-700"
                  />

                </div>

                <p className="pt-1 leading-6">
                  {dynamicAddress}
                </p>

              </div>


              {/* PHONE */}

              <div className="flex flex-col gap-2">

                {phoneNumbers.map(
                  (num, i) => (

                    <div
                      key={i}
                      className="flex items-center gap-3"
                    >

                      <Phone
                        size={17}
                        className="shrink-0 text-sky-700"
                      />

                      <a
                        href={`tel:${num}`}
                        className="transition hover:text-sky-700"
                      >
                        {num}
                      </a>

                    </div>

                  )
                )}

              </div>


              {/* EMAIL */}

              <div className="flex items-center gap-3">

                <Mail
                  size={17}
                  className="text-sky-700"
                />

                <p>

                  <a
                    href={`mailto:${email}`}
                    className="transition hover:text-sky-700"
                  >
                    {email}
                  </a>

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="mt-10 flex flex-col items-center justify-between border-t border-slate-200 pt-5 text-sm text-slate-500 md:flex-row">

          <p>
            © 2026 Central Biomedicals.
            All rights reserved.
          </p>

          <p className="mt-3 md:mt-0">
            Trusted Biomedical & Diagnostic Solutions
          </p>

        </div>

      </div>

    </footer>
  );
}