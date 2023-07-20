import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

async function summary({ endpoint, azureApiKey, messages }:{ endpoint: string, azureApiKey: string, messages: any[] }) {

  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const deploymentId = "thy111";
  try {
    const result = await client.getChatCompletions(deploymentId, messages);
    if(result.choices[0].message?.content) 
      return result.choices[0].message.content;
    else
      return "出错了, endpoint"+endpoint+"azure key"+azureApiKey+"messages"+messages;
  } catch (error) {
    return "出错了, endpoint"+endpoint+"azure key"+azureApiKey+"messages"+messages;
  }
}

export default summary;