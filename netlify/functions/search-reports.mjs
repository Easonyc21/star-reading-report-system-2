import { getStore } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function normalize(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, "");
}

function dateValue(value) {
  const t = Date.parse(String(value || "").replace(/-/g, "/"));
  return Number.isFinite(t) ? t : 0;
}

function loadSeedReports() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const possiblePaths = [
      path.join(__dirname, "../../data/seed-reports.json"),
      path.join(process.cwd(), "data/seed-reports.json"),
      path.join(process.cwd(), "seed-reports.json")
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      }
    }

    return [];
  } catch (err) {
    console.error("Failed to load seed reports:", err);
    return [];
  }
}

async function getDynamicReports() {
  try {
    const store = getStore("star-reading-records");
    const reports = [];
    const list = await store.list({ prefix: "records/" });

    for (const blob of list.blobs || []) {
      try {
        const record = await store.get(blob.key, { type: "json" });
        if (record) reports.push(record);
      } catch (err) {
        console.error("Skip malformed record:", blob.key, err);
      }
    }

    return reports;
  } catch (err) {
    console.error("Failed to read dynamic reports:", err);
    return [];
  }
}

export async function handler(event) {
  try {
    const params = event.queryStringParameters || {};
    const studentId = params.studentId || "";
    const chineseName = params.chineseName || "";

    if (!studentId || !chineseName) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "Missing studentId or chineseName" })
      };
    }

    const seedReports = loadSeedReports();
    const dynamicReports = await getDynamicReports();
    const allReports = [...seedReports, ...dynamicReports];

    const reports = allReports
      .filter((item) =>
        normalize(item.studentId) === normalize(studentId) &&
        normalize(item.chineseName) === normalize(chineseName)
      )
      .sort((a, b) => dateValue(b.testDate) - dateValue(a.testDate));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ reports, total: reports.length })
    };
  } catch (err) {
    console.error("Search failed:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Search failed", detail: String(err && err.message ? err.message : err) })
    };
  }
}
