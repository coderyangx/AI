/**
 * 1. useCompletion - 单次文本生成
 */
import { useCompletion } from '@ai-sdk/react';

const CompletionComponent = () => {
  const {
    completion, // AI 生成的文本
    input, // 当前输入
    handleInputChange,
    handleSubmit,
    isLoading, // 是否正在生成
    error, // 错误信息
    stop, // 停止生成
  } = useCompletion({
    api: 'http://localhost:8080/api/completion',
    onFinish: (prompt, completion) => {
      console.log('生成完成:', { prompt, completion });
    },
    onError: (error) => {
      console.error('生成失败:', error);
    },
  });

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>文本生成</h2>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className='space-y-2'>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder='输入提示词...'
          className='w-full p-2 border rounded'
          rows={3}
        />
        <div className='flex gap-2'>
          <button
            type='submit'
            disabled={isLoading}
            className='px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50'
          >
            {isLoading ? '生成中...' : '生成'}
          </button>
          {isLoading && (
            <button
              type='button'
              onClick={stop}
              className='px-4 py-2 bg-red-500 text-white rounded'
            >
              停止
            </button>
          )}
        </div>
      </form>

      {/* 生成结果 */}
      {completion && (
        <div className='p-4 bg-gray-100 rounded'>
          <h3 className='font-bold mb-2'>生成结果:</h3>
          <p className='whitespace-pre-wrap'>{completion}</p>
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

export default CompletionComponent;
