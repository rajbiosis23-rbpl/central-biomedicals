"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Globe,
  Ship,
  ShieldCheck,
  Award,
  FileCheck,
  Package,
  CheckCircle2,
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";

export default function ExportClient() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    buyerType: "International Medical Distributor",
    productInterest: "Hematology & Biochemistry Analyzers",
    quantity: "Bulk Container / Multi-unit",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanPhone = form.phone.replace(/[^0-9+]/g, "");

    if (!form.name.trim()) return toast.error("Full Name is required");
    if (!emailRegex.test(form.email)) return toast.error("Enter valid email");
    if (!cleanPhone || cleanPhone.length < 7) return toast.error("Enter valid phone number with country code");
    if (!form.country.trim()) return toast.error("Country is required");

    try {
      setSubmitting(true);

      const res = await fetch("/api/contact-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          country: form.country,
          buyerType: form.buyerType,
          subject: `Export Query: ${form.productInterest || form.buyerType}`,
          message: `Product Interest: ${form.productInterest}\nQuantity: ${form.quantity}\nDetails: ${form.message}`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
        toast.success("Export quotation request submitted! Our international team will contact you promptly.");
        setForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          country: "",
          buyerType: "International Medical Distributor",
          productInterest: "Hematology & Biochemistry Analyzers",
          quantity: "Bulk Container / Multi-unit",
          message: "",
        });
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting export query:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageBanner
        title="International B2B Export & Global Medical Supply"
        subtitle="Indian Manufacturer & Supplier of Diagnostic Equipment, Laboratory Analyzers, and Medical Instruments for Global Markets."
      />

      {/* Main Export Overview */}
      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionTitle
              badge="Export Capabilities"
              title="Global Healthcare & Laboratory Product Exporter"
              description="Central Biomedicals provides high-performance diagnostic machinery, biochemistry analyzers, and laboratory equipment engineered for global healthcare standards."
            />

            <div className="mt-8 space-y-4 text-slate-600 leading-8">
              <p>
                We collaborate with international healthcare buyers, regional distributors, diagnostic chains, and medical importers to deliver cost-effective, high-accuracy biomedical equipment.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Worldwide Export Compliance & Safe Export Packaging",
                  "Complete Documentation (Certificate of Origin, Commercial Invoice, Packing List)",
                  "OEM & Private Label Branding Opportunities",
                  "Dedicated Distributor Partnership & Technical Training Support",
                  "Consolidated Multi-Product Shipments for Reduced Freight Costs",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-sky-600 shrink-0 mt-1" size={20} />
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[36px] border border-slate-200 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Request Export Quotation
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Fill out your product requirements to receive international pricing and freight details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@company.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+254 712 345678"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Importer / Hospital Name"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Destination Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="e.g. Kenya, UAE, Saudi Arabia"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Buyer Category
                  </label>
                  <select
                    name="buyerType"
                    value={form.buyerType}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                  >
                    <option value="International Medical Distributor">Medical Distributor</option>
                    <option value="Hospital / Healthcare Group">Hospital Procurement</option>
                    <option value="OEM / Private Label Buyer">OEM Partner</option>
                    <option value="Diagnostic Laboratory Chain">Diagnostic Lab Chain</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Product Interest
                  </label>
                  <input
                    type="text"
                    name="productInterest"
                    placeholder="e.g. CBC Machine, Biochemistry"
                    value={form.productInterest}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Detailed Requirements / Target Quantity
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Specify units, tender requirements, or port of delivery..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-sky-700 text-white font-semibold py-3.5 rounded-xl hover:bg-sky-800 transition disabled:opacity-50 text-sm"
              >
                {submitting ? "Submitting..." : "Submit Export Quote Request"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Export Services Grid */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <SectionTitle
            badge="B2B Supply Features"
            title="Why Partner With Us For Export"
            description="Proven logistical efficiency, robust packaging, and specialized international buyer support."
            center
          />

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mt-16">
            {[
              {
                icon: <Ship size={32} />,
                title: "Global Freight & Logistics",
                desc: "Air and sea cargo shipping with export-worthy protective wooden crate packaging to ensure damage-free transit.",
              },
              {
                icon: <FileCheck size={32} />,
                title: "Export Documentation",
                desc: "Assistance with commercial invoices, certificate of origin, and custom documentation required for import clearance.",
              },
              {
                icon: <Package size={32} />,
                title: "OEM & Private Labeling",
                desc: "Custom branding options for international distributors seeking proprietary diagnostic product lines.",
              },
              {
                icon: <Globe size={32} />,
                title: "Multi-Market Adaptability",
                desc: "Voltage and language compatibility options tailored for diverse regional laboratory requirements.",
              },
              {
                icon: <ShieldCheck size={32} />,
                title: "Quality Assurance",
                desc: "Pre-dispatch inspection and performance calibration for all diagnostic analyzers.",
              },
              {
                icon: <Award size={32} />,
                title: "Technical Support",
                desc: "Remote installation guidance, online technical troubleshooting, and spare parts availability.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[30px] p-8 border border-slate-200 card-shadow hover:shadow-xl transition"
              >
                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Buyer FAQ */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <SectionTitle
            badge="Export FAQs"
            title="Frequently Asked Export Questions"
            description="Key information for international buyers, importers, and hospital procurement departments."
            center
          />

          <div className="mt-12 space-y-6">
            {[
              {
                q: "Do you export medical diagnostic equipment globally?",
                a: "Yes, Central Biomedicals supplies and exports hematology analyzers, biochemistry instruments, and lab equipment to healthcare buyers and distributors internationally.",
              },
              {
                q: "What is your typical order dispatch timeframe for export?",
                a: "Standard diagnostic machines are typically prepared and dispatched within 7–14 business days depending on order volume and custom branding requirements.",
              },
              {
                q: "Can we request OEM or private-label packaging?",
                a: "Yes, we support OEM branding and private-label requests for established distributors and medical equipment dealers.",
              },
              {
                q: "How can I request an export price list?",
                a: "Fill out our export quotation form on this page or contact us with your required equipment quantities and target destination port.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600 leading-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
