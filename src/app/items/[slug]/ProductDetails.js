"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

import {
    FaPlay,
    FaShareAlt,
    FaWhatsapp,
    FaFacebook,
    FaInstagram,
    FaLink,
    FaDownload,
    FaFilePdf,
} from "react-icons/fa";

import { fetchFullCatalog, fetchContactData } from "@/lib/data-fetcher";
import { parseContactInfo } from "@/lib/contact-parser";
import { Download } from "lucide-react";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
    primary: "#0369A1",
    primaryHover: "#075985",
    light: "#F0F9FF",
    border: "#E2E8F0",
    text: "#0F172A",
    muted: "#475569",
};

// ============================================================
// SLUG
// ============================================================

const makeSlug = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

// ============================================================
// COMPONENT
// ============================================================

export default function ProductDetails({ slug, district, product: initialProduct }) {
    const [product, setProduct] = useState(initialProduct || null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(
        initialProduct?.images?.length > 0
            ? initialProduct.images[0]
            : initialProduct?.image || ""
    );
    const [selectedMedia, setSelectedMedia] = useState("image");
    const [showShare, setShowShare] = useState(false);
    const [loading, setLoading] = useState(!initialProduct);

    const shareRef = useRef();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [brochureImage, setBrochureImage] = useState("");

    const [contactData, setContactData] = useState({
        phones: [],
        emails: [],
        address: "",
        workingHours: "",
        whatsappPhone: "",
    });

    const pathname = usePathname();

    const pathParts = pathname.split("/").filter(Boolean);
    const city = pathParts.length > 1 ? pathParts[0] : "India";
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    useEffect(() => {
        if (initialProduct) {
            setProduct(initialProduct);
            setSelectedImage(initialProduct.images?.length > 0 ? initialProduct.images[0] : (initialProduct.image || ""));
            setSelectedMedia("image");
            setLoading(false);
            return;
        }

        const loadProduct = async () => {
            try {
                const allProducts =
                    await fetchFullCatalog();

                const found =
                    allProducts.find(
                        (p) => p.slug === slug
                    );

                setProduct(found || null);

                if (found) {
                    if (found.images?.length > 0) {
                        setSelectedImage(
                            found.images[0]
                        );
                    } else {
                        setSelectedImage(
                            found.image || ""
                        );
                    }

                    setSelectedMedia("image");
                }
            } catch (error) {
                console.error(
                    "Error loading product catalog:",
                    error
                );
            }
        };

        const loadContact = async () => {
            try {
                const data = await fetchContactData();
                const parsed = parseContactInfo(data?.contactInfo || (Array.isArray(data) ? data : []));
                setContactData(parsed);
            } catch (err) {
                console.error(
                    "Error loading contact details:",
                    err
                );
            }
        };

        loadProduct();
        loadContact();
    }, [slug]);

    // ==========================================================
    // DOWNLOAD BROCHURE
    // ==========================================================

    const handleDownloadBrochure =
        async () => {
            if (
                downloading ||
                !product
            ) {
                return;
            }

            setDownloading(true);

            const toastId =
                toast.loading(
                    "Generating brochure PDF..."
                );

            try {
                const html2canvas =
                    (
                        await import(
                            "html2canvas"
                        )
                    ).default;

                const { jsPDF } =
                    await import("jspdf");

                let base64Img = "";

                const imageUrl =
                    selectedImage ||
                    product.image;

                if (imageUrl) {
                    try {
                        const proxyUrl =
                            `/_next/image?url=${encodeURIComponent(
                                imageUrl
                            )}&w=640&q=75`;

                        const res =
                            await fetch(
                                proxyUrl
                            );

                        if (res.ok) {
                            const blob =
                                await res.blob();

                            base64Img =
                                await new Promise(
                                    (resolve) => {
                                        const reader =
                                            new FileReader();

                                        reader.onloadend =
                                            () =>
                                                resolve(
                                                    reader.result
                                                );

                                        reader.readAsDataURL(
                                            blob
                                        );
                                    }
                                );
                        }
                    } catch (imgErr) {
                        console.error(
                            "Error proxying image for brochure:",
                            imgErr
                        );
                    }
                }

                setBrochureImage(
                    base64Img ||
                    imageUrl ||
                    "/placeholder.svg"
                );

                const input =
                    brochureRef.current ||
                    document.getElementById(
                        "brochure-template"
                    );

                if (!input) {
                    toast.error(
                        "Brochure template load nahi hua. Please try again."
                    );
                    setDownloading(false);
                    return;
                }

                input.style.display =
                    "block";
                input.style.position =
                    "absolute";
                input.style.left =
                    "-9999px";
                input.style.top = "0px";

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            200
                        )
                );

                const canvas =
                    await html2canvas(
                        input,
                        {
                            useCORS: true,
                            allowTaint: true,
                            scale: 2,
                            logging: false,
                            backgroundColor:
                                "#FFFFFF",
                        }
                    );

                input.style.display =
                    "none";

                const imgData =
                    canvas.toDataURL(
                        "image/png"
                    );

                const pdf =
                    new jsPDF({
                        orientation:
                            "portrait",
                        unit: "mm",
                        format: "a4",
                    });

                const imgWidth = 210;
                const pageHeight = 297;

                const imgHeight =
                    (canvas.height *
                        imgWidth) /
                    canvas.width;

                const height =
                    Math.min(
                        imgHeight,
                        pageHeight
                    );

                pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    0,
                    imgWidth,
                    height,
                    undefined,
                    "FAST"
                );

                pdf.save(
                    `Raj_Biosis_${product.title.replace(
                        /\s+/g,
                        "_"
                    )}_Brochure.pdf`
                );

                toast.success(
                    "Brochure downloaded successfully!",
                    {
                        id: toastId,
                    }
                );
            } catch (error) {
                console.error(
                    "Error generating PDF brochure:",
                    error
                );

                toast.error(
                    "Failed to generate PDF. Please try again.",
                    {
                        id: toastId,
                    }
                );
            } finally {
                setDownloading(false);
            }
        };

    // ==========================================================
    // FORM SUBMIT
    // ==========================================================

    const handleSubmit =
        async (e) => {
            e.preventDefault();

            const phoneRegex = /^[6-9]\d{9}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!form.name.trim()) {
                return toast.error(
                    "Name is required"
                );
            }

            if (
                !emailRegex.test(
                    form.email
                )
            ) {
                return toast.error(
                    "Enter valid email"
                );
            }

            if (!phoneRegex.test(form.phone)) {
                return toast.error("Enter valid mobile number");
            }

            try {
                setSubmitting(true);

                const res = await fetch("/api/product-query", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                        productName: product.title,
                        productSlug: product.slug,
                        brand: product.brand || "",
                        model: product.model || "",
                    }),
                });

                const data = await res.json();

                if (res.ok && data.success !== false) {
                    toast.success("Your enquiry has been submitted successfully.");
                    setForm({
                        name: "",
                        email: "",
                        phone: "",
                    });
                } else {
                    toast.error(data.error || "Something went wrong");
                }
            } catch (error) {
                console.error("Error submitting query:", error);
                toast.error("Something went wrong");
            } finally {
                setSubmitting(false);
            }
        };

    // ==========================================================
    // PRODUCT SCHEMA
    // ==========================================================

    const productSchema =
        product
            ? {
                "@context":
                    "https://schema.org",
                "@type":
                    "Product",
                name:
                    product.title,
                image:
                    product.image
                        ? [product.image]
                        : [],
                description:
                    product.desc ||
                    product.description ||
                    product.title,
                brand: {
                    "@type": "Brand",
                    name:
                        product.brand ||
                        "Raj Biosis",
                },
            }
            : null;

    // ==========================================================
    // FAQ SCHEMA
    // ==========================================================

    const faqSchema =
        product
            ? {
                "@context":
                    "https://schema.org",
                "@type":
                    "FAQPage",
                mainEntity: [
                    {
                        "@type":
                            "Question",
                        name:
                            `What is ${product.title} used for?`,
                        acceptedAnswer: {
                            "@type":
                                "Answer",
                            text:
                                `${product.title} is used in hospitals, pathology labs and diagnostic centres.`,
                        },
                    },
                    {
                        "@type":
                            "Question",
                        name:
                            "Do you provide installation support?",
                        acceptedAnswer: {
                            "@type":
                                "Answer",
                            text:
                                "Yes, installation and technical support are available.",
                        },
                    },
                ],
            }
            : null;

    // ==========================================================
    // SHARE
    // ==========================================================

    const handleCopy =
        async () => {
            await navigator.clipboard.writeText(
                window.location.href
            );

            toast.success(
                "Link Copied"
            );

            setShowShare(false);
        };

    const handleWhatsapp =
        () => {
            const shareText =
                `🔬 ${product?.title}\n\n${product?.desc || product?.description || ""}\n\n🌐 ${window.location.href}`;

            const cleanPhone = contactData.whatsappPhone || (contactData.phones?.[0]?.replace(/[^0-9]/g, "") || "");
            const url = cleanPhone
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}`
                : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

            window.open(
                url,
                "_blank"
            );
        };

    const handleFacebook =
        () => {
            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                )}`,
                "_blank"
            );
        };

    const handleInstagram =
        async () => {
            await navigator.clipboard.writeText(
                window.location.href
            );

            toast.success(
                "Instagram direct sharing available nahi hai. Link copied."
            );
        };

    const handleNativeShare =
        async () => {
            if (navigator.share) {
                await navigator.share({
                    title:
                        product.title,
                    text:
                        product.desc,
                    url:
                        window.location.href,
                });
            } else {
                setShowShare(
                    !showShare
                );
            }
        };

    // ==========================================================
    // CLOSE SHARE
    // ==========================================================

    useEffect(() => {
        const close = (e) => {
            if (
                shareRef.current &&
                !shareRef.current.contains(
                    e.target
                )
            ) {
                setShowShare(false);
            }
        };

        document.addEventListener(
            "mousedown",
            close
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                close
            );
    }, []);

    // ==========================================================
    // LOADING
    // ==========================================================

    if (!product) {
        if (loading) {
            return (
                <section className="py-10 md:py-20 bg-slate-50">
                    <div className="container-custom">
                        <div className="grid gap-12 lg:grid-cols-2">
                            <div className="h-[420px] md:h-[520px] rounded-[36px] bg-slate-100 animate-pulse" />
                            <div>
                                <div className="h-12 w-3/4 bg-slate-100 rounded-xl animate-pulse mb-8" />
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse mb-4" />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            );
        }

        return (
            <section className="py-16 md:py-24 bg-slate-50 min-h-[60vh] flex items-center justify-center">
                <div className="container-custom max-w-lg text-center bg-white p-8 sm:p-12 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-5">
                        📦
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Product Unavailable</h2>
                    <p className="mt-3 text-slate-500 leading-6 text-sm">
                        This product is currently not assigned or enabled for this website in the Master Catalog.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/items" className="px-6 py-3 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 transition">
                            Browse Products
                        </Link>
                        <Link href="/contact" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // ==========================================================
    // MAIN
    // ==========================================================

    return (
        <section className="py-10 md:py-20 bg-slate-50">

            {/* SCHEMA */}

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            productSchema
                        ),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            faqSchema
                        ),
                }}
            />

            <div className="container-custom">
                <div className="mb-6 text-sm text-slate-500">
                    Home / Products / {product.title}
                </div>

                {/* TOP SECTION */}

                <div className="grid gap-12 lg:grid-cols-2">

                    {/* PRODUCT IMAGE */}

                    <div>

                        <div className="relative h-[340px] sm:h-[420px] md:h-[500px] lg:h-[580px] rounded-[24px] md:rounded-[36px] overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-50 border border-slate-200 shadow-[0_25px_80px_rgba(3,105,161,0.12)]">

                            {selectedMedia ===
                                "video" &&
                                product.video ? (
                                <video
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain p-6"
                                >
                                    <source
                                        src={
                                            product.video
                                        }
                                        type="video/mp4"
                                    />
                                </video>
                            ) : (
                                <>
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                                    )}

                                    <img
                                        src={selectedImage || product.image || "/placeholder.jpg"}
                                        alt={product.title}
                                        onLoad={() => setImageLoaded(true)}
                                        decoding="async"
                                        className={`w-full h-full object-contain p-4 transition duration-500 ${imageLoaded
                                            ? "opacity-100"
                                            : "opacity-0"
                                            }`}
                                    />
                                </>
                            )}

                        </div>

                        {/* THUMBNAILS */}

                        <div className="flex flex-wrap gap-3 mt-5">
                            {(product.images?.length
                                ? product.images
                                : [product.image || "/placeholder.jpg"]
                            ).map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedImage(img);
                                        setSelectedMedia("image");
                                    }}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 relative ${selectedMedia === "image" &&
                                        selectedImage === img
                                        ? "border-sky-600"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        decoding="async"
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.jpg";
                                        }}
                                    />
                                </button>
                            ))}

                            {product.video && (
                                <button
                                    onClick={() =>
                                        setSelectedMedia(
                                            "video"
                                        )
                                    }
                                    className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${selectedMedia ===
                                        "video"
                                        ? "border-sky-700 bg-sky-50 text-sky-700"
                                        : "border-slate-200 text-sky-700 hover:bg-sky-50 hover:border-sky-700"
                                        }`}
                                >
                                    <FaPlay size={20} />

                                    <span className="text-xs mt-1">
                                        Video
                                    </span>
                                </button>
                            )}

                            {/* PDF */}

                            {product.pdf && (
                                <a
                                    href={
                                        product.pdf
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-20 h-20 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-sky-700 hover:bg-sky-50 hover:border-sky-700 transition-all"
                                >
                                    <span className="text-xl">
                                        📄
                                    </span>

                                    <span className="text-xs text-sky-700">
                                        PDF
                                    </span>
                                </a>
                            )}

                        </div>

                    </div>

                    {/* PRODUCT DETAILS */}

                    <div>

                        <div className="flex justify-between items-start gap-4 relative">

                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                                {product.title}
                            </h1>

                            {/* SHARE */}

                            <div
                                ref={shareRef}
                                className="relative"
                            >

                                <button
                                    onClick={
                                        handleNativeShare
                                    }
                                    className="w-12 h-12 rounded-full border border-slate-200 bg-white text-sky-700 shadow-md flex items-center justify-center hover:bg-sky-50 hover:text-sky-800 hover:scale-105 transition-all"
                                >
                                    <FaShareAlt
                                        size={18}
                                    />
                                </button>

                                {showShare && (
                                    <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-[0_20px_50px_rgba(3,105,161,0.15)] border border-slate-200 p-2 z-50">

                                        {/* COPY */}

                                        <button
                                            onClick={
                                                handleCopy
                                            }
                                            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition"
                                        >
                                            <FaLink />
                                            Copy Link
                                        </button>

                                        {/* WHATSAPP */}

                                        <button
                                            onClick={
                                                handleWhatsapp
                                            }
                                            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition"
                                        >
                                            <FaWhatsapp className="text-green-600" />
                                            WhatsApp
                                        </button>

                                        {/* FACEBOOK */}

                                        <button
                                            onClick={
                                                handleFacebook
                                            }
                                            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition"
                                        >
                                            <FaFacebook className="text-sky-700" />
                                            Facebook
                                        </button>

                                        {/* INSTAGRAM */}

                                        <button
                                            onClick={
                                                handleInstagram
                                            }
                                            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition"
                                        >
                                            <FaInstagram className="text-pink-600" />
                                            Instagram
                                        </button>

                                    </div>
                                )}

                            </div>

                        </div>

                        <div className="mt-6 md:mt-8 bg-white p-5 sm:p-6 md:p-8 rounded-[24px] md:rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] space-y-4 font-medium text-slate-700">
                            <p><b>Brand:</b> {product.brand || "N/A"}</p>
                            <p><b>Model:</b> {product.model || "N/A"}</p>
                            <p><b>Instrument:</b> {product.instrument || "N/A"}</p>
                            <p><b>Capacity:</b> {product.capacity || "N/A"}</p>
                            <p><b>Throughput:</b> {product.throughput || "N/A"}</p>
                            <p><b>Usage:</b> {product.usage || "N/A"}</p>
                            <p><b>Automation:</b> {product.automation || "N/A"}</p>
                            <p><b>Availability:</b> {product.availability || "N/A"}</p>
                        </div>

                    </div>

                </div>

                {/* DESCRIPTION + FORM */}

                <div className="mt-16">

                    <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] xl:grid-cols-[600px_1fr] gap-6 md:gap-8">

                        {/* QUOTE FORM */}

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-slate-200 shadow-[0_20px_60px_rgba(3,105,161,0.10)] h-fit lg:sticky lg:top-24">

                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">
                                Request A Quote
                            </h2>

                            <p className="text-slate-500 mb-8">
                                Product:
                                <span className="font-semibold ml-2 text-slate-800">
                                    {product.title}
                                </span>
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 outline-none focus:ring-2 focus:ring-sky-600"
                                />

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 outline-none focus:ring-2 focus:ring-sky-600"
                                />

                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value.replace(/\D/g, ""),
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                                />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
                                >
                                    {submitting ? "Submitting..." : "Get Quote"}
                                </button>

                            </form>

                        </div>

                        {/* DESCRIPTION */}

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-10 border border-slate-200 shadow-[0_20px_60px_rgba(3,105,161,0.10)]">

                            <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900">
                                Product Description
                            </h3>

                            <p className="text-slate-600 leading-7 md:leading-9 text-base md:text-lg">
                                {product.desc ||
                                    product.description ||
                                    "No description available."}
                            </p>

                            {/* SPECIFICATIONS */}

                            <div className="mt-10 overflow-x-auto">

                                <table className="w-full border border-slate-200">

                                    <tbody>

                                        {[
                                            [
                                                "Brand",
                                                product.brand,
                                            ],
                                            [
                                                "Model",
                                                product.model,
                                            ],
                                            [
                                                "Usage",
                                                product.usage,
                                            ],
                                            [
                                                "Automation",
                                                product.automation,
                                            ],
                                            [
                                                "Capacity",
                                                product.capacity,
                                            ],
                                            [
                                                "Throughput",
                                                product.throughput,
                                            ],
                                        ].map(
                                            (
                                                [
                                                    label,
                                                    value,
                                                ],
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <td className="border border-slate-200 p-3 font-semibold text-slate-900 bg-sky-50">
                                                        {label}
                                                    </td>

                                                    <td className="border border-slate-200 p-3 text-slate-600">
                                                        {value ||
                                                            "N/A"}
                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* SEO CONTENT */}

                            <div className="mt-12">

                                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                    Why Choose Raj Biosis in{" "}
                                    {cityName}?
                                </h3>

                                <p className="text-slate-600 leading-8">
                                    Raj Biosis is a trusted supplier and distributor of{" "}
                                    {product.title} in{" "}
                                    {cityName}. We provide high-quality biomedical and laboratory equipment for hospitals, pathology laboratories, diagnostic centres and healthcare facilities.
                                </p>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        Features of{" "}
                                        {product.title}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        {product.title} offers reliable performance, accurate results, easy operation, long service life and efficient workflow for laboratories and hospitals.
                                    </p>

                                </div>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        Applications of{" "}
                                        {product.title}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Widely used in hospitals, pathology labs, diagnostic centres, blood banks, research institutes and healthcare facilities.
                                    </p>

                                </div>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        {product.title} Supplier in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Raj Biosis supplies{" "}
                                        {product.title} in{" "}
                                        {cityName} with technical support, installation assistance and customer service for hospitals and laboratories.
                                    </p>

                                </div>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        {product.title} Dealer in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Raj Biosis is a trusted dealer of{" "}
                                        {product.title} in{" "}
                                        {cityName}. We supply biomedical equipment, laboratory instruments, diagnostic analyzers and healthcare devices to hospitals, pathology labs and research centres.
                                    </p>

                                </div>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        {product.title} Distributor in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Looking for a reliable distributor of{" "}
                                        {product.title} in{" "}
                                        {cityName}? We provide installation support, product guidance, maintenance assistance and fast delivery.
                                    </p>

                                </div>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        Buy {product.title} in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Buy high quality{" "}
                                        {product.title} in{" "}
                                        {cityName} at competitive prices. Contact Raj Biosis for the latest quotation and product availability.
                                    </p>

                                </div>

                                <div className="mt-8">

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                        {product.title} Price in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        The price of{" "}
                                        {product.title} depends on brand, model, specifications and features. Contact our team for the latest pricing, availability and delivery details.
                                    </p>

                                </div>

                            </div>

                            {/* FAQ */}

                            <div className="mt-12">

                                <h3 className="text-2xl font-bold mb-6 text-slate-900">
                                    Frequently Asked Questions
                                </h3>

                                <div className="space-y-8">

                                    {[
                                        [
                                            `What is ${product.title} used for in ${cityName}?`,
                                            `${product.title} is commonly used in hospitals, pathology laboratories and diagnostic centres.`,
                                        ],
                                        [
                                            `What is the price of ${product.title} in ${cityName}?`,
                                            "Pricing depends on specifications, brand and model. Contact us for a quote.",
                                        ],
                                        [
                                            `Are you an authorized supplier of ${product.title}?`,
                                            "We supply genuine biomedical and laboratory equipment from trusted brands.",
                                        ],
                                        [
                                            `Can hospitals in ${cityName} order this product?`,
                                            "Yes, hospitals, pathology laboratories, diagnostic centres and healthcare facilities can order this product.",
                                        ],
                                        [
                                            "Do you provide installation support?",
                                            "Yes, installation and technical support are available depending on the product.",
                                        ],
                                        [
                                            "Can I request a quotation?",
                                            "Yes, you can submit the enquiry form on this page to receive pricing and product information.",
                                        ],
                                        [
                                            "Do you provide warranty?",
                                            "Warranty depends on the manufacturer and product model.",
                                        ],
                                        [
                                            "Do you deliver across India?",
                                            "Yes, we supply products across India with safe packaging and logistics support.",
                                        ],
                                        [
                                            "How can I contact Raj Biosis?",
                                            "You can fill out the enquiry form or contact our team directly for product details and quotations.",
                                        ],
                                    ].map(
                                        (
                                            [question, answer],
                                            index
                                        ) => (
                                            <div
                                                key={index}
                                            >

                                                <h4 className="font-semibold text-lg text-sky-700">
                                                    {question}
                                                </h4>

                                                <p className="text-slate-600 mt-2">
                                                    {answer}
                                                </p>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==========================================================
          HIDDEN BROCHURE TEMPLATE
      ========================================================== */}

            <div
                id="brochure-template"
                ref={brochureRef}
                style={{
                    display: "none",
                    width: "800px",
                    padding: "40px",
                    fontFamily:
                        "system-ui, -apple-system, sans-serif",
                    color: "#0F172A",
                    background: "#FFFFFF",
                    boxSizing: "border-box",
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        borderBottom:
                            "3px solid #0369A1",
                        paddingBottom:
                            "20px",
                        marginBottom:
                            "30px",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                        }}
                    >

                        <img
                            src="/logo.png"
                            style={{
                                height: "65px",
                                width: "auto",
                                objectFit:
                                    "contain",
                            }}
                        />

                        <div>

                            <h1
                                style={{
                                    margin: "0",
                                    fontSize: "28px",
                                    color: "#0369A1",
                                    fontWeight: "800",
                                    letterSpacing:
                                        "-0.5px",
                                }}
                            >
                                Raj Biosis
                            </h1>

                            <p
                                style={{
                                    margin:
                                        "2px 0 0 0",
                                    fontSize: "12px",
                                    color: "#0369A1",
                                    fontWeight: "600",
                                    textTransform:
                                        "uppercase",
                                    letterSpacing:
                                        "1px",
                                }}
                            >
                                Trusted Biomedical Systems
                            </p>

                        </div>

                    </div>

                    <div
                        style={{
                            textAlign: "right",
                            fontSize: "12px",
                            lineHeight: "1.6",
                            color: "#475569",
                        }}
                    >

                        <p
                            style={{
                                margin: "0",
                                fontWeight: "700",
                                color: "#0369A1",
                                fontSize: "14px",
                            }}
                        >
                            www.centralbiomedical.com
                        </p>

                        <p
                            style={{
                                margin: "0",
                            }}
                        >
                            Email:{" "}
                            {
                                contactData.email
                            }
                        </p>

                        <div
                            style={{
                                margin: "0",
                            }}
                        >

                            {contactData.phone
                                .split(
                                    /[\n,]+/
                                )
                                .map(
                                    (
                                        num,
                                        i
                                    ) => (
                                        <span
                                            key={i}
                                            style={{
                                                display:
                                                    "block",
                                            }}
                                        >
                                            Mob:{" "}
                                            {num.trim()}
                                        </span>
                                    )
                                )}

                        </div>

                    </div>

                </div>

                {/* PRODUCT TITLE */}

                <h2
                    style={{
                        fontSize: "26px",
                        color: "#0F172A",
                        margin:
                            "0 0 25px 0",
                        textAlign: "center",
                        fontWeight: "800",
                        textTransform:
                            "uppercase",
                    }}
                >
                    {product.title}
                </h2>

                {/* MAIN GRID */}

                <div
                    style={{
                        display: "flex",
                        gap: "30px",
                        marginBottom:
                            "35px",
                    }}
                >

                    {/* IMAGE */}

                    <div
                        style={{
                            flex: "1.2",
                            border:
                                "1px solid #E2E8F0",
                            borderRadius: "16px",
                            padding: "20px",
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            height: "320px",
                            backgroundColor:
                                "#F0F9FF",
                        }}
                    >

                        <img
                            src={
                                brochureImage ||
                                "/placeholder.jpg"
                            }
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit:
                                    "contain",
                            }}
                        />

                    </div>

                    {/* SPECS */}

                    <div
                        style={{
                            flex: "1",
                            display: "flex",
                            flexDirection:
                                "column",
                            justifyContent:
                                "space-between",
                        }}
                    >

                        <div
                            style={{
                                backgroundColor:
                                    "#F0F9FF",
                                border:
                                    "1px solid #E2E8F0",
                                borderRadius: "16px",
                                padding: "20px",
                                height: "100%",
                                boxSizing:
                                    "border-box",
                            }}
                        >

                            <h3
                                style={{
                                    margin:
                                        "0 0 15px 0",
                                    color: "#0369A1",
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    borderBottom:
                                        "1px solid #E2E8F0",
                                    paddingBottom:
                                        "8px",
                                }}
                            >
                                Specifications
                            </h3>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    gap: "10px",
                                }}
                            >

                                {[
                                    [
                                        "Brand",
                                        product.brand ||
                                        "Raj Biosis",
                                    ],
                                    [
                                        "Model",
                                        product.model ||
                                        "N/A",
                                    ],
                                    [
                                        "Instrument",
                                        product.instrument,
                                    ],
                                    [
                                        "Category",
                                        product.category,
                                    ],
                                    [
                                        "Subcategory",
                                        product.subCategory,
                                    ],
                                    [
                                        "Capacity",
                                        product.capacity,
                                    ],
                                    [
                                        "Throughput",
                                        product.throughput,
                                    ],
                                    [
                                        "Usage",
                                        product.usage,
                                    ],
                                    [
                                        "Automation",
                                        product.automation,
                                    ],
                                    [
                                        "Availability",
                                        product.availability,
                                    ],
                                ].map(
                                    (
                                        [label, value],
                                        index
                                    ) =>
                                        value ? (
                                            <p
                                                key={index}
                                                style={{
                                                    margin: "0",
                                                    fontSize:
                                                        "14px",
                                                    color:
                                                        "#475569",
                                                }}
                                            >
                                                <strong
                                                    style={{
                                                        color:
                                                            "#0F172A",
                                                    }}
                                                >
                                                    {label}:
                                                </strong>{" "}
                                                {value}
                                            </p>
                                        ) : null
                                )}

                            </div>

                        </div>

                    </div>

                </div>

                {/* PRODUCT OVERVIEW */}

                <div
                    style={{
                        marginBottom:
                            "35px",
                    }}
                >

                    <h3
                        style={{
                            color: "#0369A1",
                            fontSize: "18px",
                            fontWeight: "700",
                            borderLeft:
                                "4px solid #0369A1",
                            paddingLeft: "10px",
                            margin:
                                "0 0 12px 0",
                        }}
                    >
                        Product Overview
                    </h3>

                    <p
                        style={{
                            fontSize: "14px",
                            lineHeight: "1.6",
                            color: "#475569",
                            margin: "0",
                            textAlign:
                                "justify",
                        }}
                    >
                        {product.description ||
                            product.desc ||
                            "Premium biomedical equipment designed for laboratories, hospitals, and diagnostic centers."}
                    </p>

                </div>

                {/* FOOTER */}

                <div
                    style={{
                        marginTop: "auto",
                        borderTop:
                            "1px solid #E2E8F0",
                        paddingTop: "20px",
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#0369A1",
                        lineHeight: "1.5",
                    }}
                >
                    {contactData.address && (
                        <p
                            style={{
                                margin: "0",
                                fontWeight: "600",
                            }}
                        >
                            Office Address: {contactData.address}
                        </p>
                    )}

                    {contactData.phones?.length > 0 && (
                        <p
                            style={{
                                margin: "3px 0 0 0",
                            }}
                        >
                            Contact: {contactData.phones.join(" | ")}
                        </p>
                    )}

                    {contactData.emails?.length > 0 && (
                        <p
                            style={{
                                margin: "3px 0 0 0",
                            }}
                        >
                            Email: {contactData.emails.join(" | ")}
                        </p>
                    )}

                    <p
                        style={{
                            margin:
                                "5px 0 0 0",
                        }}
                    >
                        © 2026 Central Biomedicals. All rights reserved. Premium diagnostics and biomedical solutions.
                    </p>
                </div>
            </div>
        </section>
    );
}