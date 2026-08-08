export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return new Response("Missing url parameter", { status: 400 });
    }

    try {
        const res = await fetch(imageUrl);
        if (!res.ok) {
            return new Response("Failed to fetch image from remote server", { status: res.status });
        }

        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";

        return new Response(buffer, {
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err) {
        console.error("Proxy image error:", err);
        return new Response("Internal image proxy error", { status: 500 });
    }
}
