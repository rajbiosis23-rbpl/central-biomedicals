import ProductsPage from "@/app/items/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }) {
  const { district = "jaipur" } = await params;

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return <ProductsPage district={district} city={city} />;
}