// @ts-nocheck
// LangChain 示例 - 功能强大
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

// 1. 创建向量数据库
const vectorStore = await HNSWLib.fromDocuments(
  documents,
  new OpenAIEmbeddings()
);

// 2. 创建检索链
const model = new OpenAI();
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

// 3. 查询
const response = await chain.call({
  query: '如何使用React Hooks?',
});

console.log(response);
