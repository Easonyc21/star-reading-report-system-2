import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function countJsonArray(p) {
  try {
    if (!fs.existsSync(p)) return null;
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return Array.isArray(data) ? data.length : "not_array";
  } catch {
    return "parse_error";
  }
}

export async function handler() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const processSeedPath = path.join(process.cwd(), "data", "seed-reports.json");
  const functionSeedPath = path.join(__dirname, "seed-reports.json");

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: true,
      cwd: process.cwd(),
      functionDir: __dirname,
      processSeedExists: fs.existsSync(processSeedPath),
      processSeedCount: countJsonArray(processSeedPath),
      functionSeedExists: fs.existsSync(functionSeedPath),
      functionSeedCount: countJsonArray(functionSeedPath),
      time: new Date().toISOString()
    })
  };
}
