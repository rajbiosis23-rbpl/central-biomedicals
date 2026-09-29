/**
 * Pure Client-Safe Catalog Utilities for Central Biomedicals
 * Single Source of Truth for WEBSITE_ID and Catalog Normalization.
 * NO Node.js built-ins (node:fs, node:sqlite) are imported here.
 */

export const WEBSITE_ID = "centralbiomedicals";
export const PRIMARY_COMPANY = "rajbiosis";
export const ALL_COMPANIES = ["rajbiosis", "human", "global"];

/**
 * Domain Normalization (NO ALIAS LEAKS):
 * URL/domain se https://, http://, www., dots ., hyphens -, spaces hata kar clean lowercase string banayein.
 * Example: "https://www.centralbiomedicals.com/" -> "centralbiomedicalscom"
 * Example: "centralbiomedicals" -> "centralbiomedicals"
 */
export function normalizeDomainId(domain = "") {
  return String(domain || "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[^a-z0-9]/g, "");
}

export const normalizeSiteId = normalizeDomainId;

/**
 * Detect primary company ID from website domain / ID
 */
export function detectCompanyId(domain = WEBSITE_ID) {
  const norm = normalizeDomainId(domain);
  if (norm.includes("global")) return "global";
  if (norm.includes("human")) return "human";
  return "rajbiosis";
}

/**
 * Standard slug generator
 */
export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

function safeDecode(str = "") {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Standard slug normalizer with URI decoding
 */
export const normalizeSlug = (s = "") =>
  safeDecode(String(s || ""))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Strict Exact Domain Matching & Visibility Check (NO ALIAS LEAKS):
 * 1. Agar item.isPublished === false -> HIDE (return false)
 * 2. Agar item.status === "inactive" ya "draft" -> HIDE (return false)
 * 3. Agar item.websiteIds undefined/null ho -> default SHOW (return true)
 * 4. Agar item.websiteIds empty array [] hai (0 access) -> HIDE (return false)
 * 5. Agar item.websiteIds me "all" ya exact normalized WEBSITE_ID exist kare -> SHOW (return true)
 * 6. Agar item.websiteIds me yeh website ID nahi hai -> HIDE (return false)
 */
export function isItemVisibleOnWebsite(item, websiteId = WEBSITE_ID) {
  if (!item) return false;
  if (item.isPublished === false) return false;

  const status = String(item.status || "").toLowerCase().trim();
  if (status === "inactive" || status === "draft") {
    return false;
  }

  // If websiteIds is undefined or null -> default to visible
  if (item.websiteIds === undefined || item.websiteIds === null) {
    return true;
  }

  if (Array.isArray(item.websiteIds)) {
    // If explicitly empty array [] -> 0 websites selected -> HIDDEN
    if (item.websiteIds.length === 0) {
      return false;
    }
    // If includes "all" -> visible on all websites
    if (item.websiteIds.includes("all")) {
      return true;
    }

    const targetNorm = normalizeDomainId(websiteId) || normalizeDomainId(WEBSITE_ID);

    // STRICT EXACT MATCHING: Only match exact normalized ID or exact string or "all"
    return item.websiteIds.some((site) => {
      const siteNorm = normalizeDomainId(site);
      return siteNorm === "all" || siteNorm === targetNorm || site === websiteId;
    });
  }

  return true;
}

export const isVisibleOnWebsite = isItemVisibleOnWebsite;

/**
 * Normalize raw product data into a standardized structure
 */
export function normalizeProduct(raw = {}, defaultCategory = "", defaultSubCategory = "", uidPrefix = "") {
  const title = (raw.title || raw.name || raw.productName || raw.itemName || "").trim();
  if (!title) return null;

  const slug = raw.slug || makeSlug(title);

  // Extract images array safely
  let images = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images.filter((img) => typeof img === "string" && img.trim() !== "");
  } else if (raw.image && typeof raw.image === "string" && raw.image.trim() !== "") {
    images = [raw.image.trim()];
  } else if (Array.isArray(raw.originalImages) && raw.originalImages.length > 0) {
    images = raw.originalImages.filter((img) => typeof img === "string" && img.trim() !== "");
  }

  const category = (raw.category || defaultCategory || "Diagnostic Equipment").trim();
  const subCategory = (raw.subCategory || raw.subcategory || raw["sub category"] || defaultSubCategory || "").trim();

  let features = Array.isArray(raw.features)
    ? raw.features.filter(Boolean)
    : typeof raw.features === "string"
      ? raw.features.split(",").map((f) => f.trim()).filter(Boolean)
      : [];

  return {
    ...raw,
    id: raw.id || raw.uid || raw.categoryProductId || raw.productId || slug,
    uid: raw.uid || `${uidPrefix}-${slug}`,
    categoryProductId: raw.categoryProductId || raw.productId || raw.id || "",
    title,
    name: title,
    slug,
    price: raw.price || "",
    desc: raw.desc || raw.description || raw.detail || raw.summary || "",
    description: raw.desc || raw.description || raw.detail || raw.summary || "",
    capacity: raw.capacity || "",
    throughput: raw.throughput || "",
    instrument: raw.instrument || "",
    model: raw.model || "",
    usage: raw.usage || "",
    brand: raw.brand || "Raj Biosis",
    parameters: raw.parameters || "",
    automation: raw.automation || "",
    availability: raw.availability || raw.status || "In Stock",
    status: raw.status || raw.availability || "active",
    size: raw.size || "",
    badge: raw.badge || raw.tag || "",
    features,
    specs: raw.specs && typeof raw.specs === "object" ? raw.specs : null,
    category,
    subCategory,
    categoryId: raw.categoryId || makeSlug(category),
    subcategoryId: raw.subcategoryId || makeSlug(subCategory),
    companyId: raw.companyId || PRIMARY_COMPANY,
    images,
    image: images[0] || "",
    video: raw.video || "",
    pdf: raw.pdf || "",
    isPublished: raw.isPublished !== false,
    websiteIds: Array.isArray(raw.websiteIds) ? raw.websiteIds : ["all"],
    type: raw.type || "category",
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
