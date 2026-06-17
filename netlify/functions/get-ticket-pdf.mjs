import { getBlobStore } from "./blob-store.mjs";

function clean(value) {
  return String(value || "").trim();
}

export async function handler(event) {
  try {
    const studentId = clean((event.queryStringParameters || {}).studentId);
    if (!studentId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "Missing studentId"
      };
    }

    const store = getBlobStore("platform-tickets");
    const arrayBuffer = await store.get(`tickets/${studentId}.pdf`, { type: "arrayBuffer" });

    if (!arrayBuffer) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "Ticket PDF not found"
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${studentId}-ticket.pdf`,
        "Cache-Control": "private, max-age=300"
      },
      isBase64Encoded: true,
      body: Buffer.from(arrayBuffer).toString("base64")
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Failed to load ticket PDF"
    };
  }
}
