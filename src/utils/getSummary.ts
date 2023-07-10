import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

async function summary({ endpoint, azureApiKey, messages }:{ endpoint: string, azureApiKey: string, messages: any[] }) {
  console.log("== Chat Completions Sample ==");

  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const deploymentId = "thy111";
  const result = await client.getChatCompletions(deploymentId, messages);

  for (const choice of result.choices) {
    console.log(choice.message);
  }
}

export default summary;