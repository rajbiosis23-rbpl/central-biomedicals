"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PhoneCall,
} from "lucide-react";

export default function CTASection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="container-custom">

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          viewport={{
            once: true,
          }}
          className="relative overflow-hidden rounded-[42px] bg-gradient-to-r from-sky-700 to-cyan-600 p-10 lg:p-20 text-white"
        >

          {/* Background Blur Effect */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-[100px]" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">

            {/* Left */}
            <div>
              <span className="inline-block bg-white/20 px-5 py-2 rounded-full text-sm font-semibold mb-5">
                Get In Touch
              </span>

              <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                Need Premium Biomedical Solutions?
              </h2>

              <p className="mt-6 text-white/80 text-lg leading-8 max-w-xl">
                Discover innovative diagnostic
                systems and trusted biomedical
                technologies tailored for modern
                healthcare excellence.
              </p>
            </div>

            {/* Right */}
            <div className="flex lg:justify-end">
              <div className="bg-white text-slate-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl">

                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                  <PhoneCall size={30} />
                </div>

                <h3 className="text-2xl font-bold">
                  Let’s Talk
                </h3>

                <p className="mt-3 text-slate-600 leading-7">
                  Contact our biomedical experts
                  for consultation, equipment,
                  and healthcare support.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">

                  <Link
                    href="/contact"
                    className="flex-1"
                  >
                    <button className="w-full bg-sky-700 text-white px-6 py-4 rounded-2xl font-semibold hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                      Contact Us
                      <ArrowRight size={18} />
                    </button>
                  </Link>

                  <button className="border border-slate-300 px-6 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition">
                    Call Now
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}