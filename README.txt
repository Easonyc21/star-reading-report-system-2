

V18 上传错误诊断：
1. admin-add-report 函数返回更详细的错误信息，便于定位上传失败原因。
2. 新增 admin-health 函数，可测试 ADMIN_PASSWORD 和 Netlify Blobs 写入是否正常。
3. admin.html 会展示接口返回的 detail/debug 信息。
