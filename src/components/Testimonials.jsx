"use client";

import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";

export default function Testimonials() {
  const reviews = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Healthcare Specialist",
      review:
        "Central Biomedicals has consistently delivered reliable diagnostic equipment with outstanding support.",
    },
    {
      name: "Amit Sharma",
      role: "Lab Director",
      review:
        "Professional service, premium products, and excellent biomedical consultation experience.",
    },
    {
      name: "Neha Verma",
      role: "Research Head",
      review:
        "Their healthcare solutions improved our laboratory efficiency significantly.",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">

        <SectionTitle
          badge="Testimonials"
          title="What Our Clients Say"
          description="Trusted by healthcare professionals, laboratories, and biomedical institutions."
          center
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-16">

          {reviews.map((item, index) => (
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
              className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 card-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 text-yellow-400 text-xl mb-5">
                ★★★★★
              </div>

              {/* Review */}
              <p className="text-slate-600 leading-8 italic">
                "{item.review}"
              </p>

              {/* User */}
              <div className="mt-8">
                <h4 className="font-semibold text-lg">
                  {item.name}
                </h4>

                <p className="text-slate-500">
                  {item.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}