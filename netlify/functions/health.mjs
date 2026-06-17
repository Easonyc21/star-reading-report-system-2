import { seedReports } from "./seed-reports.mjs";
import { defaultSystems } from "./default-systems.mjs";
export async function handler() {
  return { statusCode: 200, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify({ ok: true, seedCount: seedReports.length, systemsCount: defaultSystems.length, time: new Date().toISOString() }) };
}
