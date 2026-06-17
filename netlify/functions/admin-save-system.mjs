import { getBlobStore } from "./blob-store.mjs";
import { defaultSystems } from "./default-systems.mjs";
function clean(value) { return String(value || "").trim(); }
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify({ error: "Method not allowed" }) };
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];
    if (!expectedPassword || providedPassword !== expectedPassword) return { statusCode: 401, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify({ error: "后台密码错误，或未配置 ADMIN_PASSWORD。" }) };
    const payload = JSON.parse(event.body || "{}");
    const system = { id: clean(payload.id), title: clean(payload.title), description: clean(payload.description), status: clean(payload.status) === "online" ? "online" : "offline", actionText: clean(payload.actionText) || (clean(payload.status) === "online" ? "进入查询" : "即将开放"), sortOrder: Number(payload.sortOrder || 999) };
    if (!system.id || !system.title) return { statusCode: 400, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify({ error: "入口 ID 和入口名称不能为空。" }) };
    const store = getBlobStore("platform-config");
    const saved = await store.get("systems.json", { type: "json" });
    const systems = Array.isArray(saved) && saved.length ? saved : [...defaultSystems];
    const index = systems.findIndex((item) => item.id === system.id);
    if (index >= 0) systems[index] = system; else systems.push(system);
    systems.sort((a,b)=>Number(a.sortOrder||999)-Number(b.sortOrder||999));
    await store.setJSON("systems.json", systems);
    return { statusCode: 200, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify({ ok: true, systems }) };
  } catch (err) {
    return { statusCode: 500, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify({ error: "保存入口配置失败。", detail: String(err && err.message ? err.message : err) }) };
  }
}
