// WebSocket stream protocol

import { CoreMessage } from "ai";

export enum EAssistantMessageType {
  // 普通的对话回复消息
  NORMAL = "NORMAL",
  // 数据分析消息
  ANALYSIS = "ANALYSIS",
  // 异常消息
  ERROR = "ERROR",
}

// 所有 WebSocket 消息的基础接口
interface IBaseWebSocketResponseMessage {
  conversationId: string;
  messageId: string;
  timestamp: number;
}

// 普通对话回复消息
export interface IDialogResponseMessage extends IBaseWebSocketResponseMessage {
  type: EAssistantMessageType.NORMAL;
  payload: {
    token: string; // 增量内容
    stop: boolean;
  };
}

// 数据分析响应消息
export interface IDataAnalysisResponseMessage
  extends IBaseWebSocketResponseMessage {
  type: EAssistantMessageType.ANALYSIS;
  payload:
    | {
        token: string; // 增量内容
        stop: boolean;
        messageTag: "header" | "summary"; // header 是节点标题，summary 是节点内容
        stepIndex: number;
      }
    | {
        token: string; // 增量内容
        stop: boolean;
        messageTag: "final"; // 最终的总结
      }
    | {
        token: string;
        messageTag: "start";
      }
    | {
        messageTag: "end";
      };
}

// 错误
export interface IErrorResponseMessage extends IBaseWebSocketResponseMessage {
  type: EAssistantMessageType.ERROR;
  payload: {
    message: string;
  };
}

export type IWebSocketResponseMessage =
  | IDialogResponseMessage
  | IDataAnalysisResponseMessage
  | IErrorResponseMessage;

// client send message

export enum ERequestMessageType {
  QUERY = "QUERY",
  COMMAND = "COMMAND",
}

export interface IUserQueryRequestMessage {
  type: ERequestMessageType.QUERY;
  payload: {
    conversationId: string;
    messages: CoreMessage[];
    fileKey?: string;
  };
}

export interface ICommandRequestMessage {
  type: ERequestMessageType.COMMAND;
  payload: {
    conversationId: string;
    command: "stop" | "rerun";
  };
}

export type IWebSocketRequestMessage =
  | IUserQueryRequestMessage
  | ICommandRequestMessage;
