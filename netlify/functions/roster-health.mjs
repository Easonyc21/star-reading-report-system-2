import { getBlobStore } from "./blob-store.mjs";

function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) };
}

export async function handler(event) {
  try {
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];
    if (!expectedPassword) return json(500, { ok: false, error: "ADMIN_PASSWORD 未配置" });
    if (providedPassword !== expectedPassword) return json(401, { ok: false, error: "后台密码错误" });

    const store = getBlobStore("platform-students");
    const key = "health/roster-write-test.json";
    const data = { ok: true, time: new Date().toISOString() };
    await store.setJSON(key, data);
    const readBack = await store.get(key, { type: "json" });

    return json(200, {
      ok: true,
      rosterWriteOk: !!readBack,
      readBack,
      env: {
        hasNETLIFY_SITE_ID: !!process.env.NETLIFY_SITE_ID,
        hasSITE_ID: !!process.env.SITE_ID,
        hasNETLIFY_AUTH_TOKEN: !!process.env.NETLIFY_AUTH_TOKEN,
        hasNETLIFY_API_TOKEN: !!process.env.NETLIFY_API_TOKEN
      }
    });
  } catch (err) {
    return json(500, {
      ok: false,
      error: String(err && err.message ? err.message : err),
      env: {
        hasNETLIFY_SITE_ID: !!process.env.NETLIFY_SITE_ID,
        hasSITE_ID: !!process.env.SITE_ID,
        hasNETLIFY_AUTH_TOKEN: !!process.env.NETLIFY_AUTH_TOKEN,
        hasNETLIFY_API_TOKEN: !!process.env.NETLIFY_API_TOKEN
      }
    });
  }
}
