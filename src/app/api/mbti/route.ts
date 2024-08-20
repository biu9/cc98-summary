import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.API_KEY!);

const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = '你好';

export async function POST(request: NextRequest) {
  const { userInfo } = await request.json();

  // test
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);

  return NextResponse.json({
    message: 'success',
    data: text,
  })
}