import Image from "next/image";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import DDS from "@/components/img/Dds.png";

export default function AboutPage() {
  return (
    <>
      {/* Banner */}
      <PageBanner
        title="About Central Biomedicals"
        subtitle="Delivering trusted diagnostic and biomedical technologies with innovation, quality, and healthcare precision."
      />

      {/* About Section */}
      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Image */}
          <div className="relative">
       <div className="rounded-[40px] overflow-hidden card-shadow bg-slate-100 h-[600px] flex items-center justify-center p-10">
  <Image
    src={DDS}
    alt="About"
    width={1200}
    height={900}
    className="max-w-full max-h-full object-contain"
  />
</div>

            {/* Floating Card */}
            <div className="absolute bottom-8 left-8 bg-white p-6 rounded-[26px] shadow-2xl hidden lg:block">
              <h3 className="text-3xl font-bold text-sky-700">
                10+
              </h3>

              <p className="text-slate-500">
                Years of Excellence
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <SectionTitle
              badge="Who We Are"
              title="Trusted Partner in Biomedical & Diagnostics"
              description="We provide advanced diagnostic and biomedical solutions focused on healthcare innovation, laboratory precision, and modern medical excellence."
            />

            <p className="mt-8 text-slate-600 leading-8">
              At Central Biomedicals,
              we are committed to
              delivering premium-quality
              healthcare and biomedical
              technologies designed to
              improve diagnostics,
              laboratory performance,
              and medical efficiency.
            </p>

            <p className="mt-5 text-slate-600 leading-8">
              Our mission is to empower
              healthcare professionals
              with trusted equipment,
              expert consultation, and
              innovative biomedical
              support.
            </p>

            {/* Feature Points */}
            <div className="grid sm:grid-cols-2 gap-5 mt-10">

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-semibold text-lg">
                  Premium Equipment
                </h4>

                <p className="text-slate-500 mt-2">
                  High-end diagnostic
                  technologies.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-semibold text-lg">
                  Expert Support
                </h4>

                <p className="text-slate-500 mt-2">
                  Trusted healthcare
                  consultation.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}