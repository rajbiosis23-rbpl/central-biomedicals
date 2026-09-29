import { fetchFullCatalog, getDistrictsList } from "@/lib/db-server";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://centralbiomedicals.com";

  const urls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/items`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/export`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    // Fetch products using Master Catalog helper
    const products = await fetchFullCatalog();
    const seenProductSlugs = new Set();

    (products || []).forEach((product) => {
      if (!product.slug || seenProductSlugs.has(product.slug)) return;
      seenProductSlugs.add(product.slug);

      urls.push({
        url: `${baseUrl}/items/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // Fetch district pages for local landing pages
    try {
      const districts = await getDistrictsList();
      if (Array.isArray(districts) && districts.length > 0) {
        districts.forEach((district) => {
          const slug = typeof district === "string" ? district : district.slug || district.id;
          if (!slug) return;

          urls.push({
            url: `${baseUrl}/${slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        });
      }
    } catch (dErr) {
      console.warn("Districts load warning for sitemap:", dErr.message);
    }
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
  }

  return urls;
}