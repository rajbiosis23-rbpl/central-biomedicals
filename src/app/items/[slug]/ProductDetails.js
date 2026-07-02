"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

import {
  FaPlay,
  FaShareAlt,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaLink,
} from "react-icons/fa";

import {
    doc,
    getDoc,
    addDoc,
    collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductDetails({ slug }) {
    const [product, setProduct] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
const [selectedMedia, setSelectedMedia] = useState("image");
const [showShare, setShowShare] = useState(false);

const shareRef = useRef();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        const loadProduct = async () => {
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

                if (!snap.exists()) return;

                const products =
                    snap.data().products || [];

                const found = products.find(
                    (p) => p.slug === slug
                );

                setProduct(found || null);

                    if (found) {
                        if (found.images?.length > 0) {
                            setSelectedImage(found.images[0]);
                        } else {
                            setSelectedImage(found.image);
                        }

                        setSelectedMedia("image");
                    }
            } catch (error) {
                console.error(error);
            }
        };

        loadProduct();
    }, [slug]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.name.trim()) {
            return toast.error(
                "Name is required"
            );
        }

        if (!emailRegex.test(form.email)) {
            return toast.error(
                "Enter valid email"
            );
        }

        if (!phoneRegex.test(form.phone)) {
            return toast.error(
                "Enter valid mobile number"
            );
        }

        try {
            setSubmitting(true);

            await addDoc(
                collection(
                    db,
                    "websitesQueries",
                    "centralbiomedicals",
                    "productQueries"
                ),
                {
                    ...form,
                    productName: product.title,
                    productSlug: product.slug,
                    brand: product.brand || "",
                    model: product.model || "",
                    createdAt: new Date(),
                }
            );

            toast.success(
                "Your enquiry has been submitted successfully."
            );

            setForm({
                name: "",
                email: "",
                phone: "",
            });
        } catch (error) {
            console.error(error);
            toast.error(
                "Something went wrong"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link Copied");
    setShowShare(false);
};

const handleWhatsapp = () => {
    const shareText = `🔬 ${product?.title}

${product?.desc}

🌐 ${window.location.href}`;

    window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        "_blank"
    );
};

const handleFacebook = () => {
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
        )}`,
        "_blank"
    );
};

const handleInstagram = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Instagram direct sharing available nahi hai. Link copied.");
};

const handleNativeShare = async () => {
    if (navigator.share) {
        await navigator.share({
            title: product.title,
            text: product.desc,
            url: window.location.href,
        });
    } else {
        setShowShare(!showShare);
    }
};

useEffect(() => {
    const close = (e) => {
        if (
            shareRef.current &&
            !shareRef.current.contains(e.target)
        ) {
            setShowShare(false);
        }
    };

    document.addEventListener("mousedown", close);

    return () =>
        document.removeEventListener("mousedown", close);
}, []);

    if (!product) {
        return (
            <section className="py-10 md:py-20 bg-slate-50">
                <div className="container-custom">

                    <div className="grid lg:grid-cols-2 gap-12">

                        <div className="h-[420px] md:h-[520px] rounded-[36px] bg-slate-200 animate-pulse" />

                        <div>
                            <div className="h-12 w-3/4 bg-slate-200 rounded-xl animate-pulse mb-8" />

                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 bg-slate-200 rounded-lg animate-pulse mb-4"
                                />
                            ))}
                        </div>

                    </div>

                    <div className="mt-16 grid lg:grid-cols-[600px_1fr] gap-8">

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-sm">
                            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />

                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 bg-slate-200 rounded-2xl animate-pulse mb-4"
                                />
                            ))}
                        </div>

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-sm">
                            <div className="h-10 w-60 bg-slate-200 rounded-lg animate-pulse mb-6" />

                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-5 bg-slate-200 rounded animate-pulse mb-4"
                                />
                            ))}
                        </div>

                    </div>

                </div>
            </section>
        );
    }
    return (
        <section className="py-10 md:py-20 bg-slate-50">
            <div className="container-custom">

                {/* Top Section */}

                <div className="grid lg:grid-cols-2 gap-12">
               {/* Product Image */}

<div>

    <div className="relative h-[340px] sm:h-[420px] md:h-[500px] lg:h-[580px] rounded-[24px] md:rounded-[36px] overflow-hidden bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)]">

        {selectedMedia === "video" && product.video ? (

            <video
                controls
                autoPlay
                className="w-full h-full object-contain p-6"
            >
                <source
                    src={product.video}
                    type="video/mp4"
                />
            </video>

        ) : (

            <>
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                )}

                <Image
                    src={selectedImage || product.image}
                    alt={product.title}
                    fill
                    priority
                    onLoad={() => setImageLoaded(true)}
                    className={`object-contain p-4 transition duration-500 ${
                        imageLoaded
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                />
            </>

        )}

    </div>

    <div className="flex flex-wrap gap-3 mt-5">

        {(product.images?.length
            ? product.images
            : [product.image]
        ).map((img, index) => (

            <button
                key={index}
                onClick={() => {
                    setSelectedImage(img);
                    setSelectedMedia("image");
                }}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                    selectedMedia === "image" &&
                    selectedImage === img
                        ? "border-sky-600"
                        : "border-gray-200"
                }`}
            >

                <Image
                    src={img}
                    alt=""
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                />

            </button>

        ))}

        {product.video && (

            <button
                onClick={() =>
                    setSelectedMedia("video")
                }
                className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center ${
                    selectedMedia === "video"
                        ? "border-sky-600"
                        : "border-gray-200"
                }`}
            >

                <FaPlay size={20} />

                <span className="text-xs mt-1">
                    Video
                </span>

            </button>

        )}

        {product.pdf && (

            <a
                href={product.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="w-20 h-20 rounded-xl border flex flex-col items-center justify-center hover:bg-slate-100"
            >

                📄

                <span className="text-xs">
                    PDF
                </span>

            </a>

        )}

    </div>

</div>

                    {/* Product Details */}

                    <div>

                 <div className="flex justify-between items-start gap-4 relative">

    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
        {product.title}
    </h1>

    <div
        ref={shareRef}
        className="relative"
    >

        <button
            onClick={handleNativeShare}
            className="w-12 h-12 rounded-full border bg-white shadow flex items-center justify-center hover:bg-slate-100"
        >
            <FaShareAlt size={18} />
        </button>

        {showShare && (

            <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-xl border p-2 z-50">

                <button
                    onClick={handleCopy}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded flex items-center gap-2"
                >
                    <FaLink />
                    Copy Link
                </button>

                <button
                    onClick={handleWhatsapp}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded flex items-center gap-2"
                >
                    <FaWhatsapp className="text-green-600" />
                    WhatsApp
                </button>

                <button
                    onClick={handleFacebook}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded flex items-center gap-2"
                >
                    <FaFacebook className="text-blue-600" />
                    Facebook
                </button>

                <button
                    onClick={handleInstagram}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded flex items-center gap-2"
                >
                    <FaInstagram className="text-pink-600" />
                    Instagram
                </button>

            </div>

        )}

    </div>

</div>

                        <div className="mt-6 md:mt-8 bg-white p-5 sm:p-6 md:p-8 rounded-[24px] md:rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] space-y-4">

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

                {/* Description + Form */}

                <div className="mt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] xl:grid-cols-[600px_1fr] gap-6 md:gap-8">

                        {/* Quote Form */}

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] h-fit lg:sticky lg:top-24">

                            <h2 className="text-2xl md:text-3xl font-bold mb-2">
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
                                            name: e.target.value,
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
                                            email: e.target.value,
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
                                            phone:
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                ),
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sky-600"
                                />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Get Quote"}
                                </button>

                            </form>

                        </div>

                        {/* Description */}

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8  md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

                            <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900">
                                Product Description
                            </h3>

                            <p className="text-slate-600 leading-7 md:leading-9 text-base md:text-lg">
                                {product.desc ||
                                    product.description ||
                                    "No description available."}
                            </p>
                            {/* SEO Content */}

                            <div className="mt-10">

                                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                    Why Choose Central Biomedicals?
                                </h3>

                                <p className="text-slate-600 leading-8 mb-4">
                                    Central Biomedicals is a trusted supplier of
                                    biomedical and laboratory equipment across India.
                                    We provide high-quality diagnostic instruments,
                                    CBC Machines, Hematology Analyzers, Biochemistry
                                    Analyzers and laboratory solutions for hospitals,
                                    pathology laboratories and diagnostic centres.
                                </p>

                                <p className="text-slate-600 leading-8">
                                    Our team provides installation assistance,
                                    technical guidance and customer support to help
                                    healthcare facilities improve diagnostic accuracy
                                    and operational efficiency.
                                </p>

                            </div>

                            {/* FAQ Section */}

                            <div className="mt-12">

                                <h3 className="text-2xl font-bold mb-6 text-slate-900">
                                    Frequently Asked Questions
                                </h3>

                                <div className="space-y-6">

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            What is {product.title} used for?
                                        </h4>

                                        <p className="text-slate-600 mt-2">
                                            {product.title} is commonly used in
                                            hospitals, pathology laboratories and
                                            diagnostic centres.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            Do you provide installation support?
                                        </h4>

                                        <p className="text-slate-600 mt-2">
                                            Yes, installation and technical support
                                            are available depending on the product.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            Can I request a quotation?
                                        </h4>

                                        <p className="text-slate-600 mt-2">
                                            Yes, you can submit the enquiry form on
                                            this page to receive pricing and product
                                            information.
                                        </p>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}