import { db } from "./firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import {
  CURRENT_COMPANY_ID,
  CURRENT_WEBSITE_ID,
  isVisibleOnWebsite,
  makeSlug,
} from "./constants";

// Simple short-lived in-memory cache for Firestore documents (clears quickly so no stale locks)
const docCache = {};

/**
 * Fetch a single document with brief cache.
 */
export async function fetchDocCached(path) {
  const now = Date.now();
  if (docCache[path] && (now - docCache[path].time) < 2000) {
    return docCache[path].data;
  }

  try {
    const parts = path.split("/").filter(Boolean);
    const docRef = doc(db, ...parts);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      docCache[path] = { data, time: now };
      return data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching doc at ${path}:`, err);
    throw err;
  }
}

/**
 * Normalizes a product object exclusively from Master Catalog structure
 */
function normalizeProduct(item, categoryName = "", subCategoryName = "", uidFallback = "") {
  const title = item.title || item.name || "Untitled Product";
  const slug = item.slug || makeSlug(title);
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item.image
    ? [item.image]
    : [];

  return {
    ...item,
    id: item.id || item.productId || item.categoryProductId || uidFallback,
    uid: item.uid || item.id || uidFallback,
    title,
    name: title,
    slug,
    category: categoryName || item.category || "Other Products",
    subCategory: subCategoryName || item.subCategory || categoryName || item.category || "General",
    categoryId: item.categoryId || makeSlug(categoryName),
    subcategoryId: item.subcategoryId || makeSlug(subCategoryName),
    price: item.price || "",
    desc: item.desc || item.description || "",
    description: item.desc || item.description || "",
    brand: item.brand || "",
    model: item.model || "",
    capacity: item.capacity || "",
    throughput: item.throughput || "",
    instrument: item.instrument || "",
    usage: item.usage || "",
    parameters: item.parameters || "",
    automation: item.automation || "",
    availability: item.availability || "",
    size: item.size || "",
    images,
    image: images[0] || item.image || "",
    video: item.video || "",
    pdf: item.pdf || "",
    isPublished: item.isPublished !== false,
    websiteIds: item.websiteIds || [],
    type: item.type || (categoryName ? "category" : "normal"),
  };
}

/**
 * Fetch and process products EXCLUSIVELY from Master Catalog:
 * - companies/{companyId}/categories/{categoryId}/subcategories/{subcategoryId}
 * - companies/{companyId}/products
 * 
 * Strict cascading visibility logic applied.
 * NO fallback to legacy website documents or static mock data.
 * When all products are unassigned, strictly returns [] (empty array).
 */
export async function fetchFullCatalog(
  companyId = CURRENT_COMPANY_ID,
  websiteId = CURRENT_WEBSITE_ID
) {
  const startTime = performance.now();
  const allProducts = [];
  const seenProductIds = new Set();
  const seenProductSlugs = new Set();

  try {
    // =========================================================================
    // 1. MASTER CATALOG: Categories & Subcategories
    // Path: companies/{companyId}/categories/{categoryId}/subcategories/{subcategoryId}
    // =========================================================================
    try {
      const categoriesCol = collection(db, "companies", companyId, "categories");
      const categorySnap = await getDocs(categoriesCol);

      if (!categorySnap.empty) {
        await Promise.all(
          categorySnap.docs.map(async (catDoc) => {
            const catData = catDoc.data();
            const categoryName = catData.name || catData.category || catDoc.id;

            // 1. Category Visibility Check: If Category is hidden/unassigned, skip all subcategories & products
            if (!isVisibleOnWebsite(catData, websiteId)) {
              return;
            }

            // Fetch Subcategories
            try {
              const subcategoriesCol = collection(
                db,
                "companies",
                companyId,
                "categories",
                catDoc.id,
                "subcategories"
              );
              const subcategoriesSnap = await getDocs(subcategoriesCol);

              subcategoriesSnap.docs.forEach((subDoc) => {
                const subData = subDoc.data();
                const subCategoryName = subData.name || subData.subCategory || subDoc.id;

                // 2. Subcategory Visibility Check: If Subcategory is hidden/unassigned, skip all its products
                if (!isVisibleOnWebsite(subData, websiteId)) {
                  return;
                }

                // 3. Product Visibility Check: Only include products explicitly enabled for this website
                const rawProducts = subData.products || [];
                rawProducts.forEach((prod, index) => {
                  if (!isVisibleOnWebsite(prod, websiteId)) {
                    return;
                  }

                  const uid = prod.id || `${catDoc.id}-${subDoc.id}-${index}`;
                  const normalized = normalizeProduct(prod, categoryName, subCategoryName, uid);

                  if (!seenProductIds.has(normalized.id)) {
                    seenProductIds.add(normalized.id);
                    seenProductSlugs.add(normalized.slug);
                    allProducts.push(normalized);
                  }
                });
              });
            } catch (subErr) {
              console.error(`Error fetching subcategories for category ${catDoc.id}:`, subErr);
            }

            // Also check direct products on category document if any
            if (catData.products?.length) {
              catData.products.forEach((prod, index) => {
                if (!isVisibleOnWebsite(prod, websiteId)) {
                  return;
                }

                const uid = prod.id || `${catDoc.id}-direct-${index}`;
                const normalized = normalizeProduct(prod, categoryName, categoryName, uid);

                if (!seenProductIds.has(normalized.id)) {
                  seenProductIds.add(normalized.id);
                  seenProductSlugs.add(normalized.slug);
                  allProducts.push(normalized);
                }
              });
            }
          })
        );
      }
    } catch (masterCatErr) {
      console.warn("Master categories fetch note:", masterCatErr.message);
    }

    // =========================================================================
    // 2. MASTER CATALOG: Standalone / Normal Products
    // Path: companies/{companyId}/products
    // =========================================================================
    try {
      const normalCol = collection(db, "companies", companyId, "products");
      const normalSnap = await getDocs(normalCol);

      if (!normalSnap.empty) {
        normalSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          // Case A: Document contains an array of products
          if (Array.isArray(data.products)) {
            data.products.forEach((prod, idx) => {
              if (!isVisibleOnWebsite(prod, websiteId)) return;
              const uid = prod.id || `normal-${docSnap.id}-${idx}`;
              const normalized = normalizeProduct(prod, prod.category || "Other Products", prod.subCategory || "General", uid);
              if (!seenProductIds.has(normalized.id)) {
                seenProductIds.add(normalized.id);
                allProducts.push(normalized);
              }
            });
          }
          // Case B: Document represents a single product
          else if (data.title || data.name) {
            if (isVisibleOnWebsite(data, websiteId)) {
              const uid = data.id || docSnap.id;
              const normalized = normalizeProduct(data, data.category || "Other Products", data.subCategory || "General", uid);
              if (!seenProductIds.has(normalized.id)) {
                seenProductIds.add(normalized.id);
                allProducts.push(normalized);
              }
            }
          }
        });
      }
    } catch (normalErr) {
      console.warn("Master normal products fetch note:", normalErr.message);
    }

    const duration = performance.now() - startTime;
    console.log(
      `[data-fetcher] Master Catalog synced for "${websiteId}" (${allProducts.length} visible products) in ${duration.toFixed(2)}ms`
    );

    return allProducts;
  } catch (err) {
    console.error("Error fetching Master Catalog:", err);
    return [];
  }
}

/**
 * Helpers for cached document retrieval across pages
 */
export async function fetchHomeData() {
  return (
    (await fetchDocCached("websites/centralbiomedicalcom/pages/home")) ||
    (await fetchDocCached("websites/centralbiomedicals/pages/home"))
  );
}

export async function fetchContactData() {
  return (
    (await fetchDocCached("websites/centralbiomedicalcom/pages/contact")) ||
    (await fetchDocCached("websites/centralbiomedicals/pages/contact"))
  );
}

export async function fetchServicesData() {
  return (
    (await fetchDocCached("websites/centralbiomedicalcom/pages/services")) ||
    (await fetchDocCached("websites/centralbiomedicals/pages/services"))
  );
}

export async function fetchDistrictData(district) {
  if (!district) return null;
  return (
    (await fetchDocCached(`websites/centralbiomedicalcom/districts/${district}`)) ||
    (await fetchDocCached(`websites/centralbiomedicals/districts/${district}`))
  );
}
