import { getBlobStore } from "./blob-store.mjs";

function clean(value) {
  return String(value || "").trim();
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];

    if (!expectedPassword) {
      return json(500, { error: "Netlify 环境变量 ADMIN_PASSWORD 未配置。" });
    }
    if (providedPassword !== expectedPassword) {
      return json(401, { error: "后台密码错误。" });
    }

    const payload = JSON.parse(event.body || "{}");
    const studentId = clean(payload.studentId);
    const pdfBase64 = clean(payload.pdfBase64);

    if (!studentId) return json(400, { error: "缺少学员编号 studentId。" });
    if (!pdfBase64 || pdfBase64.length < 100) return json(400, { error: "PDF 内容为空或读取失败。" });

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const store = getBlobStore("platform-tickets");

    const pdfKey = `tickets/${studentId}.pdf`;
    const recordKey = `records/${studentId}.json`;

    await store.set(pdfKey, pdfBuffer, {
      metadata: {
        contentType: "application/pdf",
        originalFileName: clean(payload.originalFileName)
      }
    });

    const record = {
      studentId,
      ticketUrl: `/.netlify/functions/get-ticket-pdf?studentId=${encodeURIComponent(studentId)}`,
      originalFileName: clean(payload.originalFileName),
      updatedAt: new Date().toISOString()
    };

    await store.setJSON(recordKey, record);

    return json(200, { ok: true, ticket: record, debug: { pdfBytes: pdfBuffer.length, pdfKey, recordKey } });
  } catch (err) {
    return json(500, {
      error: "门票保存失败。",
      detail: String(err && err.message ? err.message : err),
      hint: "如果提示 Netlify Blobs 未配置，请在 Netlify 环境变量中添加 NETLIFY_AUTH_TOKEN，并确认站点有 SITE_ID。"
    });
  }
}
