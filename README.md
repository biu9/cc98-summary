## cc98-summary

基于Azure openai GPT-3.5的对于cc98帖子进行总结的赛博算命师

接入cc98登录中心,通过cc98-api获取帖子

需要在校园网下运行（webvpn不彳亍

❗本项目给出的总结仅供参考，不代表本人观点，也不对其真实性负责

### 技术栈

- next.js 13
- react-oidc-context
- tailwind css
- material UI
- [commit规范](https://www.conventionalcommits.org/en/v1.0.0/)

### 演示截图

![20230724000747](https://typora-1309407228.cos.ap-shanghai.myqcloud.com/20230724000747.png)

![20230724000936](https://typora-1309407228.cos.ap-shanghai.myqcloud.com/20230724000936.png)

![20230724001057](https://typora-1309407228.cos.ap-shanghai.myqcloud.com/20230724001057.png)

### TODO

- [x] 使用正则匹配将markdown格式的帖子转换成纯字符串
- [x] 接入azure openai GPT-3.5
- [ ] 增加版面过滤功能(e.g. 心灵)
- [ ] 增加关键字过滤功能(e.g. 回忆卷)
- [ ] webvpn下运行
- [x] cloudflare pages发布
- [x] 增加获取全部帖子功能 & 优化并发请求
  - [x] 并发控制util函数
- [ ] 单元测试
- [x] 将api请求转到serverless api上
- [ ] 想一个好点儿的prompt
