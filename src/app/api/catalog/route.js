import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { CURRENT_COMPANY_ID, CURRENT_WEBSITE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company") || CURRENT_COMPANY_ID;
    const websiteId = searchParams.get("website") || CURRENT_WEBSITE_ID;

    const catalog = await fetchFullCatalog(companyId, websiteId);

    return NextResponse.json(catalog, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("API /api/catalog Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch master catalog", details: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
