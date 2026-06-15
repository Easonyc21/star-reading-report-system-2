import fs from "node:fs";
import path from "node:path";

export async function handler() {
  const seedPath = path.join(process.cwd(), "data/seed-reports.json");
  let seedCount = null;
  try {
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      seedCount = Array.isArray(data) ? data.length : null;
    }
  } catch (err) {
    seedCount = "parse_error";
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: true,
      cwd: process.cwd(),
      seedExists: fs.existsSync(seedPath),
      seedCount,
      time: new Date().toISOString()
    })
  };
}
