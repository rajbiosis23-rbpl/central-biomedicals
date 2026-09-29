/**
 * Dynamic Company & Website ID Configuration and Domain Parsing Utilities
 */

export {
  WEBSITE_ID,
  PRIMARY_COMPANY,
  ALL_COMPANIES,
  normalizeDomainId,
  normalizeSiteId,
  detectCompanyId,
  makeSlug,
  normalizeSlug,
  isItemVisibleOnWebsite,
  isVisibleOnWebsite,
  normalizeProduct,
} from "./catalog-utils.js";

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

export const CURRENT_COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID ||
  process.env.COMPANY_ID ||
  "rajbiosis";

export const CURRENT_WEBSITE_ID =
  process.env.NEXT_PUBLIC_WEBSITE_ID ||
  process.env.WEBSITE_ID ||
  "centralbiomedicals.com";
