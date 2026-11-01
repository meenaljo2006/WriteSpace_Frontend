import { useEffect, useRef, useState } from "react";
import { Send, User,CheckCheck ,Check} from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { ChatAPI } from "../api/chat.api";
import { getSocket } from "@/lib/socket";
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

  // 1. Fetch initial messages from DB
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

  // 2. REAL-TIME SOCKET LOGIC
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join_conversation", conversation.id);

    const handleReceiveMessage = (newMsg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    // Cleanup
    return () => {
      socket.emit("leave_conversation", conversation.id);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [conversation.id]);

  // 3. Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message via Socket (Updated handleSend)
  const handleSend = () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    
    const socket = getSocket();

    if (socket && socket.connected) {
      // Real-time send
      socket.emit("send_message", {
        conversationId: conversation.id,
        content: input.trim(),
        recipientId: conversation.otherUser.id,
      });
      setInput("");
      setIsSending(false);
    } else {
      // Fallback to REST API if socket is disconnected
      ChatAPI.sendMessage(conversation.id, input.trim())
        .then((newMsg) => {
          setMessages((prev) => [...prev, newMsg]);
          setInput("");
        })
        .catch(console.error)
        .finally(() => setIsSending(false));
    }
  };

  //  REAL-TIME SOCKET LOGIC
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join_conversation", conversation.id);

    const handleReceiveMessage = (newMsg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      
      if (newMsg.senderId !== currentUserId) {
        socket.emit("mark_read", conversation.id);
      }
    };

    const handleMessagesMarkedRead = (data: { conversationId: string }) => {
      if (data.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true }))
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_marked_read", handleMessagesMarkedRead);
    socket.emit("mark_read", conversation.id);

    return () => {
      socket.emit("leave_conversation", conversation.id);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_marked_read", handleMessagesMarkedRead);
    };
  }, [conversation.id]);

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
                  {isMine && (
                    <span className="ml-2 inline-block align-middle">
                      {msg.isRead ? (
                        // Read -> Blue Double Tick
                        <CheckCheck size={14} className="text-blue-300" />
                      ) : (
                        // send -> Grey Single Tick
                        <Check size={14} className="text-slate-400" />
                      )}
                    </span>
                  )}
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