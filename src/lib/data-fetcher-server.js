import { fetchFullCatalog as fetchFullCatalogRaw } from "./data-fetcher";

// Short server-side cache (2 seconds) to avoid redundant DB reads within a single page render
// while ensuring immediate fresh data reflection upon website updates
let cachedCatalog = null;
let cachedCatalogTimestamp = 0;
const SERVER_CACHE_TTL = 2000; // 2 seconds

export async function fetchFullCatalog(companyId, websiteId) {
  const now = Date.now();
  if (cachedCatalog && (now - cachedCatalogTimestamp) < SERVER_CACHE_TTL) {
    return cachedCatalog;
  }

  const data = await fetchFullCatalogRaw(companyId, websiteId);
  cachedCatalog = data;
  cachedCatalogTimestamp = now;
  return data;
}

export function clearServerCatalogCache() {
  cachedCatalog = null;
  cachedCatalogTimestamp = 0;
}
