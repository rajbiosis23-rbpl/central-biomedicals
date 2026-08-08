"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchContactData, fetchDistrictData } from "@/lib/data-fetcher";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Clock3, Globe, Building } from "lucide-react";

import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";

export default function ContactClient() {
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "India",
    buyerType: "Distributor / Importer",
    subject: "",
    message: "",
  });

  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const currentDistrict = pathParts.length > 0 && pathParts[0] !== "contact" ? pathParts[0] : null;

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

    if (!form.name.trim()) {
      return toast.error("Name is required");
    }

    if (!emailRegex.test(form.email)) {
      return toast.error("Enter valid email");
    }

    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 16) {
      return toast.error("Enter valid contact/mobile number");
    }

    if (!form.message.trim()) {
      return toast.error("Message is required");
    }

    try {
      setSubmitting(true);

      await addDoc(
        collection(
          db,
          "websitesQueries",
          "centralbiomedicals",
          "contactQueries"
        ),
        {
          ...form,
          createdAt: new Date(),
        }
      );

      toast.success("Message submitted successfully. Our export team will contact you shortly.");

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "India",
        buyerType: "Distributor / Importer",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Error submitting contact query:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadDistrict = async () => {
      if (!currentDistrict) return;
      try {
        const data = await fetchDistrictData(currentDistrict);
        if (data) {
          setDistrictData(data);
        }
      } catch (err) {
        console.error("Error loading district in contact page:", err);
      }
    };

    loadDistrict();
  }, [currentDistrict]);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const data = await fetchContactData();
        if (data) {
          setContactInfo(data.contactInfo || []);
        }
      } catch (err) {
        console.error("Error loading contact info in contact page:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  const phone = contactInfo.find((x) => x.label === "Phone Number")?.value || "+91 9983123469";
  const email = contactInfo.find((x) => x.label === "Email Address")?.value || "info@centralbiomedicals.com";
  const address = contactInfo.find((x) => x.label === "Office Address")?.value || "India";
  const hours = contactInfo.find((x) => x.label === "Working Hours")?.value || "";

  const dynamicAddress = districtData
    ? `${districtData.district}, ${districtData.state}, India`
    : address;

  if (loading) {
    return (
      <>
        <div className="h-[280px] bg-slate-100 animate-pulse" />
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-16 animate-pulse">
              <div className="space-y-6">
                <div className="h-10 w-2/3 bg-slate-200 rounded" />
                <div className="h-6 w-full bg-slate-200 rounded" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 h-[500px] rounded-[32px]" />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title={districtData ? `Contact Us in ${districtData.district}` : "Contact & Export Inquiries"}
        subtitle="Get in touch with Central Biomedicals for reliable diagnostic equipment, domestic sales, and international export orders."
      />

      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Get in Touch
            </h2>
            <p className="mt-5 text-slate-600 leading-8 text-lg">
              Have questions about our medical equipment, pricing, OEM solutions, or export requirements?
              Fill out the form or reach us directly.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Office Address</h4>
                  <p className="text-slate-600 mt-1 leading-7">{dynamicAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Phone Number</h4>
                  <p className="text-slate-600 mt-1 leading-7">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Email Address</h4>
                  <p className="text-slate-600 mt-1 leading-7">{email}</p>
                </div>
              </div>

              {hours && (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Clock3 size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Working Hours</h4>
                    <p className="text-slate-600 mt-1 leading-7">{hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-8 sm:p-10 rounded-[36px] shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Send Enquiry / Request Quote
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center gap-1">
                    <Building size={14} /> Company / Hospital Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company or Hospital"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center gap-1">
                    <Globe size={14} /> Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="e.g. Kenya, UAE, India"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Buyer Category
                </label>
                <select
                  name="buyerType"
                  value={form.buyerType}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                >
                  <option value="Distributor / Importer">International Medical Distributor / Importer</option>
                  <option value="Hospital / Healthcare Facility">Hospital / Pathology Laboratory</option>
                  <option value="OEM / Private Label Buyer">OEM / Private Label Partner</option>
                  <option value="Government / NGO Procurement">Government / NGO Procurement</option>
                  <option value="Domestic Dealer">Domestic Dealer / Supplier</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Subject / Product Interest
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g., Bulk Hematology Analyzer Order / Quotation"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Message / Quantity Requirements *
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Describe your equipment requirements, target quantities, or delivery destination..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-sky-700 text-white font-semibold py-4 rounded-2xl hover:bg-sky-800 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Send Export & Product Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
