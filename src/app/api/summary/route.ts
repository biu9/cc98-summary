import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { generateText } from "ai";
import { glmChatModel } from "@/lib/models";
import { IGeneralResponse, ISummaryRequest } from "@request/api";
import { withCors } from "@/lib/cors";

/**
 * @swagger
 * /api/summary:
 *   post:
 *     tags:
 *       - Summary
 *     summary: 文本内容总结
 *     description: 使用AI对输入的文本内容进行智能总结
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ISummaryRequest'
 *           example:
 *             text: "这是一段需要总结的长文本内容..."
 *     responses:
 *       200:
 *         description: 总结成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IGeneralResponse'
 *             example:
 *               isOk: true
 *               data: "这是总结后的内容"
 *               msg: "success"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IGeneralResponse'
 *             example:
 *               isOk: false
 *               data: ""
 *               msg: "错误信息"
 *   options:
 *     tags:
 *       - Summary
 *     summary: CORS预检请求
 *     description: 处理CORS预检请求
 *     responses:
 *       200:
 *         description: 预检请求成功
 */
async function handler(request: NextRequest): Promise<NextResponse<IGeneralResponse>> {
  const { text } = (await request.json()) as ISummaryRequest;

  try {
    const { text: resultText } = await generateText({
      model: glmChatModel(),
      prompt: text,
      temperature: 0,
    });

    return NextResponse.json({
      isOk: true,
      data: resultText,
      msg: "success",
    });
  } catch (error) {
    return NextResponse.json({
      isOk: false,
      data: "",
      msg: error instanceof Error ? error.message : String(error),
    });
  }
}

export const POST = withCors(handler);
export const OPTIONS = withCors(async () => NextResponse.json({}));
