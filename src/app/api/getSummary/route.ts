import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { ISummaryResponse } from "@request/api";
import summary from "./getSummary";
import { ChatMessage } from "@azure/openai";

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

export const runtime = 'edge';

export async function POST(request:NextRequest):Promise<NextResponse<ISummaryResponse>> {
    const req = await request.json()
    const messages = req.messages as ChatMessage[]

    if(!endpoint || !azureApiKey) {
        return NextResponse.json({
            msg:'endpoint or azureApiKey is not defined',
            code:403
        })        
    }

    const res = await summary({
        messages
    })
    return NextResponse.json({
        msg:res,
        code:200
    })        

}