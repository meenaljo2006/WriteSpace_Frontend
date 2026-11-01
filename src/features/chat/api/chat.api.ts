import api from "@/lib/api/api";
import type { ConversationData, ChatMessage } from "@/types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const ChatAPI = {
  getConversations: async (): Promise<ConversationData[]> => {
    const response = await api.get<BackendResponse<ConversationData[]>>("/chat");
    return response.data.data;
  },

  startConversation: async (targetUserId: string): Promise<{ id: string }> => {
    const response = await api.post<BackendResponse<{ id: string }>>("/chat/start", {
      targetUserId,
    });
    return response.data.data;
  },

  getMessages: async (conversationId: string, cursor?: string): Promise<{ messages: ChatMessage[] }> => {
    const response = await api.get<BackendResponse<{ messages: ChatMessage[] }>>(
      `/chat/${conversationId}/messages`,
      { params: { cursor } }
    );
    return response.data.data;
  },

  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const response = await api.post<BackendResponse<ChatMessage>>(
      `/chat/${conversationId}/messages`,
      { content }
    );
    return response.data.data;
  },
};