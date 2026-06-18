"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const navLinks = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Services",
      path: "/services",
    },
    {
      name: "Products",
      path: "/products",
    },
    {
      name: "Contact",
      path: "/contact",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="container-custom h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <h1 className="text-xl md:text-2xl font-bold text-sky-700">
            Central
            <span className="text-slate-900">
              {" "}Biomedicals
            </span>
          </h1>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="hover:text-sky-700 transition"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Button */}
        <div className="hidden lg:block">
          <button className="primary-btn">
            Get Quote
          </button>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          className="lg:hidden"
        >
          {menuOpen ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen
            ? "max-h-[500px]"
            : "max-h-0"
        }`}
      >
        <div className="bg-white border-t border-slate-100 p-6">

          <nav className="flex flex-col gap-5 text-slate-700 font-medium">

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {link.name}
              </Link>
            ))}

            <button className="primary-btn mt-3 w-full">
              Get Quote
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}