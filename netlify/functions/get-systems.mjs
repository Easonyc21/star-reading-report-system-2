import { getBlobStore } from "./blob-store.mjs";
import { defaultSystems } from "./default-systems.mjs";
export async function handler() {
  try {
    const store = getBlobStore("platform-config");
    const saved = await store.get("systems.json", { type: "json" });
    const systems = Array.isArray(saved) && saved.length ? saved : defaultSystems;
    return { statusCode: 200, headers: {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}, body: JSON.stringify({ systems }) };
  } catch {
    return { statusCode: 200, headers: {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}, body: JSON.stringify({ systems: defaultSystems, fallback: true }) };
  }
}
