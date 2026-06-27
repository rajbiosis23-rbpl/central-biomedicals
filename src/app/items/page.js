"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  PackageCheck,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";

const makeSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const getCategory = (item) => {
  const title = (item.title || "").toLowerCase();

  if (title.includes("electrolyte")) return "Electrolyte Reagents";
  if (title.includes("hematology")) return "Hematology";
  if (title.includes("elisa")) return "ELISA Kits";
  if (title.includes("rapid")) return "Rapid Test Kits";
  if (title.includes("biochemistry")) return "Biochemistry";
  if (title.includes("immuno")) return "Immunoassay";

  return "Other Products";
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [openedCategory, setOpenedCategory] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("");

  const [pendingScroll, setPendingScroll] =
    useState(null);

  const [loadedImages, setLoadedImages] =
    useState({});

  const [showTopButton, setShowTopButton] =
    useState(false);

  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const district =
    pathParts[0] === "items"
      ? null
      : pathParts[0];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicals",
            "pages",
            "products"
          )
        );

        if (snap.exists()) {
          const data =
            snap.data().products || [];

          const published = data
            .filter(
              (item) =>
                item.isPublished !== false
            )
            .map((item, index) => ({
              ...item,
              uid: index,
              slug:
                item.slug ||
                makeSlug(item.title),
              category:
                item.category ||
                getCategory(item),
            }));

          setProducts(published);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const text = `
      ${item.title}
      ${item.brand}
      ${item.model}
      ${item.category}
      `
        .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });
  }, [products, search]);

  const groupedProducts = useMemo(() => {
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
    setPendingScroll(slug);
  };

  useEffect(() => {
    if (!pendingScroll) return;

    const timer = setTimeout(() => {
      const el =
        document.getElementById(
          pendingScroll
        );

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      setPendingScroll(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [openedCategory, pendingScroll]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(
        window.scrollY > 500
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-[32px] bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

    return (
    <>
      {/* Banner */}
      <PageBanner
        title="Our Products"
        subtitle="Explore advanced biomedical and diagnostic equipment designed for modern healthcare excellence."
      />

      {/* Products */}
      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="Featured Products"
            title="Premium Biomedical Equipment"
            description="Discover high-quality diagnostic and biomedical technologies tailored for laboratories, healthcare institutions, and modern diagnostics."
            center
          />
              </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-10 relative">
            <Search
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-16 pl-14 pr-5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Layout */}
          <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-10 mt-16 items-start">
              <aside
                className="
                  sticky
                  top-24
                  self-start
                  max-h-[calc(100vh-110px)]
                  overflow-y-auto
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                  p-6
                "
              >
                <h3 className="text-2xl font-bold mb-6">
                  Categories
                </h3>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="border rounded-2xl overflow-hidden border-slate-200"
                    >
                      <button
                        onClick={() =>
                          toggleCategory(category)
                        }
                        className={`w-full px-5 py-4 flex justify-between items-center transition-all

                        ${
                          activeCategory ===
                          category
                            ? "bg-sky-700 text-white"
                            : "bg-white hover:bg-slate-50"
                        }
                        `}
                      >

                        <span className="flex items-center gap-3">

                          {openedCategory ===
                          category ? (
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
                            openedCategory ===
                            category
                              ? groupedProducts[
                                  category
                                ].length * 48
                              : 0,
                        }}
                      >

                        {groupedProducts[
                          category
                        ].map((item) => (

                          <button
                            key={item.uid}
                            onClick={() =>
                              scrollToProduct(
                                item.slug,
                                category
                              )
                            }
                            className="block w-full text-left px-6 py-3 border-t border-slate-100 hover:bg-slate-50"
                          >

                            {item.title}

                          </button>

                        ))}

                      </div>

                    </div>

                  ))}

                </div>

              </aside>

         

            {/* ==========================
                RIGHT SIDE START
            ========================== */}

            <div className="space-y-16">
                            {Object.entries(groupedProducts).map(
                ([category, list]) => (

                  <section
                    key={category}
                    id={category
                      .replace(/\s+/g, "-")
                      .toLowerCase()}
                  >

                    {/* Category Header */}

                    <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">

                      <h2 className="text-3xl font-bold text-slate-900">
                        {category}
                      </h2>

                      <span className="text-slate-500 font-medium">
                        {list.length} Products
                      </span>

                    </div>

                    {/* Product List */}

                    <div className="space-y-8">

                      {list.map((product) => (

                        <div
                          key={product.uid}
                          id={product.slug}
                          className="bg-white rounded-[30px] border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 p-8"
                        >

                          <div className="grid lg:grid-cols-[240px_1fr_180px] gap-8 items-center">

                            {/* Image */}

                            <div className="relative h-[220px] rounded-3xl overflow-hidden bg-slate-100">

                              {!loadedImages[
                                product.uid
                              ] && (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                              )}

                              <Image
                                src={
                                  product.image ||
                                  "/placeholder.jpg"
                                }
                                alt={product.title}
                                fill
                                sizes="240px"
                                onLoad={() =>
                                  setLoadedImages(
                                    (prev) => ({
                                      ...prev,
                                      [product.uid]:
                                        true,
                                    })
                                  )
                                }
                                className={`object-contain p-5 transition duration-500 ${
                                  loadedImages[
                                    product.uid
                                  ]
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />

                            </div>

                            {/* Content */}

                            <div>

                              <h3 className="text-2xl font-bold text-slate-900">
                                {product.title}
                              </h3>

                              <p className="mt-4 text-slate-600 leading-8">
                                {product.description ||
                                  product.desc ||
                                  "Premium biomedical equipment designed for laboratories, hospitals and diagnostic centres."}
                              </p>

                              <div className="grid md:grid-cols-2 gap-4 mt-6">

                                <div className="bg-slate-50 rounded-xl p-4">
                                  <p className="text-xs uppercase text-slate-400">
                                    Brand
                                  </p>
                                  <p className="font-semibold mt-1">
                                    {product.brand ||
                                      "N/A"}
                                  </p>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4">
                                  <p className="text-xs uppercase text-slate-400">
                                    Model
                                  </p>
                                  <p className="font-semibold mt-1">
                                    {product.model ||
                                      "N/A"}
                                  </p>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4">
                                  <p className="text-xs uppercase text-slate-400">
                                    Instrument
                                  </p>
                                  <p className="font-semibold mt-1">
                                    {product.instrument ||
                                      "N/A"}
                                  </p>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4">
                                  <p className="text-xs uppercase text-slate-400">
                                    Category
                                  </p>
                                  <p className="font-semibold mt-1">
                                    {product.category}
                                  </p>
                                </div>

                              </div>

                            </div>

                            {/* Button */}

                            <div className="flex justify-center lg:justify-end">

                              <Link
                                href={
                                  district
                                    ? `/${district}/items/${product.slug}`
                                    : `/items/${product.slug}`
                                }
                                className="px-8 py-4 rounded-2xl bg-sky-700 text-white font-semibold hover:bg-sky-800 transition whitespace-nowrap"
                              >
                                Get Quote
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
                className="bg-white rounded-[30px] border border-slate-100 card-shadow text-center p-8"
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

      {/* Back To Top */}

      {showTopButton && (

        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-sky-700 text-white shadow-2xl hover:scale-110 transition flex items-center justify-center"
        >

          <ChevronUp size={24} />

        </button>

      )}

    </>

  );

}