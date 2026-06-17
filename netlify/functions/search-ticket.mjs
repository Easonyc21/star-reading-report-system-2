import { getStore } from "@netlify/blobs";

function clean(value) {
  return String(value || "").trim();
}

export async function handler(event) {
  try {
    const studentId = clean((event.queryStringParameters || {}).studentId);

    if (!studentId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "Missing studentId" })
      };
    }

    const store = getStore("platform-tickets");
    const record = await store.get(`records/${studentId}.json`, { type: "json" });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ ticket: record || null })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Ticket search failed", detail: String(err && err.message ? err.message : err) })
    };
  }
}
