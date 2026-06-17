import { getStore } from "@netlify/blobs";
import crypto from "crypto";
function clean(value) { return String(value || "").trim(); }
function slugDate(value) { return clean(value).replace(/[^0-9]/g, "") || "unknown-date"; }
function makeRecordId(studentId, testDate) { return `${clean(studentId)}_${slugDate(testDate)}_${crypto.randomBytes(5).toString("hex")}`; }
function json(statusCode, body) { return { statusCode, headers: {"Content-Type":"application/json; charset=utf-8"}, body: JSON.stringify(body) }; }
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];
    if (!expectedPassword) return json(500, { error: "Netlify 环境变量 ADMIN_PASSWORD 未配置。", hint: "请到 Netlify → Project configuration → Environment variables 添加 ADMIN_PASSWORD，然后重新部署。" });
    if (providedPassword !== expectedPassword) return json(401, { error: "后台密码错误。" });
    let payload;
    try { payload = JSON.parse(event.body || "{}"); } catch (err) { return json(400, { error: "请求 JSON 解析失败。", detail: String(err && err.message ? err.message : err) }); }
    for (const key of ["studentId","chineseName","testDate","pdfBase64"]) if (!clean(payload[key])) return json(400, { error: `缺少必填字段：${key}` });
    const pdfBase64 = clean(payload.pdfBase64);
    if (pdfBase64.length < 100) return json(400, { error: "PDF 内容为空或读取失败。", detail: `pdfBase64 length = ${pdfBase64.length}` });
    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const recordId = makeRecordId(payload.studentId, payload.testDate);
    const pdfKey = `pdf/${recordId}.pdf`;
    const recordKey = `records/${recordId}.json`;
    const store = getStore("star-reading-records");
    try {
      await store.set(pdfKey, pdfBuffer, { metadata: { contentType: "application/pdf", originalFileName: clean(payload.originalFileName) } });
    } catch (err) { return json(500, { error: "PDF 保存到 Netlify Blobs 失败。", detail: String(err && err.message ? err.message : err), debug: { pdfKey, pdfBytes: pdfBuffer.length } }); }
    const record = {
      recordId, studentId: clean(payload.studentId), chineseName: clean(payload.chineseName), studentNameEnglish: clean(payload.studentNameEnglish),
      className: clean(payload.className), grade: clean(payload.grade), testDate: clean(payload.testDate), lexileScore: clean(payload.lexileScore),
      lexileRange: clean(payload.lexileRange), pr: clean(payload.pr), ge: clean(payload.ge), irl: clean(payload.irl), testDuration: clean(payload.testDuration),
      benchmarkCategory: clean(payload.benchmarkCategory), literatureComprehension: clean(payload.literatureComprehension), literatureStructure: clean(payload.literatureStructure),
      informationalComprehension: clean(payload.informationalComprehension), foundations: clean(payload.foundations), vocabulary: clean(payload.vocabulary),
      reportUrl: `/.netlify/functions/get-report-pdf?key=${encodeURIComponent(pdfKey)}`, source: "admin", originalFileName: clean(payload.originalFileName), createdAt: new Date().toISOString()
    };
    try { await store.setJSON(recordKey, record); } catch (err) { return json(500, { error: "报告数据保存到 Netlify Blobs 失败。", detail: String(err && err.message ? err.message : err), debug: { recordKey, recordId } }); }
    return json(200, { ok: true, record, debug: { pdfBytes: pdfBuffer.length, pdfKey, recordKey } });
  } catch (err) {
    return json(500, { error: "未知错误。", detail: String(err && err.message ? err.message : err), stack: String(err && err.stack ? err.stack : "") });
  }
}
