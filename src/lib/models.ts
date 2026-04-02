import { createOpenAI } from "@ai-sdk/openai";

/** 智谱 AI 通用 API，见 https://docs.bigmodel.cn/cn/api/introduction */
const BIGMODEL_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";

/**
 * OpenAI 兼容端点 + Bearer，与 Vercel AI SDK 的 `createOpenAI` 配合使用。
 * 环境变量：`BIGMODEL_API_KEY`（或 `ZHIPU_API_KEY`）；可选 `GLM_MODEL`（默认 `glm-5`）。
 */
export const glm = createOpenAI({
  name: "bigmodel",
  baseURL: BIGMODEL_BASE_URL,
  apiKey: process.env.BIGMODEL_API_KEY ?? process.env.ZHIPU_API_KEY,
  /** 智谱等为 OpenAI 兼容 API，非官方 OpenAI 端点 */
  compatibility: "compatible",
});

/** Chat Completions 模型（如 glm-5、glm-4-flash 等，以控制台为准） */
export function glmChatModel() {
  const modelId = process.env.GLM_MODEL ?? "glm-5";
  return glm.chat(modelId);
}
