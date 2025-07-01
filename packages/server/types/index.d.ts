declare module '@hono/node-server' {
  export function serve(options: any, callback?: (info: any) => void): any;
}

// declare module '@ai-sdk/openai' {
//   export function createOpenAI(options: any): any;
// }

declare module 'winston' {
  export const createLogger: any;
  export const format: any;
  export const transports: any;
}
