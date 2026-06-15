import { getStore } from "@netlify/blobs";

export async function handler(event) {
  try {
    const key = (event.queryStringParameters || {}).key;

    if (!key || !key.startsWith("pdf/")) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "Invalid PDF key"
      };
    }

    const store = getStore("star-reading-records");
    const arrayBuffer = await store.get(key, { type: "arrayBuffer" });

    if (!arrayBuffer) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "PDF not found"
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=star-reading-report.pdf",
        "Cache-Control": "private, max-age=300"
      },
      isBase64Encoded: true,
      body: Buffer.from(arrayBuffer).toString("base64")
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Failed to load PDF"
    };
  }
}
