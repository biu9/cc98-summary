import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";

/**
 * @swagger
 * /api/llm/chat:
 *   post:
 *     tags:
 *       - Chat
 *     summary: AI聊天对话
 *     description: 与AI进行对话聊天
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
 *           example:
 *             messages:
 *               - role: "user"
 *                 content: "你好，请介绍一下自己"
 *     responses:
 *       200:
 *         description: 聊天响应成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: AI生成的回复文本
 *             example:
 *               text: "你好！我是AI助手，很高兴为您服务。"
 *       500:
 *         description: 服务器内部错误
 *   options:
 *     tags:
 *       - Chat
 *     summary: CORS预检请求
 *     description: 处理CORS预检请求
 *     responses:
 *       200:
 *         description: 预检请求成功
 */
async function handler(request: NextRequest) {
  const { messages } = await request.json();
  const response = await generateText({
    model: google("gemini-2.0-flash-exp"),
    messages,
  });
  return NextResponse.json(response);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(async () => NextResponse.json({}));
