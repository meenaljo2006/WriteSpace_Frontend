import React from "react";
import { User } from "lucide-react";
import type { ConversationData } from "@/types/api.types";

interface ConversationListProps {
  conversations: ConversationData[];
  activeId: string | null;
  currentUserId?: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-500 dark:text-stone-400">
        <p className="text-sm">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-hide">
      {conversations.map((conv) => {
        const isActive = activeId === conv.id;

        const otherUser = conv.otherUser; 
        const title = otherUser?.fullname || otherUser?.username || "Unknown User";
        const avatar = otherUser?.profileImageUrl;
        const unread = (conv.unreadCount ?? 0) > 0;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center gap-3 p-4 w-full text-left transition-colors border-b border-stone-100 dark:border-white/5 ${
              isActive
                ? "bg-orange-50 dark:bg-orange-500/10" 
                : "hover:bg-stone-50 dark:hover:bg-white/5"
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex-shrink-0 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold">
                  {title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span
                  className={`text-sm font-semibold truncate ${
                    isActive
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-[#0B192C] dark:text-white"
                  }`}
                >
                  {title}
                </span>
              </div>
              <p
                className={`text-xs truncate ${
                  unread
                    ? "font-bold text-stone-800 dark:text-stone-200"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {typeof conv.lastMessage === "string"
                  ? conv.lastMessage
                  : conv.lastMessage?.content || "No messages yet"}
              </p>
            </div>

            {/* Unread Badge */}
            {unread && (
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {conv.unreadCount}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}