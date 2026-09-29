"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { fetchHomeData } from "@/lib/data-fetcher";

import CBG from "../components/img/CBG.png";

import {
  ArrowRight,
  ShieldCheck,
  Microscope,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function HeroSection({ city }) {
  const [loading, setLoading] = useState(true);

  const [heroData, setHeroData] = useState({
    title: "",
    description: "",
    button1Text: "",
    button2Text: "",
    badge: "",
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await fetchHomeData();
        if (data) {
          setHeroData(data);
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // District Routing
  const districtSlug = city
    ? city.toLowerCase().replace(/\s+/g, "-")
    : "";

  const makeLink = (path) => {
    return districtSlug ? `/${districtSlug}${path}` : path;
  };

  return (
    <section className="relative bg-gradient-to-b from-sky-50/70 via-slate-50/40 to-white overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column: Content (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-start"
          >

            {/* Badge (Dynamic from Admin if available) */}
            {loading ? (
              <div className="h-7 w-44 bg-slate-200 animate-pulse rounded-full mb-4" />
            ) : (heroData.badge || heroData.heroBadge) ? (
              <div className="inline-flex items-center gap-2 bg-white/90 border border-sky-200 text-sky-700 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-xs backdrop-blur-sm">
                <ShieldCheck size={16} className="text-sky-600" />
                <span>{heroData.badge || heroData.heroBadge}</span>
              </div>
            ) : null}

            {/* Title */}
            {loading ? (
              <div className="animate-pulse space-y-3 w-full max-w-xl">
                <div className="h-10 bg-slate-200 rounded-lg w-[90%]"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-[75%]"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-[60%]"></div>
              </div>
            ) : heroData.title ? (
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold leading-[1.2] text-slate-900 tracking-tight">
                {heroData.title}
                {city && (
                  <span className="block mt-1 text-2xl sm:text-3xl lg:text-4xl text-sky-700 font-bold">
                    in {city}
                  </span>
                )}
              </h1>
            ) : null}

            {/* Description */}
            {loading ? (
              <div className="animate-pulse mt-4 space-y-2 w-full max-w-lg">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-[85%]"></div>
                <div className="h-4 bg-slate-200 rounded w-[70%]"></div>
              </div>
            ) : heroData.description ? (
              <p className="mt-4 sm:mt-5 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                {heroData.description}
                {city && (
                  <> across <strong className="text-slate-800">{city}</strong></>
                )}
              </p>
            ) : null}

            {/* Buttons (100% Dynamic Text from Admin, No Static Text Fallback) */}
            {loading ? (
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="animate-pulse h-12 w-40 bg-slate-200 rounded-xl"></div>
                <div className="animate-pulse h-12 w-32 bg-slate-200 rounded-xl"></div>
              </div>
            ) : (heroData.button1Text || heroData.button2Text) ? (
              <div className="flex flex-wrap items-center gap-4 mt-7 sm:mt-8">
                {heroData.button1Text && (
                  <Link href={makeLink("/items")}>
                    <button className="primary-btn flex items-center gap-2 group shadow-md shadow-sky-600/20">
                      <span>{heroData.button1Text}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                )}

                {heroData.button2Text && (
                  <Link href={makeLink("/contact")}>
                    <button className="secondary-btn shadow-xs">
                      {heroData.button2Text}
                    </button>
                  </Link>
                )}
              </div>
            ) : null}

            {/* Compact Trust Metrics / Stats Strip */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 mt-8 sm:mt-10 border-t border-slate-200/80 w-full max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  10<span className="text-sky-600">+</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                  Years Experience
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  500<span className="text-sky-600">+</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                  Products Delivered
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  100<span className="text-sky-600">%</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                  Quality Assured
                </p>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Visual Showcase (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            {/* Main Showcase Image Frame */}
            <div className="relative rounded-[32px] overflow-hidden bg-white p-3 sm:p-4 border border-slate-200/80 shadow-[0_20px_50px_rgba(15,108,189,0.12)]">
              <div className="relative overflow-hidden rounded-[24px] bg-slate-100">
                <Image
                  src={CBG}
                  alt="Central Biomedicals Diagnostic & Laboratory Systems"
                  width={900}
                  height={680}
                  priority
                  className="w-full h-[280px] sm:h-[350px] lg:h-[400px] object-cover object-[20%_center] hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Floating Status Pill 1 (Top Left) */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Microscope size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Modern Labs</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Precision Tested</p>
                </div>
              </div>

              {/* Floating Status Pill 2 (Bottom Right) */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Certified Quality</p>
                  <p className="text-[11px] text-slate-500 leading-tight">ISO Compliant</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}