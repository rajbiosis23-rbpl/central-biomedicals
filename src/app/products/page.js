import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  PackageCheck,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";

export default function ProductsPage() {
  const products = [
    {
      title: "Diagnostic Analyzer",
      image: "/images/product-1.jpg",
      description:
        "High-precision biomedical diagnostic equipment for modern laboratories.",
    },
    {
      title: "Laboratory Microscope",
      image: "/images/product-2.jpg",
      description:
        "Advanced laboratory microscope designed for accuracy and research.",
    },
    {
      title: "Medical Monitoring Device",
      image: "/images/product-3.jpg",
      description:
        "Reliable patient monitoring systems for healthcare environments.",
    },
    {
      title: "Biomedical Equipment",
      image: "/images/product-4.jpg",
      description:
        "Innovative biomedical devices built for precision diagnostics.",
    },
    {
      title: "Healthcare Lab Device",
      image: "/images/product-5.jpg",
      description:
        "Modern healthcare technology for laboratories and diagnostics.",
    },
    {
      title: "Research Equipment",
      image: "/images/product-6.jpg",
      description:
        "Advanced research tools for biomedical and medical institutions.",
    },
  ];

  return (
    <>
      {/* Banner */}
      <PageBanner
        title="Our Products"
        subtitle="Explore advanced biomedical and diagnostic equipment designed for modern healthcare excellence."
      />

      {/* Products Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="Featured Products"
            title="Premium Biomedical Equipment"
            description="Discover high-quality diagnostic and biomedical technologies tailored for laboratories, healthcare institutions, and modern diagnostics."
            center
          />

          {/* Product Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mt-16">

            {products.map(
              (product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[32px] overflow-hidden border border-slate-100 card-shadow hover:-translate-y-2 transition-all duration-300"
                >

                  {/* Image */}
                  <div className="overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={500}
                      height={400}
                      className="h-[280px] object-cover hover:scale-110 transition duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-7">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {product.title}
                    </h3>

                    <p className="mt-4 text-slate-600 leading-7">
                      {product.description}
                    </p>

                    <button className="mt-6 bg-sky-700 text-white px-5 py-3 rounded-xl font-semibold hover:scale-[1.03] transition">
                      View Details
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Products */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">

          <SectionTitle
            badge="Why Our Products"
            title="Trusted Quality & Innovation"
            description="We provide biomedical products designed for performance, reliability, and healthcare excellence."
            center
          />

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-16">

            {[
              {
                icon: <ShieldCheck size={30} />,
                title: "Certified Quality",
              },
              {
                icon: <Truck size={30} />,
                title: "Fast Delivery",
              },
              {
                icon: <BadgeCheck size={30} />,
                title: "Trusted Support",
              },
              {
                icon: <PackageCheck size={30} />,
                title: "Premium Equipment",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-[30px] text-center border border-slate-100 card-shadow"
              >
                <div className="w-16 h-16 mx-auto rounded-[22px] bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                  {item.icon}
                </div>

                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </>
  );
}