## cc98-summary

基于Azure openai GPT-3.5的对于cc98帖子进行总结的赛博算命师

接入cc98登录中心,通过cc98-api获取帖子

### 技术栈

- next.js 13
- react-oidc-context
- tailwind css
- material UI
- [commit规范](https://www.conventionalcommits.org/en/v1.0.0/)

### TODO

- [x] 使用正则匹配将markdown格式的帖子转换成纯字符串
- [ ] 接入react-query
- [x] 接入azure openai GPT-3.5
- [ ] 增加版面过滤功能(e.g. 心灵)
- [ ] 增加关键字过滤功能(e.g. 回忆卷)
- [ ] webvpn下运行
- [x] cloudflare pages发布
- [x] 增加获取全部帖子功能 & 优化并发请求
  - [x] 并发控制util函数
- [ ] 单元测试