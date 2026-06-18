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

    let payload;
    try { payload = JSON.parse(event.body || "{}"); }
    catch (err) { return json(400, { error: "请求 JSON 解析失败。", detail: String(err && err.message ? err.message : err) }); }

    const students = Array.isArray(payload.students) ? payload.students : [];
    if (!students.length) return json(400, { error: "没有可导入的学员数据。" });

    const store = getBlobStore("platform-students");
    let saved = 0;
    const errors = [];

    for (const item of students) {
      const studentId = clean(item.studentId);
      const chineseName = clean(item.chineseName);
      if (!studentId || !chineseName) {
        errors.push(`${studentId || "-"}：缺少学员编号或中文名`);
        continue;
      }

      const student = {
        studentId,
        chineseName,
        studentNameEnglish: clean(item.studentNameEnglish),
        className: clean(item.className),
        grade: clean(item.grade),
        source: "roster",
        updatedAt: new Date().toISOString()
      };

      try {
        await store.setJSON(`students/${studentId}.json`, student);
        saved++;
      } catch (err) {
        errors.push(`${studentId}：${String(err && err.message ? err.message : err)}`);
      }
    }

    return json(200, { ok: true, saved, failed: errors.length, errors });
  } catch (err) {
    return json(500, {
      error: "批量保存学员失败。",
      detail: String(err && err.message ? err.message : err),
      hint: "如果提示 Netlify Blobs 未配置，请确认 NETLIFY_SITE_ID 和 NETLIFY_AUTH_TOKEN 已配置并重新部署。"
    });
  }
}
