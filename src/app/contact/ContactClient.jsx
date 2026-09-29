"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchContactData, fetchDistrictData } from "@/lib/data-fetcher";
import { parseContactInfo } from "@/lib/contact-parser";
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

      const res = await fetch("/api/contact-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
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
      } else {
        toast.error(data.error || "Something went wrong");
      }
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
          setContactInfo(data.contactInfo || (Array.isArray(data) ? data : []));
        }
      } catch (err) {
        console.error("Error loading contact info in contact page:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  const parsed = parseContactInfo(contactInfo);
  const dynamicAddress = districtData
    ? `${districtData.district}, ${districtData.state}, India`
    : parsed.address;

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
        title={districtData ? `Contact Us in ${districtData.district}` : "Contact Us & B2B Inquiries"}
        subtitle="Get in touch with Central Biomedicals for reliable diagnostic and laboratory equipment support worldwide."
      />

      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Get in Touch
            </h2>
            <p className="mt-5 text-slate-600 leading-8 text-lg">
              Have questions about our biomedical instruments, export pricing, bulk distribution, or technical support?
              Fill out the form or reach us directly.
            </p>

            <div className="mt-10 space-y-6">
              {dynamicAddress && (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Office Address</h4>
                    <p className="text-slate-600 mt-1 leading-7">{dynamicAddress}</p>
                  </div>
                </div>
              )}

              {parsed.phones.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Phone Number</h4>
                    <div className="text-slate-600 mt-1 leading-7 space-y-1">
                      {parsed.phones.map((phoneNum, idx) => (
                        <a
                          key={idx}
                          href={`tel:${phoneNum.replace(/[^0-9+]/g, "")}`}
                          className="hover:text-sky-700 transition block"
                        >
                          {phoneNum}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {parsed.emails.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Email Address</h4>
                    <div className="text-slate-600 mt-1 leading-7 space-y-1">
                      {parsed.emails.map((emailStr, idx) => (
                        <a
                          key={idx}
                          href={`mailto:${emailStr}`}
                          className="hover:text-sky-700 transition block"
                        >
                          {emailStr}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {parsed.workingHours && (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Clock3 size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Working Hours</h4>
                    <p className="text-slate-600 mt-1 leading-7">{parsed.workingHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-8 sm:p-10 rounded-[36px] shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Send Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  required
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
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Mobile Number"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Hospital, Lab or Business"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="e.g. India, UAE, Kenya"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Subject / Requirement
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Quotation, Product Enquiry, Distribution..."
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us about your requirements..."
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
                {submitting ? "Submitting..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
