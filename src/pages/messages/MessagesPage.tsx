import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { ChatAPI } from "@/features/chat/api/chat.api";
import type { ConversationData } from "@/types/api.types";

import ProfileSidebar from "@/features/users/components/profile/ProfileSidebar";
import TrendingSidebar from "@/features/posts/components/TrendingSidebar";
import ConversationList from "@/features/chat/components/ConversationList";
import ChatWindow from "@/features/chat/components/ChatWindow";

export default function MessagesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationData[]>([]);

  useEffect(() => {
    ChatAPI.getConversations().then(setConversations).catch(console.error);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="min-h-screen bg-blue-50/40 dark:bg-slate-950">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <ProfileSidebar />
            </div>
          </aside>

          <section className="min-w-0 lg:col-span-6">
            <div 
              className={`flex h-[75vh] flex-col overflow-hidden rounded-2xl border shadow-sm ${
                isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              {/* Header */}
              <div className={`flex items-center gap-2 border-b p-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <MessageSquare className="text-blue-600" size={20} />
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Messages</h1>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left: Conversation List */}
                <div className={`w-1/3 border-r hidden sm:block ${isDark ? "border-slate-800" : "border-slate-200"}`}>
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
                    <div className="flex h-full flex-col items-center justify-center text-slate-400">
                      <MessageSquare size={48} className="mb-4 opacity-50" />
                      <p>Select a conversation to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <TrendingSidebar />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}