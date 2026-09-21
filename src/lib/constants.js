/**
 * Dynamic Company & Website ID Configuration and Domain Parsing Utilities
 */

export const COMPANIES = {
  human: "Human Biomedical",
  global: "Global Biomedical",
  rajbiosis: "Raj Biosis",
};

export const COMPANY_WEBSITES = {
  human: [
    "humanbiomedical.com",
    "humanbiomedical.org",
    "humanbiomedical.in",
  ],
  global: [
    "globalbiomedical.com",
    "globalbiomedical.in",
  ],
  rajbiosis: [
    "centralbiomedicals.com",
    "centralbiomedicals.in",
    "central-biomedicals",
    "centralbiomedicalcom",
    "rajbiosis.com",
    "rajbiosis.in",
  ],
};

/**
 * Dynamically detect Company ID and Website ID based on environment variables,
 * domain, package name, or defaults for Central Biomedicals.
 */
export const CURRENT_COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID ||
  process.env.COMPANY_ID ||
  "rajbiosis";

export const CURRENT_WEBSITE_ID =
  process.env.NEXT_PUBLIC_WEBSITE_ID ||
  process.env.WEBSITE_ID ||
  "centralbiomedicals.com";

/**
 * Parses domain string into base name and TLD extension
 * Example:
 *   "centralbiomedicals.com" -> { name: "centralbiomedicals", tld: "com" }
 *   "centralbiomedicals.in"  -> { name: "centralbiomedicals", tld: "in" }
 *   "centralbiomedicalsin"   -> { name: "centralbiomedicals", tld: "in" }
 *   "centralbiomedicalcom"   -> { name: "centralbiomedical", tld: "com" }
 *   "central-biomedicals"    -> { name: "centralbiomedicals", tld: "" }
 */
export function parseDomainInfo(str = "") {
  let s = String(str || "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");

  let tld = "";
  if (s.endsWith(".co.in") || s.endsWith("coin")) {
    tld = "coin";
    s = s.replace(/(\.co\.in|coin)$/, "");
  } else if (s.endsWith(".com") || s.endsWith("com")) {
    tld = "com";
    s = s.replace(/(\.com|com)$/, "");
  } else if (s.endsWith(".in") || s.endsWith("in")) {
    tld = "in";
    s = s.replace(/(\.in|in)$/, "");
  } else if (s.endsWith(".org") || s.endsWith("org")) {
    tld = "org";
    s = s.replace(/(\.org|org)$/, "");
  } else if (s.endsWith(".net") || s.endsWith("net")) {
    tld = "net";
    s = s.replace(/(\.net|net)$/, "");
  }

  const name = s.replace(/[^a-z0-9]/g, "");

  return { name, tld };
}

/**
 * Precise Visibility Logic:
 * 1. isPublished === false -> Hide (false)
 * 2. websiteIds is [] (0 websites selected) -> Hide (false)
 * 3. websiteIds includes "all" -> Show (true)
 * 4. TLD-Strict Domain matching: Prevents .com and .in from colliding/confusing!
 */
export function isVisibleOnWebsite(item, targetWebsiteId = CURRENT_WEBSITE_ID) {
  if (!item) return false;

  // 1. Explicitly unpublished -> Hide
  if (item.isPublished === false) {
    return false;
  }

  const websiteIds = item.websiteIds;

  // 2. Empty websiteIds array (0 websites selected in admin) -> Hide
  if (Array.isArray(websiteIds) && websiteIds.length === 0) {
    return false;
  }

  // Fallback for legacy items where websiteIds was undefined
  if (!websiteIds || !Array.isArray(websiteIds)) {
    return item.isPublished !== false;
  }

  // 3. Explicit "all" -> Show on all websites
  if (websiteIds.includes("all")) {
    return true;
  }

  const targetInfo = parseDomainInfo(targetWebsiteId);

  return websiteIds.some((site) => {
    if (site === "all") return true;
    const siteInfo = parseDomainInfo(site);

    // CRITICAL: If both have explicit TLDs (e.g. "com" vs "in"), they MUST match!
    if (siteInfo.tld && targetInfo.tld && siteInfo.tld !== targetInfo.tld) {
      return false;
    }

    // Base name matching (handles singular/plural "centralbiomedical" vs "centralbiomedicals")
    const siteBase = siteInfo.name.replace(/s$/, "");
    const targetBase = targetInfo.name.replace(/s$/, "");

    if (siteInfo.name === targetInfo.name) return true;
    if (siteBase && targetBase && siteBase === targetBase) return true;

    return false;
  });
}

/**
 * Slug generator helper
 */
export function makeSlug(text = "") {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
