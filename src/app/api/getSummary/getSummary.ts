import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { ChatMessage } from "@azure/openai";

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

async function summary({ messages }:{ messages: ChatMessage[] }) {

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
    return "请求openai接口出错,error"+error;
  }
}

export default summary;