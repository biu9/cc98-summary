import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IGeneralResponse } from "@request/api";

const genAi = new GoogleGenerativeAI(process.env.API_KEY!);

const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = '你好';

export async function POST(request: NextRequest): Promise<NextResponse<IGeneralResponse>> {
  const { userInfo } = await request.json();

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      isOk: true,
      data: text,
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