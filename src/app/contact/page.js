"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import PageBanner from "@/components/PageBanner";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const pathname = usePathname();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const pathParts =
    pathname?.split("/").filter(Boolean) || [];

  const staticRoutes = [
    "about",
    "services",
    "items",
    "contact",
  ];

  const currentDistrict =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : null;

  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ==========================================================
     FORM SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex =
      /^[6-9]\d{9}$/;

    if (!form.name.trim()) {
      return toast.error("Name is required");
    }

    if (!emailRegex.test(form.email)) {
      return toast.error("Enter valid email");
    }

    if (!phoneRegex.test(form.phone)) {
      return toast.error("Enter valid mobile number");
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
          "centralbiomedicalcom",
          "contactQueries"
        ),
        {
          ...form,
          createdAt: new Date(),
        }
      );

      toast.success(
        "Message submitted successfully"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);

      toast.error(
        "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
     LOAD DISTRICT
  ========================================================== */

  useEffect(() => {
    const loadDistrict = async () => {
      if (!currentDistrict) return;

      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicalcom",
            "districts",
            currentDistrict
          )
        );

        if (snap.exists()) {
          setDistrictData(snap.data());
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadDistrict();
  }, [currentDistrict]);

  /* ==========================================================
     LOAD CONTACT
  ========================================================== */

  useEffect(() => {
    const loadContact = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicalcom",
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          setContactInfo(
            snap.data().contactInfo || []
          );
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  /* ==========================================================
     CONTACT DATA
  ========================================================== */

  const phone =
    contactInfo.find(
      (x) => x.label === "Phone Number"
    )?.value ||
    "+91 9983123469\n+91 9983333489";

  const email =
    contactInfo.find(
      (x) => x.label === "Email Address"
    )?.value ||
    "rajbiosis@yahoo.in";

  const address =
    contactInfo.find(
      (x) => x.label === "Office Address"
    )?.value ||
    "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, on Ajmer-Delhi, 200 Feet Bypass Rd, Jaipur, Rajasthan 302021";

  const hours =
    contactInfo.find(
      (x) => x.label === "Working Hours"
    )?.value ||
    "Mon - Sat (10AM - 6PM)";

  const dynamicAddress = districtData
    ? `${districtData.district}, ${districtData.state}, India`
    : address;

  const phoneNumbers = phone
    ? phone
      .split(/[\n,]+/)
      .map((num) => num.trim())
      .filter(Boolean)
    : [];

  const mapAddress =
    encodeURIComponent(dynamicAddress);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <section className="section-padding bg-white">

        <div className="container-custom">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <div className="mb-8 h-12 w-64 animate-pulse rounded bg-slate-100" />

              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="mb-6 h-28 animate-pulse rounded-3xl bg-slate-100"
                />
              ))}

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-10">

              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="mb-5 h-14 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}

            </div>

          </div>

        </div>

      </section>
    );
  }

  return (
    <>
      {/* ======================================================
          PAGE BANNER
      ====================================================== */}

      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with Central Biomedicals for premium diagnostic and biomedical solutions."
      />


      {/* ======================================================
          CONTACT SECTION
      ====================================================== */}

      <section className="section-padding bg-slate-50">

        <div className="container-custom grid gap-14 lg:grid-cols-2">

          {/* ==================================================
              LEFT INFO
          ================================================== */}

          <div>

            {/* Badge */}

            <span className="mb-5 inline-block rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-sky-700">

              Contact Information

            </span>


            {/* Heading */}

            <h2 className="section-title text-slate-900">
              Let’s Start a Conversation
            </h2>


            {/* Description */}

            <p className="section-subtitle text-slate-600">
              Reach out to us for healthcare
              consultation, biomedical products,
              and advanced diagnostic support.
            </p>


            {/* ==================================================
                CONTACT CARDS
            ================================================== */}

            <div className="mt-10 space-y-6">

              {/* PHONE */}

              <div className="flex items-start gap-5 rounded-[28px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_15px_40px_rgba(14,165,233,0.12)]">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-md shadow-sky-700/20">

                  <Phone size={24} />

                </div>

                <div>

                  <h4 className="text-lg font-semibold text-slate-900">
                    Phone Number
                  </h4>

                  <div className="mt-2 space-y-1">

                    {phoneNumbers.map(
                      (num, i) => (
                        <p
                          key={i}
                          className="text-sky-700"
                        >

                          <a
                            href={`tel:${num}`}
                            className="transition hover:text-sky-800"
                          >
                            {num}
                          </a>

                        </p>
                      )
                    )}

                  </div>

                </div>

              </div>


              {/* EMAIL */}

              <div className="flex items-start gap-5 rounded-[28px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_15px_40px_rgba(14,165,233,0.12)]">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-md shadow-sky-700/20">

                  <Mail size={24} />

                </div>

                <div>

                  <h4 className="text-lg font-semibold text-slate-900">
                    Email Address
                  </h4>

                  <p className="mt-2 break-all text-sky-700">
                    {email}
                  </p>

                </div>

              </div>


              {/* ADDRESS */}

              <div className="flex items-start gap-5 rounded-[28px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_15px_40px_rgba(14,165,233,0.12)]">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-md shadow-sky-700/20">

                  <MapPin size={24} />

                </div>

                <div>

                  <h4 className="text-lg font-semibold text-slate-900">
                    Office Address
                  </h4>

                  <p className="mt-2 leading-7 text-slate-600">
                    {dynamicAddress}
                  </p>

                </div>

              </div>


              {/* WORKING HOURS */}

              <div className="flex items-start gap-5 rounded-[28px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_15px_40px_rgba(14,165,233,0.12)]">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-md shadow-sky-700/20">

                  <Clock3 size={24} />

                </div>

                <div>

                  <h4 className="text-lg font-semibold text-slate-900">
                    Working Hours
                  </h4>

                  <p className="mt-2 text-sky-700">
                    {hours}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              RIGHT FORM
          ================================================== */}

          <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(14,165,233,0.10)] lg:p-10">

            <h3 className="text-3xl font-bold text-slate-900">
              Send Us Message
            </h3>

            <p className="mt-3 text-slate-600">
              Fill out the form and our team
              will contact you soon.
            </p>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* NAME */}

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15"
              />


              {/* EMAIL */}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15"
              />


              {/* PHONE */}

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(
                      /\D/g,
                      ""
                    ),
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15"
              />


              {/* SUBJECT */}

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15"
              />


              {/* MESSAGE */}

              <textarea
                rows={5}
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15"
              />


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-sky-700 py-4 font-semibold !text-white shadow-lg shadow-sky-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-800 hover:shadow-xl hover:shadow-sky-700/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >

                {submitting
                  ? "Submitting..."
                  : "Send Message"}

              </button>

            </form>

          </div>

        </div>

      </section>


      {/* ======================================================
          GOOGLE MAP
      ====================================================== */}

      <section className="bg-white pb-24">

        <div className="container-custom">

          <div className="overflow-hidden rounded-[40px] border border-slate-200 shadow-lg shadow-sky-700/10">

            <iframe
              src={`https://maps.google.com/maps?q=${mapAddress}&z=13&output=embed`}
              width="100%"
              height="500"
              loading="lazy"
              className="w-full border-0"
            />

          </div>

        </div>

      </section>

    </>
  );
}