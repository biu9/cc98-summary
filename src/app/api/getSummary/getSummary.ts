import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { ChatMessage } from "@azure/openai";
import { encode, decode } from 'gpt-tokenizer';

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

const MAX_TOKEN = 16000;

async function summary({ messages }:{ messages: ChatMessage[] }) {

  if(messages[1].content) {
    if(encode(messages[1].content).length > MAX_TOKEN) {
      messages[1].content = decode(encode(messages[1].content).slice(0, MAX_TOKEN-500));
    }
  }

  if(!endpoint || !azureApiKey) {
    return "endpoint or azureApiKey is not defined"
  }

  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const deploymentId = "thy111";
  try {
    const result = await client.getChatCompletions(deploymentId, messages);
    if(result.choices[0].message?.content) 
      return result.choices[0].message.content;
    else
      return "请求openai接口出错,返回值为空";
  } catch (error) {
    return "请求openai接口出错,error"+JSON.stringify(error);
  }
}

export default summary;