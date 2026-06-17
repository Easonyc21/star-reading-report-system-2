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


V9 完整修复：
1. 基于 V7 完整包重新打包，保留 assets、reports、data、netlify/functions、package.json 等全部文件。
2. 修复 search-reports 函数读取 seed-reports.json 的方式。
3. 新增 health 函数，可以检查 seed-reports.json 是否存在，以及初始数据条数。
4. search-reports 返回 debug.seedCount，方便确认历史数据是否被读取。


V11 修复：
1. 彻底移除 search-reports 和 health 对 fs/path/import.meta.url 的依赖。
2. 将 117 条 seed 数据生成到 netlify/functions/seed-reports.mjs。
3. search-reports 直接 import seedReports，避免 Netlify 函数运行路径差异。
4. 保留后台批量上传功能和现有 117 份 PDF。


V12 个性化建议升级：
1. 前端 buildAdvice() 升级为个性化建议逻辑。
2. 阅读建议会综合整体水平、最低分项、Lexile 推荐区间和 IRL。
3. 不同孩子会根据实际表现生成不同建议，不再只展示统一通用建议。
4. 后台批量上传、家长多报告查询、117 条历史数据均保留。


V13 移动端修复：
1. 修复手机端测评记录卡片文字溢出问题。
2. 报告记录卡片在移动端改为单列布局，文字允许自动换行。
3. 测评记录摘要改为多行展示，避免横向挤压。


V14 移动端修复：
1. 修复测评记录卡片受全局 button 高度影响导致文字溢出的问题。
2. report-item 明确设置 height:auto，移动端自然撑开。
3. 测评记录摘要改为 span 分段，在手机端纵向展示。
4. 保留 V12 个性化建议、V13 手机端优化、后台批量上传等功能。


V15 平台入口升级：
1. 家长端从 Star Reading 单系统升级为“学而思国际素养高端体系信息查询平台”。
2. 首页统一输入学员编号和中文名，验证通过后进入平台首页。
3. 平台首页支持多个系统入口，目前 Star Reading 已开放，线下家长会门票为即将开放。
4. Star Reading 查询系统完整保留，包括多报告、PDF 下载、个性化建议、移动端修复。
5. 系统入口可在 index.html 的 SYSTEMS 配置里上线/下线。


V16 后台平台化升级：
1. admin.html 从 Star Reading 单后台升级为平台后台。
2. 新增平台入口管理，可编辑入口名称、说明、状态、按钮文字、排序。
3. 新增 get-systems 和 admin-save-system Functions，入口配置保存到 Netlify Blobs。
4. 家长端 index.html 改为从 get-systems 动态读取入口配置。
5. Star Reading 报告管理保留单份上传、批量上传和快速检查。
6. 家长会门票管理先做占位模块，下一步开发。


V17 品牌联名调整：
1. 顶部平台 Logo 改为“学而思 × Xcellent / X班”联名展示。
2. Star Reading Logo 从顶部移除，改为出现在 Star Reading 入口卡片里。
3. 进入 Star Reading 报告查询模块后，模块顶部显示 Star Reading Logo。
4. 保留 V16 平台后台、入口管理、Star Reading 报告管理、批量上传等功能。


V19 完整函数修复：补齐所有 Netlify Functions。部署后 Functions 页面应至少显示 7 个函数。


V20 成长启航大会门票系统：
1. 前端入口改为“成长启航大会门票查询”，默认 offline，即将开放。
2. 家长进入平台后，点击门票入口无需二次验证，直接按当前学员编号查询门票。
3. 门票页面直接嵌入展示 PDF，并提醒家长截图保存、按座位号就座。
4. 后台新增门票批量上传、单份上传/覆盖、门票快速检查。
5. 门票 PDF 文件名建议为学员编号，如 212010952764.pdf。
6. 新增 Functions：admin-add-ticket、search-ticket、get-ticket-pdf。


V21 Blobs 修复 + 门票 Logo：
1. 新增 blob-store.mjs，所有 Netlify Blobs 存取统一通过兼容 helper。
2. helper 支持读取 SITE_ID/NETLIFY_SITE_ID 和 NETLIFY_AUTH_TOKEN/NETLIFY_API_TOKEN/NETLIFY_BLOBS_TOKEN。
3. 新增 blobs-health 函数，用于检测 Blobs 写入环境。
4. 门票入口卡片和门票模块顶部新增成长启航大会 Logo。
5. 如果上传仍提示 Blobs 未配置，需要在 Netlify 环境变量添加 NETLIFY_AUTH_TOKEN。


V22 构建修复：
1. 修复 V21 中 blob-store.mjs 被误替换导致 Netlify build failed 的问题。
2. 保留 V21 的门票入口 Logo 和 Blobs 兼容初始化。
3. 如果上传时仍提示 Blobs 未配置，请添加 NETLIFY_AUTH_TOKEN 环境变量后重新部署。


V23 统一学员名单 + 门票按钮：
1. 登录平台改为 verify-student，不再依赖 Star Reading 报告。
2. 后台新增“学员名单管理”，支持单个新增和 CSV 批量导入。
3. 没有 Star Reading 报告的学员，只要在名单里，也可以登录平台查询门票。
4. 门票页面不再内嵌展示 PDF，只显示“查看 / 保存门票 PDF”按钮。
5. 新增 student_roster_template.csv。
