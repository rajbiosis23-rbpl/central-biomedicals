"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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

import {
    addDoc,
    collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchFullCatalog } from "@/lib/data-fetcher";

export default function ProductDetails({ slug, product: initialProduct }) {
    const [product, setProduct] = useState(initialProduct || null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(() => {
        if (initialProduct) {
            return initialProduct.images?.length > 0 ? initialProduct.images[0] : (initialProduct.image || "");
        }
        return "";
    });
    const [selectedMedia, setSelectedMedia] = useState("image");
    const [showShare, setShowShare] = useState(false);
    const [showBrochureModal, setShowBrochureModal] = useState(false);
    const [loading, setLoading] = useState(!initialProduct);

    const shareRef = useRef();
    const [downloadingBrochure, setDownloadingBrochure] = useState(false);
    const [brochureBase64Image, setBrochureBase64Image] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const pathname = usePathname();

    const pathParts = pathname.split("/").filter(Boolean);
    const city = pathParts.length > 1 ? pathParts[0] : "India";
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    // Convert selected image to Base64 Data URL for CORS-free PDF rendering
    useEffect(() => {
        const imgUrl = selectedImage || product?.image;
        if (!imgUrl) return;

        let isMounted = true;
        if (imgUrl.startsWith("data:")) {
            setBrochureBase64Image(imgUrl);
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width || 400;
                canvas.height = img.height || 400;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                if (isMounted) setBrochureBase64Image(dataURL);
            } catch (e) {
                if (isMounted) setBrochureBase64Image(imgUrl);
            }
        };
        img.onerror = () => {
            if (isMounted) setBrochureBase64Image(imgUrl);
        };
        img.src = imgUrl;

        return () => { isMounted = false; };
    }, [selectedImage, product]);

    const handleDirectPDFDownload = async () => {
        if (product?.pdf) {
            const link = document.createElement("a");
            link.href = product.pdf;
            link.download = `${product.slug || "product"}-brochure.pdf`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Downloading brochure PDF...");
            return;
        }

        try {
            setDownloadingBrochure(true);
            toast.loading("Generating Official PDF Brochure...", { id: "pdf-toast" });

            // 1. Create a 2D canvas of size 1588 x 2246 (High Res 2x A4 @ 300 DPI)
            const W = 1588;
            const H = 2246;
            const canvas = document.createElement("canvas");
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext("2d");

            // Fill white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, W, H);

            if (!ctx.roundRect) {
                ctx.roundRect = function(x, y, w, h) {
                    this.rect(x, y, w, h);
                    return this;
                };
            }

            // Draw Diagonal Watermark Grid across background
            ctx.save();
            ctx.rotate(-0.38);
            ctx.fillStyle = "rgba(15, 23, 42, 0.04)";
            ctx.font = "900 28px sans-serif";
            for (let y = -H; y < H * 2; y += 140) {
                for (let x = -W; x < W * 2; x += 380) {
                    ctx.fillText("CENTRAL BIOMEDICALS", x, y);
                }
            }
            ctx.restore();

            // Header Banner (#102a45)
            ctx.fillStyle = "#102a45";
            ctx.fillRect(0, 0, W, 140);

            ctx.fillStyle = "#38bdf8";
            ctx.font = "900 44px sans-serif";
            ctx.fillText("Central Biomedicals", 60, 65);

            ctx.fillStyle = "#cbd5e1";
            ctx.font = "500 22px sans-serif";
            ctx.fillText("Biomedical Equipment Sales & Healthcare Solutions", 60, 105);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("Phone: +91 9983123469", W - 60, 65);
            ctx.fillText("Web: www.centralbiomedicals.com", W - 60, 105);
            ctx.textAlign = "left";

            // Main Product Title
            ctx.fillStyle = "#0f172a";
            ctx.font = "800 38px sans-serif";
            
            const titleText = product?.title || "Biomedical Product";
            const words = titleText.split(" ");
            let line = "";
            let titleY = 220;
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + " ";
                let metrics = ctx.measureText(testLine);
                if (metrics.width > W - 120 && n > 0) {
                    ctx.fillText(line, 60, titleY);
                    line = words[n] + " ";
                    titleY += 48;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 60, titleY);

            // Title Divider Line
            titleY += 24;
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, titleY);
            ctx.lineTo(W - 60, titleY);
            ctx.stroke();

            // Amber Banner
            const bannerY = titleY + 30;
            ctx.fillStyle = "#d97706";
            ctx.beginPath();
            ctx.roundRect(60, bannerY, W - 120, 52, 8);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("OFFICIAL PRODUCT SPECIFICATION BROCHURE", W / 2, bannerY + 35);
            ctx.textAlign = "left";

            // Content Grid Section
            const contentY = bannerY + 110;
            const imgBoxW = 500;
            const imgBoxH = 480;

            // Product Image Frame Box
            ctx.fillStyle = "#f8fafc";
            ctx.strokeStyle = "#bae6fd";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(60, contentY, imgBoxW, imgBoxH, 24);
            ctx.fill();
            ctx.stroke();

            // Load Product Image via Same-Origin API Proxy to prevent Canvas Tainting
            const rawImgUrl = selectedImage || product?.image;
            if (rawImgUrl) {
                try {
                    const proxiedUrl = (rawImgUrl.startsWith("http://") || rawImgUrl.startsWith("https://"))
                        ? `/api/proxy-image?url=${encodeURIComponent(rawImgUrl)}`
                        : rawImgUrl;

                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    await new Promise((resolve) => {
                        img.onload = () => resolve(img);
                        img.onerror = () => resolve(null);
                        img.src = proxiedUrl;
                    }).then((loadedImg) => {
                        if (loadedImg && loadedImg.naturalWidth > 0) {
                            const scale = Math.min((imgBoxW - 40) / loadedImg.naturalWidth, (imgBoxH - 40) / loadedImg.naturalHeight);
                            const drawW = loadedImg.naturalWidth * scale;
                            const drawH = loadedImg.naturalHeight * scale;
                            const drawX = 60 + (imgBoxW - drawW) / 2;
                            const drawY = contentY + (imgBoxH - drawH) / 2;
                            ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
                        }
                    });
                } catch (e) {
                    console.warn("Proxy canvas image draw error:", e);
                }
            }

            // Key Specs Table (Right Side)
            const tableX = 600;
            const tableW = W - 660;

            // Table Header
            ctx.fillStyle = "#102a45";
            ctx.beginPath();
            ctx.roundRect(tableX, contentY, tableW, 48, [16, 16, 0, 0]);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("KEY SPECIFICATIONS", tableX + 24, contentY + 33);

            // Table Rows
            const specs = [
                ["Brand:", product?.brand || "Central Biomedicals Partner"],
                ["Model:", product?.model || "N/A"],
                ["Instrument:", product?.instrument || product?.category || "Diagnostic Equipment"],
                ["Usage:", product?.usage || "Clinical Laboratory"],
                ["Automation:", product?.automation || "Semi / Fully Automated"],
                ["Size / Capacity:", product?.capacity || "Standard Clinical Scale"],
                ["Availability:", "In Stock / Export Ready"]
            ];

            let rowY = contentY + 48;
            const rowH = 61;
            for (let i = 0; i < specs.length; i++) {
                ctx.fillStyle = i % 2 === 0 ? "#f8fafc" : "#ffffff";
                ctx.fillRect(tableX, rowY, tableW, rowH);

                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 1;
                ctx.strokeRect(tableX, rowY, tableW, rowH);

                ctx.fillStyle = "#0f172a";
                ctx.font = "bold 22px sans-serif";
                ctx.fillText(specs[i][0], tableX + 20, rowY + 38);

                ctx.fillStyle = i === 6 ? "#047857" : "#334155";
                ctx.font = i === 6 ? "bold 22px sans-serif" : "500 22px sans-serif";
                ctx.fillText(specs[i][1], tableX + 260, rowY + 38);

                rowY += rowH;
            }

            // Outer Table Border
            ctx.strokeStyle = "#102a45";
            ctx.lineWidth = 2;
            ctx.strokeRect(tableX, contentY, tableW, rowY - contentY);

            // Product Overview Section
            const overviewY = contentY + imgBoxH + 50;
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 26px sans-serif";
            ctx.fillText("PRODUCT OVERVIEW", 60, overviewY);

            ctx.fillStyle = "#d97706";
            ctx.fillRect(60, overviewY + 10, 280, 6);

            ctx.fillStyle = "#334155";
            ctx.font = "500 22px sans-serif";
            const descText = product?.desc || product?.description || `${product?.title || 'This product'} is an advanced diagnostic instrument designed for high performance, accuracy, and reliability in medical laboratories, hospitals, and clinical settings.`;
            
            const descWords = descText.split(" ");
            let descLine = "";
            let descY = overviewY + 50;
            for (let n = 0; n < descWords.length; n++) {
                let testLine = descLine + descWords[n] + " ";
                let metrics = ctx.measureText(testLine);
                if (metrics.width > W - 120 && n > 0) {
                    ctx.fillText(descLine, 60, descY);
                    descLine = descWords[n] + " ";
                    descY += 34;
                } else {
                    descLine = testLine;
                }
            }
            ctx.fillText(descLine, 60, descY);

            // Bottom 2 Cards Section
            const cardsY = descY + 40;
            const cardW = (W - 160) / 2;
            const cardH = 260;

            // Card 1: Key Applications
            ctx.fillStyle = "#102a45";
            ctx.beginPath();
            ctx.roundRect(60, cardsY, cardW, 44, [12, 12, 0, 0]);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px sans-serif";
            ctx.fillText("KEY APPLICATIONS", 80, cardsY + 30);

            ctx.strokeStyle = "#102a45";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(60, cardsY, cardW, cardH, 12);
            ctx.stroke();

            const apps = [
                "Clinical Diagnostic Laboratories",
                "Hospitals & Healthcare Centres",
                "Pathology & Testing Labs",
                "Blood Banks & Research Units",
                "Medical Colleges & Institutions"
            ];
            ctx.font = "500 20px sans-serif";
            for (let i = 0; i < apps.length; i++) {
                ctx.fillStyle = "#d97706";
                ctx.beginPath();
                ctx.arc(90, cardsY + 75 + i * 36, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#334155";
                ctx.fillText(apps[i], 110, cardsY + 82 + i * 36);
            }

            // Card 2: Why Choose Us
            const card2X = 60 + cardW + 40;
            ctx.fillStyle = "#102a45";
            ctx.beginPath();
            ctx.roundRect(card2X, cardsY, cardW, 44, [12, 12, 0, 0]);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px sans-serif";
            ctx.fillText("WHY CHOOSE CENTRAL BIOMEDICALS", card2X + 20, cardsY + 30);

            ctx.strokeStyle = "#102a45";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(card2X, cardsY, cardW, cardH, 12);
            ctx.stroke();

            const whyUs = [
                "Trusted Biomedical Equipment Supplier",
                "100% Genuine Leading Brand Products",
                "Competitive Pricing & Warranty Support",
                "Prompt Installation & Staff Training",
                "Fast Express Delivery Across India & Export"
            ];
            for (let i = 0; i < whyUs.length; i++) {
                ctx.fillStyle = "#0284c7";
                ctx.beginPath();
                ctx.arc(card2X + 30, cardsY + 75 + i * 36, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#334155";
                ctx.fillText(whyUs[i], card2X + 50, cardsY + 82 + i * 36);
            }

            // Footer Bar (#102a45)
            ctx.fillStyle = "#102a45";
            ctx.fillRect(0, H - 70, W, 70);

            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 20px sans-serif";
            ctx.fillText("CENTRAL BIOMEDICALS ", 60, H - 28);
            ctx.fillStyle = "#ffffff";
            ctx.fillText("- Diagnostic Instruments & Healthcare Solutions", 310, H - 28);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "500 18px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("Official Product Brochure | Confidential & Proprietary", W - 60, H - 28);
            ctx.textAlign = "left";

            // Convert Canvas image to jsPDF A4 Document
            const dataUrl = canvas.toDataURL("image/jpeg", 0.98);

            if (!window.jspdf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            // 210mm x 297mm (Standard A4 Page)
            pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
            pdf.save(`${product?.slug || "product"}-specification-brochure.pdf`);
            toast.success("Brochure PDF Downloaded Successfully!", { id: "pdf-toast" });
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to download PDF. Please try again.", { id: "pdf-toast" });
        } finally {
            setDownloadingBrochure(false);
        }
    };

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
                setLoading(true);
                const allProducts = await fetchFullCatalog();
                const found = allProducts.find((p) => p.slug === slug);

                setProduct(found || null);

                if (found) {
                    if (found.images?.length > 0) {
                        setSelectedImage(found.images[0]);
                    } else {
                        setSelectedImage(found.image || "");
                    }
                    setSelectedMedia("image");
                }
            } catch (error) {
                console.error("Error loading product details:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug, initialProduct]);

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
            return toast.error("Enter valid phone number with country code");
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

            toast.success("Your quote request has been submitted successfully. Our team will contact you shortly.");

            setForm({
                name: "",
                email: "",
                phone: "",
                company: "",
                country: "",
            });
        } catch (error) {
            console.error("Error submitting query:", error);
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const productSchema = product
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            image: product.image ? [product.image] : [],
            description:
                product.desc ||
                product.description ||
                product.title,
            brand: {
                "@type": "Brand",
                name: product.brand || "Central Biomedicals",
            },
        }
        : null;

    const faqSchema = product
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: `What is ${product.title} used for?`,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: `${product.title} is used in hospitals, pathology labs and diagnostic centres.`,
                    },
                },
                {
                    "@type": "Question",
                    name: "Do you provide installation support?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, installation and technical support are available.",
                    },
                },
            ],
        }
        : null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied");
        setShowShare(false);
    };

    const handleWhatsapp = () => {
        const shareText = `🔬 ${product?.title}\n\n${product?.desc || ""}\n\n🌐 ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
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
        toast.success("Instagram sharing is not directly supported. Link copied to clipboard!");
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: product.desc || product.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Share failed:", err);
            }
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
        return () => document.removeEventListener("mousedown", close);
    }, []);

    if (loading) {
        return (
            <section className="py-10 md:py-20 bg-slate-50">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
                        <div className="h-[420px] md:h-[520px] rounded-[36px] bg-slate-200" />
                        <div>
                            <div className="h-12 w-3/4 bg-slate-200 rounded-xl mb-8" />
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 bg-slate-200 rounded-lg mb-4"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!product) {
        return (
            <section className="py-10 md:py-20 bg-slate-50 text-center">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-slate-800">Product Not Found</h2>
                    <p className="text-slate-600 mt-4">The requested product could not be located in our catalog.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 md:py-20 bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productSchema),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
            />
            <div className="container-custom">
                <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                    <Link href="/" className="hover:text-sky-700 transition font-medium">Home</Link>
                    <span>/</span>
                    <Link href="/items" className="hover:text-sky-700 transition font-medium">Products</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <span className="text-slate-600 font-medium">{product.category}</span>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">{product.title}</span>
                </nav>

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

                                    <img
                                        id="main-product-gallery-img"
                                        src={selectedImage || product.image || "/placeholder.jpg"}
                                        alt={product.title}
                                        onLoad={() => setImageLoaded(true)}
                                        decoding="async"
                                        className={`w-full h-full object-contain p-4 transition duration-500 ${imageLoaded
                                            ? "opacity-100"
                                            : "opacity-0"
                                            }`}
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.jpg";
                                        }}
                                    />
                                </>
                            )}
                        </div>

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
                                        alt={product.title}
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
                                    onClick={() => setSelectedMedia("video")}
                                    className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center ${selectedMedia === "video"
                                        ? "border-sky-600"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <FaPlay size={20} />
                                    <span className="text-xs mt-1">Video</span>
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
                                    <span className="text-xs">PDF</span>
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

                        <div className="mt-6 md:mt-8 bg-white p-5 sm:p-6 md:p-8 rounded-[24px] md:rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] space-y-3 font-medium text-slate-700">
                            {product.brand && <p><b>Brand:</b> {product.brand}</p>}
                            {product.model && <p><b>Model:</b> {product.model}</p>}
                            {product.category && <p><b>Category:</b> {product.category}</p>}
                            {product.subCategory && <p><b>Subcategory:</b> {product.subCategory}</p>}
                            {product.instrument && <p><b>Instrument:</b> {product.instrument}</p>}
                            {product.capacity && <p><b>Capacity:</b> {product.capacity}</p>}
                            {product.throughput && <p><b>Throughput:</b> {product.throughput}</p>}
                            {product.usage && <p><b>Usage:</b> {product.usage}</p>}
                            {product.automation && <p><b>Automation:</b> {product.automation}</p>}
                            <p><b>Supply / Export:</b> Worldwide Availability</p>

                            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleDirectPDFDownload}
                                    disabled={downloadingBrochure}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    <FaDownload size={16} />
                                    {downloadingBrochure ? "Downloading PDF..." : "Download Brochure (PDF)"}
                                </button>
                                <button
                                    onClick={() => setShowBrochureModal(true)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3.5 px-5 rounded-2xl transition text-sm flex items-center justify-center gap-2"
                                >
                                    <FaFilePdf size={16} className="text-amber-600" />
                                    Preview Brochure
                                </button>
                            </div>
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

                            <p className="text-slate-500 mb-6 text-sm">
                                Item:
                                <span className="font-semibold ml-2 text-slate-800">
                                    {product.title}
                                </span>
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Your Name *"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                                />

                                <input
                                    type="email"
                                    placeholder="Email Address *"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                                />

                                <input
                                    type="tel"
                                    placeholder="Phone / WhatsApp (+ Country Code) *"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        value={form.company}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                company: e.target.value,
                                            })
                                        }
                                        className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Country"
                                        value={form.country}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                country: e.target.value,
                                            })
                                        }
                                        className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition text-sm"
                                >
                                    {submitting ? "Submitting..." : "Get Instant Quote & Export Details"}
                                </button>
                            </form>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900">
                                Product Description
                            </h3>

                            <p className="text-slate-600 leading-7 md:leading-9 text-base md:text-lg">
                                {product.desc ||
                                    product.description ||
                                    "No description available."}
                            </p>

                            {/* Specifications Table */}
                            <div className="mt-10 overflow-x-auto">
                                <table className="w-full border border-slate-200 text-left">
                                    <tbody>
                                        <tr>
                                            <td className="border p-3 font-semibold w-1/3">Brand</td>
                                            <td className="border p-3">{product.brand || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-3 font-semibold">Model</td>
                                            <td className="border p-3">{product.model || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-3 font-semibold">Usage</td>
                                            <td className="border p-3">{product.usage || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-3 font-semibold">Automation</td>
                                            <td className="border p-3">{product.automation || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-3 font-semibold">Capacity</td>
                                            <td className="border p-3">{product.capacity || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-3 font-semibold">Throughput</td>
                                            <td className="border p-3">{product.throughput || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* SEO Content */}
                            <div className="mt-12">
                                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                                    Why Choose Central Biomedicals in {cityName}?
                                </h3>

                                <p className="text-slate-600 leading-8">
                                    Central Biomedicals is a trusted supplier and
                                    distributor of {product.title} in {cityName}.
                                    We provide high-quality biomedical and laboratory
                                    equipment for hospitals, pathology laboratories,
                                    diagnostic centres and healthcare facilities.
                                </p>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        Features of {product.title}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        {product.title} offers reliable performance,
                                        accurate results, easy operation, long service
                                        life and efficient workflow for laboratories
                                        and hospitals.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        Applications of {product.title}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Widely used in hospitals, pathology labs,
                                        diagnostic centres, blood banks, research
                                        institutes and healthcare facilities.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        {product.title} Supplier in {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Central Biomedicals supplies {product.title}
                                        in {cityName} with technical support,
                                        installation assistance and customer service
                                        for hospitals and laboratories.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        {product.title} Dealer in {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Central Biomedicals is a trusted dealer of
                                        {product.title} in {cityName}. We supply
                                        biomedical equipment, laboratory instruments,
                                        diagnostic analyzers and healthcare devices
                                        to hospitals, pathology labs and research centres.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        {product.title} Distributor in {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Looking for a reliable distributor of
                                        {product.title} in {cityName}? We provide
                                        installation support, product guidance,
                                        maintenance assistance and fast delivery.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        Buy {product.title} in {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        Buy high quality {product.title} in
                                        {cityName} at competitive prices.
                                        Contact Central Biomedicals for the
                                        latest quotation and product availability.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        {product.title} Price in {cityName}
                                    </h3>

                                    <p className="text-slate-600 leading-8">
                                        The price of {product.title} depends on
                                        brand, model, specifications and features.
                                        Contact our team for the latest pricing,
                                        availability and delivery details.
                                    </p>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="mt-12">
                                <h3 className="text-2xl font-bold mb-6 text-slate-900">
                                    Frequently Asked Questions
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            What is {product.title} used for in {cityName}?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            {product.title} is commonly used in hospitals,
                                            pathology laboratories and diagnostic centres.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            What is the price of {product.title} in {cityName}?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            Pricing depends on specifications,
                                            brand and model. Contact us for a quote.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            Are you an authorized supplier of {product.title}?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            We supply genuine biomedical and
                                            laboratory equipment from trusted brands.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            Can hospitals in {cityName} order this product?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            Yes, hospitals, pathology laboratories,
                                            diagnostic centres and healthcare facilities
                                            can order this product.
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

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            Do you provide warranty?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            Warranty depends on the manufacturer and
                                            product model.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            Do you deliver across India?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            Yes, we supply products across India with
                                            safe packaging and logistics support.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            How can I contact Central Biomedicals?
                                        </h4>
                                        <p className="text-slate-600 mt-2">
                                            You can fill out the enquiry form or
                                            contact our team directly for product
                                            details and quotations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Official Product Brochure Modal / Specification Document */}
            {showBrochureModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                        {/* Modal Action Controls */}
                        <div className="sticky top-0 bg-slate-800 text-white px-6 py-4 flex items-center justify-between z-10 border-b border-slate-700">
                            <span className="font-bold flex items-center gap-2 text-sm">
                                <FaFilePdf className="text-amber-400" size={18} />
                                Product Specification Brochure Preview
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDirectPDFDownload}
                                    disabled={downloadingBrochure}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    <FaDownload size={13} /> {downloadingBrochure ? "Downloading PDF..." : "Download Brochure (PDF)"}
                                </button>
                                <button
                                    onClick={() => setShowBrochureModal(false)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                    Close ✕
                                </button>
                            </div>
                        </div>

                        {/* Visible Brochure Preview */}
                        <div className="p-6 md:p-10 bg-white text-slate-800 font-sans">
                            {/* Brochure Header */}
                            <div className="bg-slate-900 text-white p-5 rounded-t-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-sky-400">
                                        Central Biomedicals
                                    </h2>
                                    <p className="text-xs text-slate-300">Biomedical Equipment Sales & Healthcare Solutions</p>
                                </div>
                                <div className="text-xs text-slate-300 sm:text-right space-y-0.5">
                                    <p><strong className="text-white">Phone:</strong> +91 9983123469</p>
                                    <p><strong className="text-white">Web:</strong> www.centralbiomedicals.com</p>
                                </div>
                            </div>

                            {/* Main Product Title */}
                            <div className="py-6 border-b border-slate-200">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                                    {product.title}
                                </h1>
                            </div>

                            {/* Brochure Sub-Banner */}
                            <div className="bg-amber-600 text-white text-center py-2.5 px-4 font-bold uppercase tracking-wider text-xs md:text-sm rounded-md my-6 shadow-sm">
                                Official Product Specification Brochure
                            </div>

                            {/* Specifications Grid */}
                            <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start my-6">
                                {/* Product Image Frame */}
                                <div className="border-2 border-sky-100 rounded-2xl p-4 bg-slate-50 flex items-center justify-center h-64 overflow-hidden">
                                    <img
                                        src={brochureBase64Image || selectedImage || product.image || "/placeholder.jpg"}
                                        alt={product.title}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>

                                {/* Key Specs Box */}
                                <div className="border border-sky-900/30 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-900 text-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider">
                                        Key Specifications
                                    </div>
                                    <div className="divide-y divide-slate-200 text-xs sm:text-sm">
                                        <div className="grid grid-cols-2 p-3 bg-slate-50 font-medium">
                                            <span className="font-bold text-slate-900">Brand:</span>
                                            <span>{product.brand || "Central Biomedicals Partner"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-3 font-medium">
                                            <span className="font-bold text-slate-900">Model:</span>
                                            <span>{product.model || "N/A"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-3 bg-slate-50 font-medium">
                                            <span className="font-bold text-slate-900">Instrument:</span>
                                            <span>{product.instrument || product.category || "Diagnostic Equipment"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-3 font-medium">
                                            <span className="font-bold text-slate-900">Usage:</span>
                                            <span>{product.usage || "Clinical Laboratory"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-3 bg-slate-50 font-medium">
                                            <span className="font-bold text-slate-900">Automation:</span>
                                            <span>{product.automation || "Semi / Fully Automated"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-3 font-medium">
                                            <span className="font-bold text-slate-900">Size / Capacity:</span>
                                            <span>{product.capacity || "Standard Clinical Scale"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 p-3 bg-slate-50 font-medium">
                                            <span className="font-bold text-slate-900">Availability:</span>
                                            <span className="text-emerald-700 font-bold">In Stock / Export Ready</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Overview Section */}
                            <div className="my-6">
                                <h3 className="text-base font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-wide">
                                    Product Overview
                                </h3>
                                <p className="text-xs md:text-sm leading-6 text-slate-700">
                                    {product.desc || product.description || `${product.title} is an advanced diagnostic instrument designed for high performance, accuracy, and reliability in medical laboratories, hospitals, and clinical settings.`}
                                </p>
                            </div>

                            {/* Applications & Features 2-Column Grid */}
                            <div className="grid md:grid-cols-2 gap-6 my-6">
                                {/* Key Applications */}
                                <div className="border border-sky-900/30 rounded-xl overflow-hidden">
                                    <div className="bg-slate-900 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider">
                                        Key Applications
                                    </div>
                                    <ul className="p-4 space-y-2 text-xs font-medium text-slate-700">
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            Clinical Diagnostic Laboratories
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            Hospitals & Healthcare Centres
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            Pathology & Testing Labs
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            Blood Banks & Research Units
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            Medical Colleges & Institutions
                                        </li>
                                    </ul>
                                </div>

                                {/* Why Choose Us */}
                                <div className="border border-sky-900/30 rounded-xl overflow-hidden">
                                    <div className="bg-slate-900 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider">
                                        Why Choose Central Biomedicals
                                    </div>
                                    <ul className="p-4 space-y-2 text-xs font-medium text-slate-700">
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                                            Trusted Biomedical Equipment Supplier
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                                            100% Genuine Leading Brand Products
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                                            Competitive Pricing & Warranty Support
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                                            Prompt Installation & Staff Training
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                                            Fast Express Delivery Across India & Export
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Brochure Footer Bar */}
                            <div className="bg-slate-900 text-white p-4 rounded-b-xl flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs gap-2 mt-8">
                                <div>
                                    <strong className="text-sky-400">CENTRAL BIOMEDICALS</strong> - Diagnostic Instruments & Healthcare Solutions
                                </div>
                                <div className="text-slate-400">
                                    Official Product Brochure | Confidential & Proprietary
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}