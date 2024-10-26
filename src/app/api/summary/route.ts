import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IGeneralResponse, ISummaryRequest } from "@request/api";

const genAi = new GoogleGenerativeAI(process.env.API_KEY!);

const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash", generationConfig: {
    temperature: 0
  }
});

export async function POST(request: NextRequest): Promise<NextResponse<IGeneralResponse>> {
  const { text } = await request.json() as ISummaryRequest;

  try {
    const result = await model.generateContent(text);
    const response = result.response;
    const resultText = response.text();

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