import fs from "node:fs";
import path from "node:path";

export async function handler() {
  const seedPath = path.join(process.cwd(), "data/seed-reports.json");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: true,
      cwd: process.cwd(),
      seedExists: fs.existsSync(seedPath),
      time: new Date().toISOString()
    })
  };
}
