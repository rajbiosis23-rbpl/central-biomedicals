"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  PackageCheck,
  Search,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loadedImages, setLoadedImages] = useState({});
  const pathname = usePathname();

  const pathParts = pathname.split("/").filter(Boolean);

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
          const data = snap.data().products || [];

          setProducts(
            data.filter(
              (item) => item.isPublished !== false
            )
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.brand?.toLowerCase().includes(search.toLowerCase()) ||
    item.model?.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 12;

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
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

      {/* Products Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="Featured Products"
            title="Premium Biomedical Equipment"
            description="Discover high-quality diagnostic and biomedical technologies tailored for laboratories, healthcare institutions, and modern diagnostics."
            center
          />

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mt-10 relative">
            <Search
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search products by name, brand or model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-16 pl-14 pr-5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {filteredProducts.length > 0 ? (
            <>
              {/* Product Grid */}
              <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mt-16">

                {paginatedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[32px] overflow-hidden border border-slate-100 card-shadow hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
                  >

                    {/* Image */}
                    <div className="relative h-[260px] bg-gray-100 overflow-hidden">

                      {!loadedImages[index] && (
                        <div className="absolute inset-0 animate-pulse bg-gray-200" />
                      )}

                      <Image
                        src={product.image || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        onLoad={() =>
                          setLoadedImages((prev) => ({
                            ...prev,
                            [index]: true,
                          }))
                        }
                        className={`object-cover hover:scale-110 transition duration-500 ${loadedImages[index]
                          ? "opacity-100"
                          : "opacity-0"
                          }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">

                      <h3 className="text-lg font-bold line-clamp-2">
                        {product.title}
                      </h3>

                      <div className="mt-4 space-y-2">

                        <p className="text-sm text-gray-600">
                          <b>Brand:</b> {product.brand || "N/A"}
                        </p>

                        <p className="text-sm text-gray-600">
                          <b>Model:</b> {product.model || "N/A"}
                        </p>

                      </div>

                      <div className="mt-auto pt-6">
                        <Link
                          href={
                            district
                              ? `/${district}/items/${product.slug}`
                              : `/items/${product.slug}`
                          }
                          className="block w-full bg-sky-700 text-white py-3 rounded-xl text-center font-medium hover:bg-sky-800 transition"
                        >
                          Get Quote
                        </Link>
                      </div>

                    </div>
                  </div>
                ))}

              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-3 mt-12">

                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border rounded-xl disabled:opacity-40"
                >
                  ◀
                </button>

                {Array.from(
                  {
                    length: Math.min(3, totalPages),
                  },
                  (_, i) => {
                    let pageNumber;

                    if (currentPage <= 2) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = currentPage - 1 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() =>
                          setCurrentPage(pageNumber)
                        }
                        className={`w-10 h-10 rounded-xl ${currentPage === pageNumber
                          ? "bg-sky-700 text-white"
                          : "border"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                  className="px-4 py-2 border rounded-xl disabled:opacity-40"
                >
                  ▶
                </button>

              </div>
            </>
          ) : (
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-lg">

                <div className="w-20 h-20 mx-auto mb-6 bg-sky-100 rounded-full flex items-center justify-center">
                  <Search
                    size={32}
                    className="text-sky-700"
                  />
                </div>

                <h3 className="text-2xl font-bold text-slate-800">
                  No Products Found
                </h3>

                <p className="text-slate-500 mt-3">
                  No products matched
                  <span className="font-semibold">
                    {" "} "{search}" {" "}
                  </span>
                </p>

                <button
                  onClick={() => setSearch("")}
                  className="mt-6 px-6 py-3 bg-sky-700 text-white rounded-xl hover:bg-sky-800 transition"
                >
                  Clear Search
                </button>

              </div>
            </div>
          )}

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