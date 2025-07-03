/**
 * 2. useObject - 结构化数据生成
 */

import { config } from '@/config';
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

// 定义数据结构
const recipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  cookingTime: z.number(),
  difficulty: z.enum(['简单', '中等', '困难']),
});

const ObjectComponent = () => {
  const {
    object, // 生成的结构化对象
    submit, // 触发生成
    isLoading,
    error,
  } = experimental_useObject({
    api: config.apiBaseUrl + '/api/agent/test',
    schema: recipeSchema,
  });

  const generateRecipe = () => {
    submit('生成一个简单的意大利面食谱');
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>结构化数据生成</h2>

      <button
        onClick={generateRecipe}
        disabled={isLoading}
        className='px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50'
      >
        {isLoading ? '生成中...' : '生成食谱'}
      </button>

      {/* 显示生成的结构化数据 */}
      {object && (
        <div className='p-4 bg-blue-50 rounded'>
          <h3 className='text-lg font-bold mb-2'>{object.title}</h3>

          <div className='mb-4'>
            <h4 className='font-bold'>食材:</h4>
            <ul className='list-disc list-inside'>
              {object.ingredients?.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className='mb-4'>
            <h4 className='font-bold'>制作步骤:</h4>
            <ol className='list-decimal list-inside'>
              {object.steps?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div className='flex gap-4 text-sm text-gray-600'>
            <span>烹饪时间: {object.cookingTime} 分钟</span>
            <span>难度: {object.difficulty}</span>
          </div>
        </div>
      )}

      {error && (
        <div className='p-4 bg-red-100 text-red-700 rounded'>
          错误: {error.message}
        </div>
      )}
    </div>
  );
};

export default ObjectComponent;
