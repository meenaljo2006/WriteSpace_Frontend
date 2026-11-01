import { useEffect, useRef, useState } from "react";
import { Send, User } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { ChatAPI } from "../api/chat.api";
import type { ChatMessage, ConversationData } from "@/types/api.types";

interface Props {
  conversation: ConversationData;
  currentUserId: string;
}

export default function ChatWindow({ conversation, currentUserId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    ChatAPI.getMessages(conversation.id)
      .then((res) => {
        if (!cancelled) setMessages(res.messages);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [conversation.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      const newMsg = await ChatAPI.sendMessage(conversation.id, input.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={`flex items-center gap-3 border-b p-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
          {conversation.otherUser.profileImageUrl ? (
            <img src={conversation.otherUser.profileImageUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <User className="h-full w-full p-2 text-slate-400" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{conversation.otherUser.fullname}</h2>
          <p className="text-xs text-slate-500">@{conversation.otherUser.username}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <p className="text-center text-sm text-slate-500">Loading messages...</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-none"
                      : isDark
                      ? "bg-slate-800 text-slate-100 rounded-bl-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t p-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}