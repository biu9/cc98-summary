import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IGeneralResponse, IMBTIRequest, IMBTIResponse } from "@request/api";
import { SchemaType } from '@google/generative-ai';

const genAi = new GoogleGenerativeAI(process.env.API_KEY!);

const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash", generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        first: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "第一个MBTI维度",
              enum: ["E", "I"]
            },
            explanation: {
              type: SchemaType.STRING,
              description: "第一个MBTI维度解释"
            }
          }
        },
        second: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "第二个MBTI维度",
              enum: ["S", "N"]
            },
            explanation: {
              type: SchemaType.STRING,
              description: "第二个MBTI维度解释"
            }
          }
        },
        third: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "第三个MBTI维度",
              enum: ["T", "F"]
            },
            explanation: {
              type: SchemaType.STRING,
              description: "第三个MBTI维度解释"
            }
          }
        },
        fourth: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "第四个MBTI维度",
              enum: ["J", "P"]
            },
            explanation: {
              type: SchemaType.STRING,
              description: "第四个MBTI维度解释"
            }
          }
        },
        potential: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "潜在的MBTI类型",
            },
            explanation: {
              type: SchemaType.STRING,
              description: "潜在的MBTI类型解释,需要说明为什么是这个类型,用户的哪些发言支持这个类型,哪些发言不支持这个类型"
            }
          }
        }
      }
    }
  }
});

/**
 * 给定一个IMBTIResponse,如果其中某个属性为空,则使用默认值填充,保证前端收到的数据是完整的
 * @param data Gemini给出的IMBTIResponse,其中可能有属性为空
 */
const assignDefaultMBTIResponseData = (data: IMBTIResponse): IMBTIResponse => {
  return {
    first: {
      type: data.first?.type || "",
      explanation: data.first?.explanation || ""
    },
    second: {
      type: data.second?.type || "",
      explanation: data.second?.explanation || ""
    },
    third: {
      type: data.third?.type || "",
      explanation: data.third?.explanation || ""
    },
    fourth: {
      type: data.fourth?.type || "",
      explanation: data.fourth?.explanation || ""
    },
    potential: {
      type: data.potential?.type || "",
      explanation: data.potential?.explanation || ""
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<IGeneralResponse>> {
  const { text, username } = await request.json() as IMBTIRequest;

  const mbtiPrompt = `请根据给出的${username}发帖总结${username}的mbti,要求输出json格式,且描述时以${username}指代用户:`  

  try {
    const result = await model.generateContent(`${mbtiPrompt}${text}`);
    const response = result.response;
    const resultText = response.text().replace(/\n/g, "");

    const mbtiResponseData = assignDefaultMBTIResponseData(JSON.parse(resultText) as IMBTIResponse);

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