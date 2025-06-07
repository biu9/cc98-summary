# API迁移通知

## 从Pages Router迁移到App Router

我们已将所有API端点从Pages Router迁移到App Router。这是Next.js推荐的最新架构。

### 迁移内容

以下API已迁移：

1. `/api/test-webvpn` - WebVPN连接测试API
2. `/api/proxy/[...path]` - CC98 API代理

### 客户端代码变更

好消息是，所有API路径保持不变，因此客户端代码不需要任何修改。现有的代码将继续正常工作。

### 技术细节

- 从`pages/api`目录迁移到`app/api`目录
- 从`NextApiRequest/NextApiResponse`迁移到`NextRequest/NextResponse`
- 从导出默认处理程序迁移到导出HTTP方法函数（GET、POST等）

### 联系我们

如果您在API迁移后遇到任何问题，请联系我们。 