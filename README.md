## cc98-agent

基于Google Gemini 1.5的对于cc98帖子进行MBTI总结以及根据某个特定帖子上下文进行问答的Agent

接入cc98登录中心(http://openid-cc98-org-s.webvpn.zju.edu.cn:8001/),通过cc98-api获取帖子

需要在校园网下运行（webvpn不彳亍

❗本项目给出的总结仅供参考，不代表本人观点，也不对其真实性负责

### API文档

本项目已集成Swagger API文档，可以通过以下方式访问和使用：

- **API文档地址**: [http://localhost:1234/api-docs](http://localhost:1234/api-docs)
- **OpenAPI规范**: [http://localhost:1234/api/swagger](http://localhost:1234/api/swagger)

#### 可用的API端点

1. **POST /api/summary** - 文本内容总结
   - 使用AI对输入的文本内容进行智能总结
   
2. **POST /api/mbti** - MBTI人格类型分析
   - 基于用户发帖内容分析其MBTI人格类型特征
   
3. **POST /api/llm/chat** - AI聊天对话
   - 与AI进行对话聊天

所有API端点都在Swagger UI中提供了详细的文档说明、参数描述和示例，你可以直接在文档页面中进行API测试。

### 使用须知

由于本项目是白嫖的Gemini1.5的api，存在调用速率以及调用次数限制

![20240922201339](https://typora-1309407228.cos.ap-shanghai.myqcloud.com/20240922201339.png)

翻译过来就是一分钟最多调用15次，一天最多调用1500次；因此本项目做了单用户单日请求次数限制，具体可以看首页的弹窗

#### MBTI

没啥好说的，就是对于登录用户的所有历史帖子做一个mbti的总结；下方的potential alternative type是对于用户潜在的可能mbti类型的另一种可能性总结，可供参考

由于该tab下的请求采用了Function Call，大模型返回的数据被规定为JSON，但是有的时候Function Call会出点问题导致返回的JSON数据有缺失，具体体现是缺失一个或多个MBTI的细分类型总结；这个时候可以尝试刷新后再试试

#### Summary

这个功能是根据某个特定帖子上下文进行问答的Agent，可以用来对一些楼特别多的帖子做一些总结，节省大家的精力；需要注意的是，98对于帖子的搜索有10s内只能搜索一次的限制，为了尽可能少的触发这个限制，本项目的搜索又加了一层前端限流，每10秒用户才能搜索一次；如果输入帖子标题后一直没有下拉框，可以刷新页面再试试

为了预防一些敏感信息外泄，对于获取到的帖子内容，本项目做了一层过滤，具体来说当某一楼的回复or主贴中包含请勿转载，外泄等关键词时，该楼内容不会作为问答的上下文传递给大模型

### 技术栈

- next.js 13
- react-oidc-context
- tailwind css
- material UI
- swagger-jsdoc & swagger-ui-react (API文档)
- [commit规范](https://www.conventionalcommits.org/en/v1.0.0/)

### 演示截图

#### MBTI

![image-20240908193728905](https://typora-1309407228.cos.ap-shanghai.myqcloud.com/image-20240908193728905.png)

#### Summary

![20241019140647](https://typora-1309407228.cos.ap-shanghai.myqcloud.com/20241019140647.png)