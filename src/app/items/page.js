"use client";

import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  PackageCheck,
  Search,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { fetchFullCatalog } from "@/lib/data-fetcher";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";
import ProductCard from "@/components/ProductCard";

// 1. Memoized Product Link Component
const ProductLink = memo(function ProductLink({ item, category, scrollToProduct }) {
  return (
    <button
      onClick={() => scrollToProduct(item.slug, category)}
      className="block w-full text-left py-1 text-sm text-slate-500 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 font-medium"
    >
      • {item.title}
    </button>
  );
});

// 2. Memoized Subcategory Component (renders product list only when expanded)
const SubCategoryItem = memo(function SubCategoryItem({
  category,
  subCategory,
  subList,
  isSubOpened,
  toggleSubCategory,
  scrollToProduct,
}) {
  return (
    <div className="space-y-2 pl-2">
      {/* Subcategory Header */}
      <button
        onClick={() => toggleSubCategory(category, subCategory)}
        className="w-full text-left py-1.5 flex justify-between items-center text-xs font-bold text-sky-700 hover:text-sky-800 transition-colors uppercase tracking-wider border-b border-slate-100 pb-1"
      >
        <span className="flex items-center gap-1.5">
          <span className={`transition-transform duration-200 ${isSubOpened ? "rotate-90" : ""}`}>
            <ChevronRight size={12} className="text-sky-700" />
          </span>
          {subCategory}
        </span>
        <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full">
          {subList.length}
        </span>
      </button>

      {/* Product List Wrapper */}
      <div
        className={`transition-all duration-300 ease-in-out pl-3 overflow-hidden ${isSubOpened
            ? "max-h-48 opacity-100 mt-1 mb-2"
            : "max-h-0 opacity-0"
          }`}
      >
        {isSubOpened && (
          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {subList.map((item) => (
              <ProductLink
                key={item.uid}
                item={item}
                category={category}
                scrollToProduct={scrollToProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// 3. Memoized Category Component (renders subcategories only when expanded)
const CategoryItem = memo(function CategoryItem({
  category,
  isOpened,
  isActive,
  subcategories,
  categoryProductCount,
  toggleCategory,
  toggleSubCategory,
  openedSubCategories,
  scrollToProduct,
}) {
  return (
    <div className="group">
      <button
        onClick={() => toggleCategory(category)}
        className={`sticky top-[116px] z-10 w-full px-4 py-3 flex justify-between items-center rounded-2xl transition-all duration-200 text-left ${isActive
            ? "bg-sky-50 text-sky-700 font-bold"
            : "bg-white text-slate-700 hover:bg-slate-50 hover:text-sky-700"
          }`}
      >
        <span className="flex items-center gap-3 text-sm font-semibold leading-none">
          <span className={`transition-transform duration-200 ${isOpened ? "rotate-90" : ""}`}>
            <ChevronRight size={16} className={isActive ? "text-sky-700" : "text-slate-400 group-hover:text-sky-700"} />
          </span>
          {category}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-500"
          }`}>
          {categoryProductCount}
        </span>
      </button>

      {/* Subcategories Wrapper */}
      <div
        className={`transition-all duration-300 ease-in-out pl-4 overflow-hidden ${isOpened
            ? "max-h-[1000px] opacity-100 mt-2 mb-4"
            : "max-h-0 opacity-0"
          }`}
      >
        {isOpened && (
          <div className="space-y-3 pt-1">
            {Object.entries(subcategories || {}).map(([subCategory, subList]) => {
              const subKey = `${category}-${subCategory}`;
              const isSubOpened = !!openedSubCategories[subKey];

              return (
                <SubCategoryItem
                  key={subKey}
                  category={category}
                  subCategory={subCategory}
                  subList={subList}
                  isSubOpened={isSubOpened}
                  toggleSubCategory={toggleSubCategory}
                  scrollToProduct={scrollToProduct}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openedCategory, setOpenedCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [openedSubCategories, setOpenedSubCategories] = useState({});
  const [pendingScroll, setPendingScroll] = useState(null);
  const [showTopButton, setShowTopButton] = useState(false);

  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const district = pathParts[0] === "items" ? null : pathParts[0];

  // Fetch full catalog from central cache layer
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await fetchFullCatalog();
        setProducts(allProducts);
      } catch (err) {
        console.error("Error loading products catalog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Debounce search term updates to make search typing instant
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductSearch(searchInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Highly optimized product filtering: single-pass, case-insensitive
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;

    return products.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const brand = (item.brand || "").toLowerCase();
      const model = (item.model || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const subCategory = (item.subCategory || "").toLowerCase();

      return (
        title.includes(query) ||
        brand.includes(query) ||
        model.includes(query) ||
        category.includes(query) ||
        subCategory.includes(query)
      );
    });
  }, [products, productSearch]);

  // Group products into categories and subcategories
  const groupedProducts = useMemo(() => {
    const obj = {};

    filteredProducts.forEach((item) => {
      const cat = item.category || "Other Products";
      const sub = item.subCategory || cat;

      if (!obj[cat]) {
        obj[cat] = {};
      }
      if (!obj[cat][sub]) {
        obj[cat][sub] = [];
      }

      obj[cat][sub].push(item);
    });

    return obj;
  }, [filteredProducts]);

  // Sort categories and subcategories
  const sortedGroupedProducts = useMemo(() => {
    const entries = Object.entries(groupedProducts);

    entries.sort(([a], [b]) => {
      if (a === "Other Products") return 1;
      if (b === "Other Products") return -1;
      return a.localeCompare(b);
    });

    const sortedObj = {};
    for (const [cat, subObj] of entries) {
      const subEntries = Object.entries(subObj);
      subEntries.sort(([a], [b]) => {
        if (a === cat) return -1;
        if (b === cat) return 1;
        return a.localeCompare(b);
      });
      sortedObj[cat] = Object.fromEntries(subEntries);
    }

    return sortedObj;
  }, [groupedProducts]);

  const getCategoryProductCount = useCallback((categoryName) => {
    const catObj = groupedProducts[categoryName] || {};
    return Object.values(catObj).reduce((sum, list) => sum + list.length, 0);
  }, [groupedProducts]);

  const toggleCategory = useCallback((category) => {
    setOpenedCategory((prev) => (prev === category ? "" : category));
  }, []);

  const toggleSubCategory = useCallback((category, subCategory) => {
    const key = `${category}-${subCategory}`;
    setOpenedSubCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const scrollToProduct = useCallback((slug, category) => {
    setOpenedCategory(category);
    setActiveCategory(category);
    setPendingScroll(slug);

    // Auto-expand the target subcategory when scrolling to its product
    const prod = products.find((p) => p.slug === slug);
    if (prod && prod.subCategory) {
      const subKey = `${category}-${prod.subCategory}`;
      setOpenedSubCategories((prev) => ({
        ...prev,
        [subKey]: true,
      }));
    }
  }, [products]);

  // Scroll to selected sidebar item when category expansion finishes
  useEffect(() => {
    if (!pendingScroll) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(pendingScroll);
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

  // Scroll back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Layout-matching loading skeletons to completely eliminate Layout Shift (CLS)
  if (loading) {
    return (
      <>
        {/* Banner Placeholder */}
        <div className="h-[280px] bg-slate-100 animate-pulse" />

        <section className="section-padding bg-white">
          <div className="container-custom">
            {/* Title Placeholder */}
            <div className="max-w-2xl mx-auto text-center mb-10">
              <div className="h-4 w-32 bg-slate-100 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-8 w-80 bg-slate-100 rounded-lg mx-auto mb-4 animate-pulse" />
              <div className="h-4 w-96 bg-slate-100 rounded-lg mx-auto animate-pulse" />
            </div>

            {/* Search Bar Placeholder */}
            <div className="max-w-2xl mx-auto h-16 bg-slate-100 rounded-2xl mb-12 animate-pulse" />

            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
              {/* Sidebar Placeholder */}
              <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl space-y-4">
                <div className="h-6 w-32 bg-slate-100 rounded mb-6 animate-pulse" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-55 rounded-xl animate-pulse" />
                ))}
              </aside>

              {/* Rows Placeholder */}
              <div className="space-y-8 w-full">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[260px] bg-slate-55 rounded-[30px] border border-slate-100 p-8 flex gap-8 animate-pulse">
                    <div className="w-[240px] h-full bg-slate-100 rounded-2xl" />
                    <div className="flex-1 space-y-4 py-2">
                      <div className="h-6 w-1/3 bg-slate-100 rounded" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
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
        <div className="max-w-2xl mx-auto mt-6 lg:mt-10 px-4 lg:px-0 relative">
          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-16 pl-14 pr-5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 lg:gap-10 mt-8 lg:mt-16 items-start px-4 lg:px-0">
          {/* Main Sidebar (Only scrollable container for the sidebar) */}
          <aside className="lg:sticky lg:top-24 self-start rounded-[32px] border border-slate-200 bg-white shadow-xl px-6 pb-6 pt-0 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar relative">
            {/* Sticky Header Section */}
            <div className="sticky top-0 -mx-6 pt-6 px-6 pb-3 bg-white z-20 border-b border-slate-100 mb-4 h-[116px]">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Categories</span>
                <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                  {Object.keys(sortedGroupedProducts).length}
                </span>
              </h3>

              {/* Sticky Category Search Box */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              {Object.keys(sortedGroupedProducts)
                .filter((category) =>
                  category.toLowerCase().includes(categorySearch.toLowerCase())
                )
                .map((category) => {
                  const isOpened = openedCategory === category;
                  const isActive = activeCategory === category;
                  const subcategories = sortedGroupedProducts[category] || {};
                  const count = getCategoryProductCount(category);

                  return (
                    <CategoryItem
                      key={category}
                      category={category}
                      isOpened={isOpened}
                      isActive={isActive}
                      subcategories={subcategories}
                      categoryProductCount={count}
                      toggleCategory={toggleCategory}
                      toggleSubCategory={toggleSubCategory}
                      openedSubCategories={openedSubCategories}
                      scrollToProduct={scrollToProduct}
                    />
                  );
                })}
            </div>
          </aside>

          {/* RIGHT SIDE START */}
          <div className="space-y-16">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[32px] p-10 lg:p-16 text-center shadow-lg">
                <div className="w-24 h-24 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-5xl mb-6">
                  🔍
                </div>

                <h2 className="text-2xl lg:text-4xl font-bold text-slate-900">
                  Product Not Found
                </h2>

                <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-7">
                  {"We couldn't find any products matching"}
                  <span className="font-semibold text-sky-700">
                    {" \"" + productSearch + "\" "}
                  </span>
                  . Please try another keyword or browse categories.
                </p>

                <button
                  onClick={() => {
                    setSearchInput("");
                    setProductSearch("");
                  }}
                  className="mt-8 px-8 py-3 rounded-xl bg-sky-700 text-white font-semibold hover:bg-sky-800 transition"
                >
                  View All Products
                </button>
              </div>
            ) : (
              Object.entries(sortedGroupedProducts).map(
                ([category, subcategoriesObj]) => (
                  <section
                    key={category}
                    id={category.replace(/\s+/g, "-").toLowerCase()}
                  >
                    {/* Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 lg:pb-5 mb-8">
                      <h2 className="text-3xl font-bold text-slate-900">
                        {category}
                      </h2>
                      <span className="text-slate-500 font-medium">
                        {Object.values(subcategoriesObj).reduce(
                          (sum, list) => sum + list.length,
                          0
                        )}{" "}
                        Products
                      </span>
                    </div>

                    {/* Subcategories */}
                    <div className="space-y-12">
                      {Object.entries(subcategoriesObj).map(
                        (([subCategory, list]) => (
                          <div key={subCategory} className="space-y-6">
                            {/* Subcategory Heading */}
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                                {subCategory}
                              </h3>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {list.length}{" "}
                                {list.length === 1 ? "Product" : "Products"}
                              </span>
                            </div>

                            {/* Product List */}
                            <div className="space-y-8">
                              {list.map((product) => (
                                <ProductCard
                                  key={product.uid}
                                  product={product}
                                  district={district}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )
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

                <h3 className="text-xl font-semibold">{item.title}</h3>
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