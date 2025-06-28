import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { DeepAnalysisService, type DeepAnalysisState } from "./service.js";
import type { Message } from "@ai-sdk/react";

interface IChatState extends DeepAnalysisState {
  input: string;
}

interface IChatActions {
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  append: (message: Omit<Message, "id">) => void;
}

// React hooks to access the state
export function useDeepAnalysisState({
  endpoint,
}: {
  endpoint?: string;
}): IChatState & IChatActions {
  const [input, setInput] = useState("");
  const svc = useRef<DeepAnalysisService | null>(null);
  if (!svc.current) {
    svc.current = new DeepAnalysisService(endpoint);
  }

  const state = useSyncExternalStore<DeepAnalysisState>(
    svc.current.subscribe.bind(svc.current),
    svc.current.getSnapshot.bind(svc.current)
  );

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!input.trim()) {
        return;
      }
      svc.current.addMessage({
        role: "user",
        content: input,
      });
      svc.current.submit();
      setInput("");
    },
    [input]
  );

  const stop = useCallback(() => {
    // deepAnalysisService.stop();
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    svc.current.messages = messages;
  }, []);

  const append = useCallback((message: Omit<Message, "id">) => {
    svc.current.addMessage(message);
    svc.current.submit();
  }, []);

  return {
    ...state,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    stop,
    setMessages,
    append,
  };
}
