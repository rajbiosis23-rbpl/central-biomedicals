"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  PackageCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";

export default function ProductsPage() {

  const products = [

    {
      category: "Electrolyte Reagents",
      title: "Roche 9180 Electrolyte Reagent",
      image: "/images/product-1.jpg",
      description:
        "High precision electrolyte reagent for Roche analyzers.",
      brand: "Roche",
      model: "9180",
      slug: "roche-9180-electrolyte-reagent",
    },

    {
      category: "Electrolyte Reagents",
      title: "ERBA EC 90 Reagent",
      image: "/images/product-2.jpg",
      description:
        "Premium quality electrolyte reagent.",
      brand: "ERBA",
      model: "EC90",
      slug: "erba-ec90",
    },

    {
      category: "Rapid Test Kits",
      title: "COVID Rapid Test Kit",
      image: "/images/product-3.jpg",
      description:
        "Fast and reliable rapid testing solution.",
      brand: "Bio",
      model: "RT-100",
      slug: "covid-kit",
    },

    {
      category: "Rapid Test Kits",
      title: "Dengue Rapid Kit",
      image: "/images/product-4.jpg",
      description:
        "High sensitivity dengue rapid test.",
      brand: "Bio",
      model: "DG200",
      slug: "dengue-kit",
    },

    {
      category: "Hematology",
      title: "Hematology Reagent",
      image: "/images/product-5.jpg",
      description:
        "Premium hematology solution.",
      brand: "Mindray",
      model: "BC5300",
      slug: "hematology",
    },

  ];

  const [search, setSearch] =
    useState("");

  const [openedCategory, setOpenedCategory] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("");

  const filteredProducts =
    useMemo(() => {

      return products.filter((item) => {

        const text = `
        ${item.title}
        ${item.brand}
        ${item.category}
        `.toLowerCase();

        return text.includes(
          search.toLowerCase()
        );

      });

    }, [search]);

  const groupedProducts =
    useMemo(() => {

      const obj = {};

      filteredProducts.forEach((item) => {

        if (!obj[item.category]) {

          obj[item.category] = [];

        }

        obj[item.category].push(item);

      });

      return obj;

    }, [filteredProducts]);

  const categories =
    Object.keys(groupedProducts);

  const toggleCategory = (category) => {

    if (openedCategory === category) {

      setOpenedCategory("");

      return;

    }

    setOpenedCategory(category);

  };

  const scrollToProduct = (
    slug,
    category
  ) => {

    setOpenedCategory(category);

    setActiveCategory(category);

    setTimeout(() => {

      const el =
        document.getElementById(slug);

      if (el) {

        el.scrollIntoView({

          behavior: "smooth",

          block: "start",

        });

      }

    }, 250);

  };

  return (
  <>
    <PageBanner
      title="Our Products"
      subtitle="Explore advanced biomedical and diagnostic equipment designed for modern healthcare excellence."
    />

    <section className="py-24 bg-slate-50">

      <div className="max-w-7xl mx-auto px-5">

        <SectionTitle
          badge="Featured Products"
          title="Premium Biomedical Equipment"
          description="Discover premium diagnostic products for hospitals and laboratories."
          center
        />

        <div className="grid lg:grid-cols-[320px_1fr] gap-10 mt-16">

          {/* ======================
                LEFT SIDEBAR
          ====================== */}

          <aside className="sticky top-28 h-fit bg-white rounded-3xl border border-slate-200 shadow-xl p-6">

            <h2 className="text-2xl font-bold">

              Categories

            </h2>

            <input
              type="text"
              placeholder="Search Product..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-12 mt-5 rounded-xl border border-slate-300 px-4 outline-none focus:border-sky-600"
            />

            <div className="mt-6 space-y-3">

              {categories.map((category) => (

                <div
                  key={category}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >

                  <button
                    onClick={() =>
                      toggleCategory(category)
                    }
                    className={`w-full flex items-center justify-between px-5 py-4 transition

                    ${
                      activeCategory === category
                        ? "bg-sky-700 text-white"
                        : "bg-white hover:bg-slate-50"
                    }
                    `}
                  >

                    <span className="flex items-center gap-3">

                      {openedCategory === category ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}

                      {category}

                    </span>

                    <span className="text-sm font-semibold">

                      {
                        groupedProducts[
                          category
                        ].length
                      }

                    </span>

                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight:
                        openedCategory === category
                          ? groupedProducts[
                              category
                            ].length *
                              46 +
                            "px"
                          : "0px",
                    }}
                  >

                    {groupedProducts[
                      category
                    ].map((item) => (

                      <button
                        key={item.slug}
                        onClick={() =>
                          scrollToProduct(
                            item.slug,
                            category
                          )
                        }
                        className="block w-full text-left px-6 py-3 border-t border-slate-100 hover:bg-slate-50 text-sm"
                      >

                        {item.title}

                      </button>

                    ))}

                  </div>

                </div>

              ))}

            </div>

          </aside>

          {/* ======================
                RIGHT SIDE
          ====================== */}

          <div>

            <div className="space-y-12">

                            {Object.entries(groupedProducts).map(
                ([category, list]) => (

                  <section
                    key={category}
                    id={category
                      .replace(/\s+/g, "-")
                      .toLowerCase()}
                  >

                    {/* CATEGORY TITLE */}

                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">

                      <h2 className="text-3xl font-bold text-slate-900">

                        {category}

                      </h2>

                      <span className="text-slate-500 font-medium">

                        {list.length} Products

                      </span>

                    </div>

                    <div className="space-y-6">

                      {list.map((product) => (

                        <div
                          key={product.slug}
                          id={product.slug}
                          className="bg-white rounded-[28px] border border-slate-200 shadow-lg p-7 hover:shadow-xl transition"
                        >

                          <div className="grid lg:grid-cols-[250px_1fr_180px] gap-8 items-center">

                            {/* IMAGE */}

                            <div className="bg-slate-100 rounded-2xl h-[220px] flex items-center justify-center overflow-hidden">

                              <Image
                                src={product.image}
                                alt={product.title}
                                width={220}
                                height={220}
                                className="object-contain max-h-[180px]"
                              />

                            </div>

                            {/* CONTENT */}

                            <div>

                              <h3 className="text-2xl font-bold text-slate-900">

                                {product.title}

                              </h3>

                              <p className="mt-4 text-slate-600 leading-8">

                                {product.description}

                              </p>

                              <div className="grid grid-cols-2 gap-4 mt-6">

                                <div className="rounded-xl bg-slate-50 p-4">

                                  <p className="text-xs uppercase text-slate-500">

                                    Brand

                                  </p>

                                  <p className="font-semibold mt-1">

                                    {product.brand}

                                  </p>

                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">

                                  <p className="text-xs uppercase text-slate-500">

                                    Model

                                  </p>

                                  <p className="font-semibold mt-1">

                                    {product.model}

                                  </p>

                                </div>

                              </div>

                            </div>

                            {/* BUTTON */}

                            <div className="flex justify-center lg:justify-end">

                              <Link
                                href={`/products/${product.slug}`}
                                className="w-full lg:w-auto"
                              >

                                <button className="bg-sky-700 hover:bg-sky-800 text-white font-semibold px-8 py-4 rounded-xl transition w-full">

                                  View Details

                                </button>

                              </Link>

                            </div>

                          </div>

                        </div>

                      ))}

                    </div>

                  </section>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </section>

          {/* ===========================
            WHY CHOOSE US
      =========================== */}

      <section className="py-24 bg-white">

        <div className="max-w-7xl mx-auto px-5">

          <SectionTitle
            badge="Why Choose Our Products"
            title="Trusted Quality & Innovation"
            description="Every product is manufactured to meet international quality standards with reliable support."
            center
          />

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-16">

            {[
              {
                icon: <ShieldCheck size={32} />,
                title: "Certified Quality",
                desc: "Premium products tested under strict quality standards.",
              },

              {
                icon: <Truck size={32} />,
                title: "Fast Delivery",
                desc: "Quick dispatch across India with secure packaging.",
              },

              {
                icon: <BadgeCheck size={32} />,
                title: "Trusted Support",
                desc: "Professional customer assistance whenever required.",
              },

              {
                icon: <PackageCheck size={32} />,
                title: "Premium Equipment",
                desc: "High-performance biomedical equipment for laboratories.",
              },

            ].map((item, index) => (

              <div
                key={index}
                className="bg-slate-50 rounded-[30px] p-8 border border-slate-200 text-center hover:shadow-xl transition-all duration-300"
              >

                <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-100 flex items-center justify-center text-sky-700 mb-6">

                  {item.icon}

                </div>

                <h3 className="text-2xl font-semibold text-slate-900">

                  {item.title}

                </h3>

                <p className="mt-4 text-slate-600 leading-7">

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