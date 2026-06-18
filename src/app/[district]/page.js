import Home from "@/app/page";

export default async function DistrictPage({ params }) {
  const district = params?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return <Home city={city} />;
}