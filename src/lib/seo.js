export const SITE_URL = "https://centralbiomedicals.com";
export const SITE_NAME = "Central Biomedicals";
export const PHONE_NUMBER = "+91 9983123469";

/**
 * Generates standardized JSON-LD schema objects for pages.
 */

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Central Biomedicals is a leading Indian manufacturer, supplier, and exporter of medical diagnostic equipment, hematology analyzers, biochemistry analyzers, ELISA readers, and laboratory reagents.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE_NUMBER,
      contactType: "sales and export",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/items?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function getProductSchema(product) {
  if (!product) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.desc ||
      product.description ||
      `${product.title} supplied by ${SITE_NAME} for laboratory, hospital, and diagnostic center use.`,
    brand: {
      "@type": "Brand",
      name: product.brand || SITE_NAME,
    },
    url: `${SITE_URL}/items/${product.slug}`,
  };

  if (product.image || (product.images && product.images.length > 0)) {
    schema.image = product.images && product.images.length > 0 ? product.images : [product.image];
  }

  if (product.model) {
    schema.model = product.model;
  }

  if (product.sku || product.uid) {
    schema.sku = product.sku || product.uid;
  }

  return schema;
}

export function getCollectionPageSchema(title, description, url, itemCount = 0) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: description,
    url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    numberOfItems: itemCount,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}
