import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container-custom py-16">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold text-sky-700">
              Central
              <span className="text-slate-900">
                {" "}Biomedicals
              </span>
            </h2>

            <p className="mt-5 text-slate-600 leading-7">
              Delivering trusted diagnostic
              and biomedical solutions with
              innovation, quality, and
              precision healthcare support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-slate-600">
              <Link href="/">
                Home
              </Link>

              <Link href="/about">
                About
              </Link>

              <Link href="/services">
                Services
              </Link>

              <Link href="/products">
                Products
              </Link>

              <Link href="/contact">
                Contact
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-5">
              Services
            </h3>

            <div className="flex flex-col gap-3 text-slate-600">
              <p>Diagnostic Equipment</p>
              <p>Laboratory Solutions</p>
              <p>Biomedical Instruments</p>
              <p>Maintenance Support</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-5">
              Contact Info
            </h3>

            <div className="space-y-4 text-slate-600">

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-1 text-sky-700"
                />
                <p>
                  Your Office Address Here
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-sky-700"
                />
                <p>+91 9876543210</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-sky-700"
                />
                <p>
                  info@centralbiomedicals.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">

          <p>
            © 2026 Central Biomedicals.
            All rights reserved.
          </p>

          <p className="mt-3 md:mt-0">
            Designed with precision for
            modern diagnostics.
          </p>
        </div>
      </div>
    </footer>
  );
}