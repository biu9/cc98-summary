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

- [  ] 使用正则匹配将markdown格式的帖子转换成纯字符串
- [  ] 接入react-query
- [  ] 增加版面过滤功能(e.g. 心灵)
- [  ] 增加关键字过滤功能(e.g. 回忆卷)
- [  ] webvpn下运行
- [  ] cloudflare pages发布