import { getBlobStore } from "./blob-store.mjs";

function clean(value) { return String(value || "").trim(); }
function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) };
}

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];

    if (!expectedPassword) return json(500, { error: "ADMIN_PASSWORD 未配置。" });
    if (providedPassword !== expectedPassword) return json(401, { error: "后台密码错误。" });

    const payload = JSON.parse(event.body || "{}");
    const studentId = clean(payload.studentId);
    const chineseName = clean(payload.chineseName);

    if (!studentId || !chineseName) return json(400, { error: "学员编号和中文名不能为空。" });

    const student = {
      studentId,
      chineseName,
      studentNameEnglish: clean(payload.studentNameEnglish),
      className: clean(payload.className),
      grade: clean(payload.grade),
      source: "roster",
      updatedAt: new Date().toISOString()
    };

    const store = getBlobStore("platform-students");
    await store.setJSON(`students/${studentId}.json`, student);
    return json(200, { ok: true, student });
  } catch (err) {
    return json(500, { error: "保存学员失败。", detail: String(err && err.message ? err.message : err) });
  }
}
