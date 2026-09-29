import { NextResponse } from "next/server";
import { fetchFullCatalog, fetchFullCatalogData } from "@/lib/db-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    const products = await fetchFullCatalog();
    return NextResponse.json({ success: true, products }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("[api/products] Error fetching products:", error);
    return NextResponse.json(
      { success: false, products: [], error: String(error?.message || error) },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
