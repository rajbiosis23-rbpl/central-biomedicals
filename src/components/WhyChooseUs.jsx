"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Microscope,
  HeartPulse,
  BadgeCheck,
} from "lucide-react";

import SectionTitle from "./SectionTitle";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Microscope size={30} />,
      title: "Advanced Technology",
      description:
        "Modern biomedical and diagnostic equipment for accurate healthcare solutions.",
    },
    {
      icon: <ShieldCheck size={30} />,
      title: "Trusted Quality",
      description:
        "Reliable and certified diagnostic systems with premium quality standards.",
    },
    {
      icon: <HeartPulse size={30} />,
      title: "Healthcare Focused",
      description:
        "Delivering healthcare-driven biomedical solutions with precision and care.",
    },
    {
      icon: <BadgeCheck size={30} />,
      title: "Expert Support",
      description:
        "Professional consultation and technical support for all medical needs.",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">

        {/* Section Title */}
        <SectionTitle
          badge="Why Choose Us"
          title="Trusted Biomedical Excellence"
          description="We deliver innovative diagnostic technologies and biomedical solutions with precision, trust, and unmatched service quality."
          center
        />

        {/* Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-16">

          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              viewport={{
                once: true,
              }}
              className="bg-slate-50 p-8 rounded-[28px] border border-slate-100 hover:-translate-y-2 transition-all duration-300 card-shadow"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-4 text-slate-900">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 leading-7">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}