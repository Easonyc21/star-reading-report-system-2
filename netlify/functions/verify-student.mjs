import { getBlobStore } from "./blob-store.mjs";
import { seedReports } from "./seed-reports.mjs";

function clean(value) {
  return String(value || "").trim();
}

function normalize(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, "");
}

async function getStudentFromRoster(studentId, chineseName) {
  const store = getBlobStore("platform-students");
  const student = await store.get(`students/${clean(studentId)}.json`, { type: "json" });
  if (!student) return null;
  if (normalize(student.chineseName) !== normalize(chineseName)) return null;
  return student;
}

async function getStudentFromStarReports(studentId, chineseName) {
  const store = getBlobStore("star-reading-records");
  let dynamicReports = [];
  try {
    const list = await store.list({ prefix: "records/" });
    for (const blob of list.blobs || []) {
      try {
        const record = await store.get(blob.key, { type: "json" });
        if (record) dynamicReports.push(record);
      } catch {}
    }
  } catch {}

  const allReports = [...seedReports, ...dynamicReports];
  const match = allReports.find((item) =>
    normalize(item.studentId) === normalize(studentId) &&
    normalize(item.chineseName) === normalize(chineseName)
  );

  if (!match) return null;

  return {
    studentId: clean(match.studentId),
    chineseName: clean(match.chineseName),
    studentNameEnglish: clean(match.studentNameEnglish),
    className: clean(match.className),
    grade: clean(match.grade),
    source: "star-reading"
  };
}

export async function handler(event) {
  try {
    const params = event.queryStringParameters || {};
    const studentId = clean(params.studentId);
    const chineseName = clean(params.chineseName);

    if (!studentId || !chineseName) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "Missing studentId or chineseName" })
      };
    }

    let student = await getStudentFromRoster(studentId, chineseName);
    if (!student) student = await getStudentFromStarReports(studentId, chineseName);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        ok: !!student,
        student: student || null
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Verify failed", detail: String(err && err.message ? err.message : err) })
    };
  }
}
