export const runtime = 'edge';
import { streamText } from "ai";
import { google } from "@/lib/models";
import { NextRequest } from "next/server";
import { withCors } from "@/lib/cors";

/**
 * @swagger
 * /api/summary/chat:
 *   post:
 *     tags:
 *       - Summary
 *     summary: 基于知识库的流式问答
 *     description: 使用AI基于知识库内容进行流式问答对话
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ChatMessage'
 *                 description: 对话消息列表
 *               knowledgeBase:
 *                 type: string
 *                 description: 知识库内容
 *               contextDescription:
 *                 type: string
 *                 description: 上下文描述
 *           example:
 *             messages:
 *               - role: "user"
 *                 content: "请解释一下这个技术概念"
 *             knowledgeBase: "知识库内容..."
 *             contextDescription: "基于收藏帖子的智能问答"
 *     responses:
 *       200:
 *         description: 流式问答响应成功
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: AI生成的流式回复文本
 *       500:
 *         description: 服务器内部错误
 *   options:
 *     tags:
 *       - Summary
 *     summary: CORS预检请求
 *     description: 处理CORS预检请求
 *     responses:
 *       200:
 *         description: 预检请求成功
 */
async function handler(request: NextRequest) {
  const { messages, knowledgeBase, contextDescription } = await request.json();

  try {
    // 构建系统消息，包含知识库内容
    const systemMessage = {
      role: "system" as const,
      content: `你是CC98智能助手，专门${contextDescription}。

知识库内容:
${knowledgeBase}

请基于上述知识库内容回答用户的问题。如果问题与知识库内容不相关，请礼貌地说明并尝试从知识库中找到相关信息。回答要准确、详细，并且要有条理。使用markdown格式来组织回答结构。`
    };

    // 将系统消息添加到消息列表开头
    const enhancedMessages = [systemMessage, ...messages];

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      messages: enhancedMessages,
      temperature: 0.1, // 降低温度以获得更准确的回答
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Summary chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const POST = withCors(handler);
export const OPTIONS = withCors(async () => new Response(null, { status: 200 })); 