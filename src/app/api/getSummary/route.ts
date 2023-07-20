import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { ISummaryResponse } from "@request/api";
import summary from "./getSummary";

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

export async function POST(request:NextRequest):Promise<NextResponse<ISummaryResponse>> {
    const req = await request.json()
    const message = req.messages

    if(!endpoint || !azureApiKey) {
        return NextResponse.json({
            msg:'endpoint or azureApiKey is not defined',
            code:403
        })        
    }

    try {
        const res = await summary({
            endpoint,
            azureApiKey,
            messages: message
        })
        return NextResponse.json({
            msg:res,
            code:200
        })        
    } catch (error) {
        return NextResponse.json({
            msg:'看起来是openai出了问题,报错具体信息: '+error as string,
            code:500
        })        
    }

}