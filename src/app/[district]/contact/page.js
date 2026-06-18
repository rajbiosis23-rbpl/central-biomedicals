import ContactPage from "@/app/contact/page";

export default async function Page({ params }) {

  const district = params?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return <ContactPage city={city} />;
}