"use client";

import { motion } from "framer-motion";

export default function PageBanner({
  title,
  subtitle,
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-28 lg:py-36">

      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-sky-200/30 rounded-full blur-[100px]" />

      <div className="container-custom relative z-10">

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="text-center max-w-4xl mx-auto"
        >

          {/* Title */}
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-slate-600 text-lg leading-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}