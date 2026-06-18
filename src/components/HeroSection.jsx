"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import CBG from "../components/img/CBG.png";
import { ArrowRight, ShieldCheck, Microscope,BadgeCheck,} from "lucide-react";

export default function HeroSection({ city }) {
  return (
    <section className="gradient-bg overflow-hidden">
      <div className="container-custom min-h-[85vh] py-20 lg:py-0 grid lg:grid-cols-2 gap-14 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold mb-7">
            <ShieldCheck size={18} />
            Trusted Biomedical Systems
          </div>

          {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-slate-900">
            Advanced
            <span className="text-sky-700"> Diagnostic</span>
            <br />
            & Biomedical
            <br />
            Excellence
            {city && (
              <>
                <br />
                <span className="text-2xl lg:text-4xl text-sky-700 font-semibold">
                  in {city}
                </span>
              </>
            )}
          </h1>

          {/* Description */}
      <p className="mt-7 text-slate-600 text-lg leading-8 max-w-xl">
          Delivering high-quality diagnostic and biomedical technologies
          {city && (
            <>
              {" "}across <strong>{city}</strong>
            </>
          )}{" "}
          with precision, innovation, and trusted healthcare excellence.
        </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/services">
              <button className="primary-btn flex items-center gap-2">
                Explore Services
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link href="/contact">
              <button className="secondary-btn">
                Contact Us
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12">

            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                10+
              </h3>
              <p className="text-slate-500">
                Years Experience
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                500+
              </h3>
              <p className="text-slate-500">
                Products Delivered
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                100%
              </h3>
              <p className="text-slate-500">
                Quality Assurance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >

          {/* Main Image Card */}
          <div className="glass-card rounded-[40px] p-6 card-shadow">
           <Image
             src={CBG}
            alt="Central Biomedical"
            width={1200}
            height={900}
            className="rounded-[28px] object-cover object-[20%_center] h-[350px] sm:h-[450px] lg:h-[550px] w-full"
          />
          </div>

          {/* Floating Card 1 */}
        <div
          className="absolute top-10 -left-10 bg-white p-5 rounded-3xl shadow-xl hidden lg:flex items-center gap-4" style={{ marginTop: "-27px" }}>
            <div className="bg-sky-100 p-3 rounded-2xl">
              <Microscope className="text-sky-700" />
            </div>

            <div>
              <h4 className="font-semibold">
                Modern Labs
              </h4>
              <p className="text-sm text-slate-500">
                Precision Equipment
              </p>
            </div>
          </div>

          {/* Floating Card 2 */}
          <div className="absolute bottom-10 -right-8 bg-white p-5 rounded-3xl shadow-xl hidden lg:flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-2xl">
              <BadgeCheck className="text-teal-700" />
            </div>

            <div>
              <h4 className="font-semibold">
                Trusted Quality
              </h4>
              <p className="text-sm text-slate-500">
                Certified Solutions
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}