"use client";

import {
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";

export default function ContactPage() {
  return (
    <>
      {/* Banner */}
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with Central Biomedicals for premium diagnostic and biomedical solutions."
      />

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-14">

          {/* Left Info */}
          <div>

            <span className="inline-block bg-sky-100 text-sky-700 px-5 py-2 rounded-full font-semibold mb-5">
              Contact Information
            </span>

            <h2 className="section-title">
              Let’s Start a Conversation
            </h2>

            <p className="section-subtitle">
              Reach out to us for
              healthcare consultation,
              biomedical products, and
              advanced diagnostic support.
            </p>

            {/* Contact Cards */}
            <div className="space-y-6 mt-10">

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Phone size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Phone Number
                  </h4>

                  <p className="text-slate-600 mt-2">
                    +91 9876543210
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Mail size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Email Address
                  </h4>

                  <p className="text-slate-600 mt-2">
                    info@centralbiomedicals.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <MapPin size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Office Address
                  </h4>

                  <p className="text-slate-600 mt-2">
                    Your Office Address Here
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Clock3 size={24} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Working Hours
                  </h4>

                  <p className="text-slate-600 mt-2">
                    Mon - Sat: 9 AM - 7 PM
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-[40px] p-8 lg:p-10 border border-slate-100 card-shadow">

            <h3 className="text-3xl font-bold text-slate-900">
              Send Us Message
            </h3>

            <p className="text-slate-500 mt-3">
              Fill out the form and our
              team will contact you soon.
            </p>

            <form className="mt-8 space-y-5">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600"
              />

              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-600 resize-none"
              />

              <button className="w-full bg-sky-700 text-white py-4 rounded-2xl font-semibold hover:scale-[1.01] transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="pb-24 bg-white">
        <div className="container-custom">
          <div className="rounded-[40px] overflow-hidden border border-slate-100 card-shadow">

            <iframe
              src="https://www.google.com/maps/embed?pb="
              width="100%"
              height="500"
              loading="lazy"
              className="border-0"
            ></iframe>

          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </>
  );
}