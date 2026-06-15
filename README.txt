Star Reading 查询系统 V6 - 带后台管理版本

核心变化：
1. 家长端 index.html 不再读取本地 data.js，而是通过 Netlify Function 查询数据。
2. 后台 admin.html 可以新增报告数据和上传 PDF。
3. 新增报告会保存到 Netlify Blobs，前端刷新查询即可看到，不需要重新上传前端网页。
4. 初始 117 份历史报告保留在 reports/ 文件夹和 data/seed-reports.json 中。
5. 后续同一个孩子可以有多份报告，家长查询后会看到所有测试时间。

重要：
这个版本不再适合“直接拖拽静态文件夹”部署，因为它包含 Netlify Functions 和依赖包。
建议使用 GitHub 连接 Netlify 部署，或者使用 Netlify CLI 部署。

部署步骤：
1. 将本文件夹上传到 GitHub 仓库。
2. 在 Netlify 中 New site from Git，选择该仓库。
3. Build command 留空或使用 npm run build。
4. Publish directory 填 .。
5. 部署后，到 Site configuration / Environment variables 添加：
   ADMIN_PASSWORD=你设置的后台密码
6. 打开：
   家长端：https://你的域名/
   后台端：https://你的域名/admin.html

后台使用：
1. 打开 admin.html。
2. 输入后台密码。
3. 填写报告信息，上传对应 PDF。
4. 点击“保存报告”。
5. 家长端刷新查询，即可看到新增报告。

维护原则：
- 一行数据 = 一份报告。
- 同一个孩子新增报告，不覆盖旧报告，只新增一条记录。
- PDF 由后台上传后自动保存，前端通过接口访问。
- 建议测试日期使用真实测试日期，方便前端按时间排序。


V7 批量上传升级：
1. admin.html 新增“批量上传报告”模块。
2. 支持上传 CSV 信息表 + 多个已拆分的单人 PDF。
3. CSV 每一行是一份报告，通过 reportFileName 自动匹配 PDF 文件。
4. 点击预览后可检查哪些行已匹配 PDF，确认后自动逐份上传。
5. 保留单份新增功能。
6. 新增 bulk_upload_template.csv 作为批量上传模板。

注意：为避免函数请求体过大，批量上传会在浏览器中逐份提交 PDF。建议每批 20-50 份。
