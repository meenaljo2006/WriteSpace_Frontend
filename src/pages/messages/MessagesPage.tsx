import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { ChatAPI } from "@/features/chat/api/chat.api";
import type { ConversationData } from "@/types/api.types";

import ConversationList from "@/features/chat/components/ConversationList";
import ChatWindow from "@/features/chat/components/ChatWindow";

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationData[]>([]);

  useEffect(() => {
    ChatAPI.getConversations().then(setConversations).catch(console.error);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-full w-full bg-transparent p-2 sm:p-4">
      {/* Main Glass Container */}
      <div className="flex w-full h-[82vh] flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_8px_30px_rgb(249,115,22,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-[#15233B]/70">
        
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-stone-200/60 p-4 dark:border-white/10">
          <MessageSquare className="text-orange-500" size={20} />
          <h1 className="text-lg font-bold text-[#0B192C] dark:text-white">Messages</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Conversation List */}
          <div className="hidden w-1/3 border-r border-stone-200/60 dark:border-white/10 sm:block">
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              currentUserId={user?.id}
              onSelect={(id) => setSearchParams({ id })}
            />
          </div>

          {/* Right: Chat Window */}
          <div className="flex-1">
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                currentUserId={user?.id ?? ""}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}