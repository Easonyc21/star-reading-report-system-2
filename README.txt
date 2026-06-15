

V8 修复：
1. 修复 search-reports 函数读取 seed-reports.json 的方式，避免 JSON import assertion 兼容性问题。
2. 增加 health 函数用于检查 Functions 是否正常运行。
3. netlify.toml 更明确包含 data/seed-reports.json。

测试地址：
/.netlify/functions/health
/.netlify/functions/search-reports?studentId=241010088333&chineseName=宫梓淇
