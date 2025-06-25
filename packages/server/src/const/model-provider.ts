import { customProvider } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";

const modelNames = [
  "deepseek-chat",
  "QwQ-32B-Friday",
  "qwen-vl-plus-latest",
  "gpt-4o-mini",
  "qwen-turbo-latest",
  "deepseek-v3-friday",
];

const apiKey = process.env.FRIDAY_API_KEY || "21899664734253830219"; // your-api-key

const myAIModels = customProvider({
  languageModels: modelNames.reduce((prev, name) => {
    prev[name] = createOpenAI({
      baseURL: "https://aigc.sankuai.com/v1/openai/native",
      apiKey,
    })(name);
    return prev;
  }, {} as any),
});

export function getModel(name: string) {
  return myAIModels.languageModel(name);
}
