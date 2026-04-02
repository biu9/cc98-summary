import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { glmChatModel } from "@/lib/models";
import { IGeneralResponse, IMBTIRequest, IMBTIResponse } from "@request/api";
import { withCors } from "@/lib/cors";

const mbtiSchema = z.object({
  first: z.object({
    type: z.enum(["E", "I"]),
    explanation: z.string(),
  }),
  second: z.object({
    type: z.enum(["S", "N"]),
    explanation: z.string(),
  }),
  third: z.object({
    type: z.enum(["T", "F"]),
    explanation: z.string(),
  }),
  fourth: z.object({
    type: z.enum(["J", "P"]),
    explanation: z.string(),
  }),
  potential: z.object({
    type: z.string(),
    explanation: z.string(),
  }),
});

/**
 * 给定一个IMBTIResponse,如果其中某个属性为空,则使用默认值填充,保证前端收到的数据是完整的
 */
const assignDefaultMBTIResponseData = (data: IMBTIResponse): IMBTIResponse => {
  return {
    first: {
      type: data.first?.type || "",
      explanation: data.first?.explanation || "",
    },
    second: {
      type: data.second?.type || "",
      explanation: data.second?.explanation || "",
    },
    third: {
      type: data.third?.type || "",
      explanation: data.third?.explanation || "",
    },
    fourth: {
      type: data.fourth?.type || "",
      explanation: data.fourth?.explanation || "",
    },
    potential: {
      type: data.potential?.type || "",
      explanation: data.potential?.explanation || "",
    },
  };
};

/**
 * @swagger
 * /api/mbti:
 *   post:
 *     tags:
 *       - MBTI
 *     summary: MBTI人格类型分析
 *     description: 基于用户发帖内容分析其MBTI人格类型特征
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IMBTIRequest'
 *           example:
 *             text: "用户的发帖内容文本..."
 *             username: "张三"
 *     responses:
 *       200:
 *         description: MBTI分析成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/IGeneralResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/IMBTIResponse'
 *             example:
 *               isOk: true
 *               data:
 *                 first:
 *                   type: "E"
 *                   explanation: "用户表现出外向特征..."
 *                 second:
 *                   type: "N"
 *                   explanation: "用户倾向于直觉思维..."
 *                 third:
 *                   type: "F"
 *                   explanation: "用户决策时更注重情感..."
 *                 fourth:
 *                   type: "P"
 *                   explanation: "用户偏好灵活性..."
 *                 potential:
 *                   type: "ENFP"
 *                   explanation: "综合分析用户可能是ENFP类型..."
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
 *       - MBTI
 *     summary: CORS预检请求
 *     description: 处理CORS预检请求
 *     responses:
 *       200:
 *         description: 预检请求成功
 */
async function handler(request: NextRequest): Promise<NextResponse<IGeneralResponse>> {
  const { text, username } = (await request.json()) as IMBTIRequest;

  const mbtiPrompt = `请根据给出的${username}发帖总结${username}的mbti,要求输出json格式,且描述时以${username}指代用户:`;

  try {
    const { object } = await generateObject({
      model: glmChatModel(),
      schema: mbtiSchema,
      prompt: `${mbtiPrompt}${text}`,
      temperature: 0,
    });

    const mbtiResponseData = assignDefaultMBTIResponseData(object as IMBTIResponse);

    return NextResponse.json({
      isOk: true,
      data: mbtiResponseData,
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
