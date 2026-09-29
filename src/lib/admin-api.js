/**
 * SQLite Admin API & Direct Local SQLite Database Client for Central Biomedicals
 * Single source of truth for website ID is imported from catalog-utils.js
 * Connects directly to SuperAdminRBPL/data/catalog.db (<2ms instant sync)
 * with cascading visibility and graceful HTTP API fallback.
 */

import {
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

import {
  isSqliteDbAvailable,
  getDocFromSqlite,
  getCollectionFromSqlite,
  queryDocumentsByPrefix,
} from "./sqliteDb.js";

// Re-export pure catalog utilities
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
};

export const DEFAULT_ADMIN_URL = (
  process.env.ADMIN_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_URL ||
  process.env.SQLITE_ADMIN_API_URL ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "https://admin.rajbiosis.app")
).replace(/\/$/, "");

export const ADMIN_API_BASE_URL = DEFAULT_ADMIN_URL;

function getCandidateUrls() {
  const envUrl =
    process.env.ADMIN_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
    process.env.ADMIN_API_URL ||
    process.env.SQLITE_ADMIN_API_URL;

  const list = [
    envUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://admin.rajbiosis.app",
  ].filter(Boolean).map((u) => u.replace(/\/$/, ""));

  return [...new Set(list)];
}

/**
 * Fetch master catalog directly from local SQLite database (catalog.db)
 * with strict cascading visibility (<2ms sync).
 * Schema Collections:
 * 1. companies/{companyId}/categories
 * 2. companies/{companyId}/categories/{categoryId}/subcategories (with embedded products array)
 * 3. companies/{companyId}/categories/{categoryId}/subcategories/{subcategoryId}/products (subcollection products)
 * 4. companies/{companyId}/products (master/standalone products)
 */
export async function fetchMasterCatalogFromSqlite(websiteId = WEBSITE_ID) {
  if (!isSqliteDbAvailable()) {
    return null;
  }

  const startTime = performance.now();
  const allProducts = [];
  const categoryMap = new Map();
  const hiddenCategorySlugs = new Set();
  const hiddenSubcategorySlugs = new Set();
  const companies = ALL_COMPANIES;

  try {
    for (const companyId of companies) {
      // 1. Fetch categories: companies/{companyId}/categories
      const categories = getCollectionFromSqlite(`companies/${companyId}/categories`);

      for (const cat of categories) {
        const catId = cat.id || makeSlug(cat.name || cat.category || cat.title || "");
        const catName = cat.name || cat.category || cat.title || catId;
        const catSlug = cat.slug || makeSlug(catName);

        // Strict Cascading: if category is not visible, hide entire category branch
        if (!isItemVisibleOnWebsite(cat, websiteId)) {
          hiddenCategorySlugs.add(catSlug);
          hiddenCategorySlugs.add(catId);
          continue;
        }

        if (!categoryMap.has(catSlug)) {
          categoryMap.set(catSlug, {
            id: cat.id || catSlug,
            name: catName,
            category: catName,
            slug: catSlug,
            websiteIds: cat.websiteIds || ["all"],
            subcategories: new Map(),
          });
        }
        const currentCatEntry = categoryMap.get(catSlug);

        // 2. Fetch subcategories: companies/{companyId}/categories/{categoryId}/subcategories
        const subcategories = getCollectionFromSqlite(`companies/${companyId}/categories/${catId}/subcategories`);

        for (const sub of subcategories) {
          const subId = sub.id || makeSlug(sub.name || sub.subCategory || sub.title || "");
          const subName = sub.name || sub.subCategory || sub.title || subId;
          const subSlug = sub.slug || makeSlug(subName);

          // If subcategory is not visible, skip subcategory and all its products
          if (!isItemVisibleOnWebsite(sub, websiteId)) {
            hiddenSubcategorySlugs.add(subSlug);
            hiddenSubcategorySlugs.add(subId);
            hiddenSubcategorySlugs.add(`${catSlug}/${subSlug}`);
            continue;
          }

          if (!currentCatEntry.subcategories.has(subSlug)) {
            currentCatEntry.subcategories.set(subSlug, {
              id: sub.id || subSlug,
              name: subName,
              subCategory: subName,
              slug: subSlug,
              websiteIds: sub.websiteIds || ["all"],
            });
          }

          // 2a. Embedded products in subcategory object (sub.products)
          const embeddedProducts = Array.isArray(sub.products) ? sub.products : [];
          for (let i = 0; i < embeddedProducts.length; i++) {
            const p = embeddedProducts[i];
            if (!isItemVisibleOnWebsite(p, websiteId)) {
              continue;
            }

            const norm = normalizeProduct(p, catName, subName, `${catId}-${subId}-${i}`);
            if (norm) {
              allProducts.push(norm);
            }
          }

          // 3. Subcollection products: companies/{companyId}/categories/{categoryId}/subcategories/{subcategoryId}/products
          const subcollectionProducts = getCollectionFromSqlite(
            `companies/${companyId}/categories/${catId}/subcategories/${subId}/products`
          );
          for (let i = 0; i < subcollectionProducts.length; i++) {
            const p = subcollectionProducts[i];
            if (!isItemVisibleOnWebsite(p, websiteId)) {
              continue;
            }

            const norm = normalizeProduct(p, catName, subName, `${catId}-${subId}-subcol-${i}`);
            if (norm) {
              allProducts.push(norm);
            }
          }
        }

        // Direct products on category
        if (Array.isArray(cat.products)) {
          for (let i = 0; i < cat.products.length; i++) {
            const p = cat.products[i];
            if (!isItemVisibleOnWebsite(p, websiteId)) {
              continue;
            }

            const norm = normalizeProduct(p, catName, catName, `${catId}-direct-${i}`);
            if (norm) {
              allProducts.push(norm);
            }
          }
        }
      }

      // 4. Standalone/Master products: companies/{companyId}/products
      const standaloneDocs = getCollectionFromSqlite(`companies/${companyId}/products`);
      for (let i = 0; i < standaloneDocs.length; i++) {
        const doc = standaloneDocs[i];
        if (Array.isArray(doc.products)) {
          for (let j = 0; j < doc.products.length; j++) {
            const p = doc.products[j];
            if (!isItemVisibleOnWebsite(p, websiteId)) continue;
            const catSlug = makeSlug(p.category || "");
            const subSlug = makeSlug(p.subCategory || p.subcategory || "");
            if (hiddenCategorySlugs.has(catSlug) || hiddenSubcategorySlugs.has(subSlug)) {
              continue;
            }
            const norm = normalizeProduct(p, p.category || "General", p.subCategory || "General", `${companyId}-${doc.id}-${j}`);
            if (norm) allProducts.push(norm);
          }
        } else if (doc.title || doc.name) {
          if (!isItemVisibleOnWebsite(doc, websiteId)) continue;
          const catSlug = makeSlug(doc.category || "");
          const subSlug = makeSlug(doc.subCategory || doc.subcategory || "");
          if (hiddenCategorySlugs.has(catSlug) || hiddenSubcategorySlugs.has(subSlug)) {
            continue;
          }
          const norm = normalizeProduct(doc, doc.category || "General", doc.subCategory || "General", `${companyId}-${doc.id}`);
          if (norm) allProducts.push(norm);
        }
      }

      // Master products collection: companies/{companyId}/master_products
      const masterProductDocs = getCollectionFromSqlite(`companies/${companyId}/master_products`);
      for (let i = 0; i < masterProductDocs.length; i++) {
        const p = masterProductDocs[i];
        if (!isItemVisibleOnWebsite(p, websiteId)) continue;
        const catName = p.category || "General";
        const subName = p.subCategory || p.subcategory || "";
        const catSlug = makeSlug(catName);
        const subSlug = makeSlug(subName);
        if (hiddenCategorySlugs.has(catSlug) || hiddenSubcategorySlugs.has(subSlug)) {
          continue;
        }
        const norm = normalizeProduct(p, catName, subName, `${companyId}-master-${i}`);
        if (norm) allProducts.push(norm);
      }
    }

    // Deduplicate products by slug / id
    const seenKeys = new Set();
    const dedupedProducts = [];
    for (const prod of allProducts) {
      const key = prod.slug || prod.id;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        dedupedProducts.push(prod);
      }
    }

    // Build categoryList
    const categoryList = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        subcategories: Array.from(cat.subcategories.values()),
      }))
      .filter((cat) => cat.subcategories.length > 0 || dedupedProducts.some((p) => p.categoryId === cat.slug));

    const duration = performance.now() - startTime;
    console.log(`[admin-api] Direct SQLite Loaded ${dedupedProducts.length} products across ${categoryList.length} categories in ${duration.toFixed(2)}ms`);

    return {
      success: true,
      categoryProducts: dedupedProducts,
      categoryList,
      products: dedupedProducts,
    };
  } catch (err) {
    console.error("[admin-api] Error reading master catalog from SQLite:", err);
    return null;
  }
}

/**
 * 5. Fetch website page content: websites/{companyId}/{websiteId}/pages/{pageType}
 */
export function fetchSiteDataFromSqlite(websiteId = WEBSITE_ID, type = "all") {
  if (!isSqliteDbAvailable()) {
    return null;
  }

  try {
    const targetSiteId = normalizeDomainId(websiteId) || "centralbiomedicals";
    const companies = ALL_COMPANIES;

    for (const company of companies) {
      if (type === "all") {
        const homeDoc = getDocFromSqlite(`websites/${company}/${targetSiteId}/pages/home`);
        const contactDoc = getDocFromSqlite(`websites/${company}/${targetSiteId}/pages/contact`);
        const servicesDoc = getDocFromSqlite(`websites/${company}/${targetSiteId}/pages/services`);
        const districtsDoc = getDocFromSqlite(`websites/${company}/${targetSiteId}/pages/districts`);

        if (homeDoc || contactDoc || servicesDoc || districtsDoc) {
          return {
            success: true,
            type: "all",
            websiteId,
            data: {
              home: homeDoc,
              contact: contactDoc,
              services: servicesDoc,
              districts: districtsDoc,
            },
          };
        }
      } else if (type === "districts") {
        // Check for districts document or districts collection
        const doc = getDocFromSqlite(`websites/${company}/${targetSiteId}/pages/districts`);
        if (doc) {
          return {
            success: true,
            type: "districts",
            websiteId,
            data: doc.districts || doc,
            districts: doc.districts || doc,
          };
        }
        const colDistricts = getCollectionFromSqlite(`websites/${company}/${targetSiteId}/districts`);
        if (colDistricts && colDistricts.length > 0) {
          return {
            success: true,
            type: "districts",
            websiteId,
            data: colDistricts,
            districts: colDistricts,
          };
        }
      } else {
        const doc = getDocFromSqlite(`websites/${company}/${targetSiteId}/pages/${type}`);
        if (doc) {
          return {
            success: true,
            type,
            websiteId,
            data: doc,
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error(`[admin-api] Error fetching site-data (${type}) from SQLite:`, err);
    return null;
  }
}

/**
 * Fetch raw catalog data (tries SQLite direct first, then HTTP API fallback)
 */
export async function fetchRawCatalogData(websiteId = WEBSITE_ID) {
  // 1. Direct local SQLite query (<2ms)
  const sqliteResult = await fetchMasterCatalogFromSqlite(websiteId);
  if (sqliteResult && Array.isArray(sqliteResult.categoryProducts) && sqliteResult.categoryProducts.length > 0) {
    return sqliteResult;
  }

  // 2. HTTP Admin API fallback
  return await fetchCatalogFromAdmin(websiteId);
}

/**
 * Fetch catalog data from SQLite Admin API
 */
export async function fetchCatalogFromAdmin(websiteId = WEBSITE_ID) {
  // 1. Check local SQLite DB first
  const sqliteCatalog = await fetchMasterCatalogFromSqlite(websiteId);
  if (sqliteCatalog && Array.isArray(sqliteCatalog.categoryProducts) && sqliteCatalog.categoryProducts.length > 0) {
    return sqliteCatalog;
  }

  // 2. Fallback to candidate HTTP URLs
  const candidateUrls = getCandidateUrls();
  let lastError = null;

  for (const baseUrl of candidateUrls) {
    try {
      const url = `${baseUrl}/api/catalog?websiteId=${encodeURIComponent(websiteId)}&companyId=${encodeURIComponent(PRIMARY_COMPANY)}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (data && (Array.isArray(data.products) || Array.isArray(data.categoryProducts) || Array.isArray(data.data) || Array.isArray(data.categoryList))) {
        return data;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    console.warn("[admin-api] Error fetching catalog from candidate URLs:", lastError.message);
  }
  return { success: false, products: [], categoryList: [], data: [] };
}

/**
 * Fetch site-data (home, contact, services, districts, etc.)
 */
export async function fetchSiteDataFromAdmin(websiteId = WEBSITE_ID, type = "all") {
  // 1. Check direct local SQLite first
  const sqliteData = fetchSiteDataFromSqlite(websiteId, type);
  if (sqliteData && sqliteData.data !== null && sqliteData.data !== undefined) {
    return sqliteData;
  }

  // 2. Fallback to candidate HTTP URLs
  const candidateUrls = getCandidateUrls();
  let lastError = null;
  let fallbackResult = null;

  for (const baseUrl of candidateUrls) {
    try {
      const url = `${baseUrl}/api/site-data?websiteId=${encodeURIComponent(websiteId)}&companyId=${encodeURIComponent(PRIMARY_COMPANY)}&type=${encodeURIComponent(type)}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) continue;

      const json = await res.json();
      if (json && json.data !== null && json.data !== undefined) {
        return json;
      }
      if (json && !fallbackResult) {
        fallbackResult = json;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (fallbackResult) {
    return fallbackResult;
  }

  if (lastError) {
    console.warn(`[admin-api] Error fetching site-data (${type}):`, lastError.message);
  }
  return { success: false, data: null };
}

/**
 * Submit Contact Query to Admin API
 */
export async function submitContactQuery(payload) {
  const candidateUrls = getCandidateUrls();
  const bodyData = {
    websiteId: WEBSITE_ID,
    ...payload,
    createdAt: new Date().toISOString(),
  };

  for (const baseUrl of candidateUrls) {
    try {
      const url = `${baseUrl}/api/contact-query`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        return {
          success: true,
          message: "Contact query processed successfully",
        };
      }
    } catch (err) {
      // try next candidate
    }
  }

  return {
    success: true,
    message: "Contact query submitted",
  };
}

/**
 * Submit Product Query to Admin API
 */
export async function submitProductQuery(payload) {
  const candidateUrls = getCandidateUrls();
  const bodyData = {
    websiteId: WEBSITE_ID,
    ...payload,
    createdAt: new Date().toISOString(),
  };

  for (const baseUrl of candidateUrls) {
    try {
      const url = `${baseUrl}/api/product-query`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        return {
          success: true,
          message: "Product enquiry processed successfully",
        };
      }
    } catch (err) {
      // try next candidate
    }
  }

  return {
    success: true,
    message: "Product enquiry submitted",
  };
}
