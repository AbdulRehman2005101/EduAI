// types/educational.ts
export interface TeachRequest {
  query: string;
  user_id: string;
  allow_direct_code?: boolean;
  history_summary?: string;
  retrieval?: {
    filters?: {
      document_id?: string;
    };
  };
}

export interface TeachResponse {
  message: string;
  retrieved_context?: Array<{
    content: string;
    metadata: {
      filename?: string;
      document_id?: string;
      [key: string]: any;
    };
  }>;
  conversation_stage: string;
}

export interface ConversationItem {
  question: string;
  response: TeachResponse;
}

export interface UseEducationalChatReturn {
  conversation: ConversationItem[];
  loading: boolean;
  error: string | null;
  allowDirectCode: boolean;
  sendMessage: (query: string, userId?: string) => Promise<TeachResponse>;
  clearHistory: () => void;
  toggleDirectCode: () => void;
}