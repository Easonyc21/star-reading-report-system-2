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
    if (!expectedPassword || providedPassword !== expectedPassword) {
      return json(401, { error: "后台密码错误，或未配置 ADMIN_PASSWORD。" });
    }

    const payload = JSON.parse(event.body || "{}");
    const students = Array.isArray(payload.students) ? payload.students : [];
    const store = getBlobStore("platform-students");

    let ok = 0;
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

      await store.setJSON(`students/${studentId}.json`, student);
      ok++;
    }

    return json(200, { ok: true, saved: ok, failed: errors.length, errors });
  } catch (err) {
    return json(500, { error: "批量保存学员失败。", detail: String(err && err.message ? err.message : err) });
  }
}
