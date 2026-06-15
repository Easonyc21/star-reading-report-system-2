import { getStore } from "@netlify/blobs";
import crypto from "crypto";

function clean(value) {
  return String(value || "").trim();
}

function slugDate(value) {
  return clean(value).replace(/[^0-9]/g, "") || "unknown-date";
}

function makeRecordId(studentId, testDate) {
  const random = crypto.randomBytes(5).toString("hex");
  return `${clean(studentId)}_${slugDate(testDate)}_${random}`;
}

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];

    if (!expectedPassword || providedPassword !== expectedPassword) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "后台密码错误，或未配置 ADMIN_PASSWORD。" })
      };
    }

    const payload = JSON.parse(event.body || "{}");

    const required = ["studentId", "chineseName", "testDate", "pdfBase64"];
    for (const key of required) {
      if (!clean(payload[key])) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ error: `缺少必填字段：${key}` })
        };
      }
    }

    const recordId = makeRecordId(payload.studentId, payload.testDate);
    const pdfKey = `pdf/${recordId}.pdf`;
    const recordKey = `records/${recordId}.json`;

    const store = getStore("star-reading-records");

    const pdfBuffer = Buffer.from(payload.pdfBase64, "base64");
    await store.set(pdfKey, pdfBuffer, {
      metadata: {
        contentType: "application/pdf",
        originalFileName: clean(payload.originalFileName)
      }
    });

    const record = {
      recordId,
      studentId: clean(payload.studentId),
      chineseName: clean(payload.chineseName),
      studentNameEnglish: clean(payload.studentNameEnglish),
      className: clean(payload.className),
      grade: clean(payload.grade),
      testDate: clean(payload.testDate),
      lexileScore: clean(payload.lexileScore),
      lexileRange: clean(payload.lexileRange),
      pr: clean(payload.pr),
      ge: clean(payload.ge),
      irl: clean(payload.irl),
      testDuration: clean(payload.testDuration),
      benchmarkCategory: clean(payload.benchmarkCategory),
      literatureComprehension: clean(payload.literatureComprehension),
      literatureStructure: clean(payload.literatureStructure),
      informationalComprehension: clean(payload.informationalComprehension),
      foundations: clean(payload.foundations),
      vocabulary: clean(payload.vocabulary),
      reportUrl: `/.netlify/functions/get-report-pdf?key=${encodeURIComponent(pdfKey)}`,
      source: "admin",
      createdAt: new Date().toISOString()
    };

    await store.setJSON(recordKey, record);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: true, record })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "保存失败，请检查 PDF 大小、网络状态或 Netlify 配置。" })
    };
  }
}
