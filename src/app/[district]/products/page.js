import ProductsPage from "@/app/products/page";

export default async function Page({ params }) {
  const district = params?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return <ProductsPage city={city} />;
}