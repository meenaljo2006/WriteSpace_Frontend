import { useTheme } from "@/app/providers/ThemeProvider";
import type { ConversationData } from "@/types/api.types";
import { User } from "lucide-react";

interface Props {
  conversations: ConversationData[];
  activeId: string | null;
  onSelect: (id: string) => void;
  currentUserId?: string;
}

export default function ConversationList({ conversations, activeId, onSelect, currentUserId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        No messages yet. Start a conversation from someone's profile!
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((conv) => {
        const isActive = activeId === conv.id;
        const isMyMessage = conv.lastMessage?.senderId === currentUserId;

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex cursor-pointer items-center gap-3 p-4 transition-colors ${
              isActive
                ? isDark ? "bg-slate-800" : "bg-blue-50"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              {conv.otherUser.profileImageUrl ? (
                <img src={conv.otherUser.profileImageUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-full w-full p-2 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between">
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {conv.otherUser.fullname}
                </span>
                {conv.lastMessage && (
                  <span className="text-xs text-slate-500">
                    {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-500 mt-1">
                {conv.lastMessage
                  ? `${isMyMessage ? "You: " : ""}${conv.lastMessage.content}`
                  : "Started a conversation"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}