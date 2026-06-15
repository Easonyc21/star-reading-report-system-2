import { seedReports } from "./seed-reports.mjs";

export async function handler() {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: true,
      seedCount: seedReports.length,
      time: new Date().toISOString()
    })
  };
}
