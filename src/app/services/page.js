import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Activity,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import CTASection from "@/components/CTASection";

export default function ServicesPage() {
  const services = [
    {
      icon: <Microscope size={30} />,
      title: "Diagnostic Equipment",
      description:
        "Advanced diagnostic technologies for precision testing and healthcare efficiency.",
    },
    {
      icon: <FlaskConical size={30} />,
      title: "Laboratory Solutions",
      description:
        "Modern laboratory instruments designed for high performance and accuracy.",
    },
    {
      icon: <ShieldCheck size={30} />,
      title: "Biomedical Instruments",
      description:
        "Reliable biomedical devices supporting modern healthcare environments.",
    },
    {
      icon: <Stethoscope size={30} />,
      title: "Healthcare Consultation",
      description:
        "Professional consultation for diagnostics and healthcare solutions.",
    },
    {
      icon: <Wrench size={30} />,
      title: "Maintenance Support",
      description:
        "End-to-end maintenance and technical support for biomedical systems.",
    },
    {
      icon: <Activity size={30} />,
      title: "Research Assistance",
      description:
        "Expert support for biomedical research and advanced healthcare projects.",
    },
  ];

  return (
    <>
      {/* Banner */}
      <PageBanner
        title="Our Services"
        subtitle="Delivering trusted biomedical and diagnostic services with innovation, precision, and healthcare excellence."
      />

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="What We Offer"
            title="Premium Biomedical Services"
            description="We provide innovative healthcare and biomedical solutions tailored to modern diagnostics and laboratory excellence."
            center
          />

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mt-16">
            {services.map(
              (service, index) => (
                <ServiceCard
                  key={index}
                  icon={service.icon}
                  title={service.title}
                  description={
                    service.description
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* Working Process */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">

          <SectionTitle
            badge="How We Work"
            title="Simple & Professional Process"
            description="We follow a streamlined process to ensure reliable biomedical and healthcare solutions."
            center
          />

          <div className="grid lg:grid-cols-3 gap-8 mt-16">

            {[
              {
                step: "01",
                title: "Consultation",
                desc:
                  "Understanding healthcare requirements and diagnostics needs.",
              },
              {
                step: "02",
                title: "Implementation",
                desc:
                  "Delivering biomedical equipment and technical setup.",
              },
              {
                step: "03",
                title: "Support",
                desc:
                  "Providing maintenance and healthcare assistance.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-[30px] p-8 card-shadow border border-slate-100"
              >
                <span className="text-5xl font-bold text-sky-100">
                  {item.step}
                </span>

                <h3 className="text-2xl font-semibold mt-5">
                  {item.title}
                </h3>

                <p className="text-slate-600 mt-4 leading-7">
                  {item.desc}
                </p>
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