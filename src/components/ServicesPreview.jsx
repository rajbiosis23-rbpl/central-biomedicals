"use client";

import { motion } from "framer-motion";
import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import SectionTitle from "./SectionTitle";
import ServiceCard from "./ServiceCard";

export default function ServicesPreview() {
  const services = [
    {
      icon: <Microscope size={30} />,
      title: "Diagnostic Equipment",
      description:
        "Advanced diagnostic systems designed for accurate and efficient healthcare testing.",
    },
    {
      icon: <FlaskConical size={30} />,
      title: "Laboratory Solutions",
      description:
        "Reliable laboratory instruments and biomedical support for modern medical environments.",
    },
    {
      icon: <ShieldCheck size={30} />,
      title: "Maintenance Support",
      description:
        "Professional technical support and maintenance for biomedical systems.",
    },
    {
      icon: <Stethoscope size={30} />,
      title: "Healthcare Consultation",
      description:
        "Expert guidance and consultation for healthcare and biomedical operations.",
    },
  ];

  return (
    <section className="section-padding bg-slate-50">
      <div className="container-custom">

        {/* Title */}
        <SectionTitle
          badge="Our Services"
          title="Premium Diagnostic & Biomedical Services"
          description="Providing advanced healthcare technologies, laboratory systems, and trusted biomedical solutions for modern diagnostics."
          center
        />

        {/* Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-16">

          {services.map(
            (service, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 50,
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
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={
                    service.description
                  }
                />
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  );
}