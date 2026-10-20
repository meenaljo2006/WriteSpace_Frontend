import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  Repeat,
  CheckCheck,
  LoaderCircle,
  AtSign,
  AlertTriangle,
  Mail,
  ShieldAlert,
  KeyRound,
} from "lucide-react";

import { useTheme } from "@/app/providers/ThemeProvider";
import { NotificationsAPI } from "@/features/notifications/notifications.api";
import type { AppNotification, NotificationType } from "@/types/api.types";
import ProfileSidebar from "@/features/users/components/profile/ProfileSidebar";
import TrendingSidebar from "@/features/posts/components/TrendingSidebar";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const unreadBg = isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)";
  const hoverBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";

  const fetchNotifications = useCallback(async (currentOffset: number, append: boolean) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const data = await NotificationsAPI.getNotifications(PAGE_SIZE, currentOffset);
      
      setNotifications((prev) => {
        if (!append) return data.notifications;
        
        // Filter out duplicates just in case
        const existingIds = new Set(prev.map((n) => n.id));
        const fresh = data.notifications.filter((n) => !existingIds.has(n.id));
        return [...prev, ...fresh];
      });

      setUnreadCount(data.unreadCount);
      setHasMore(data.notifications.length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications(0, false);
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    void fetchNotifications(nextOffset, true);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await NotificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    // 1. Mark as read locally if unread
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      // Fire and forget
      NotificationsAPI.markAsRead([notification.id]).catch(console.error);
    }

    // 2. Navigate
    let targetPath = null;
    if (notification.type === "FOLLOW" && notification.actor) {
      targetPath = `/profile/${notification.actor.username}`;
    } else if (notification.relatedId) {
      targetPath = `/post/${notification.relatedId}`;
    } else if (notification.actor) {
      targetPath = `/profile/${notification.actor.username}`;
    }

    if (targetPath) navigate(targetPath);
  };

  const getTimeAgo = (dateString: string) => {
    const past = new Date(dateString);
    const diffMs = new Date().getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "REACTION": return <Heart size={14} color="#ef4444" fill="#ef4444" />;
      case "COMMENT": return <MessageSquare size={14} color="#3b82f6" fill="#3b82f6" />;
      case "FOLLOW": return <UserPlus size={14} color="#10b981" />;
      case "SHARE": return <Repeat size={14} color="#8b5cf6" />;
      case "MENTION": return <AtSign size={14} color="#ec4899" />;
      case "WELCOME":
      case "SYSTEM": return <Sparkles size={14} color="#f59e0b" />;
      case "REPORT": return <AlertTriangle size={14} color="#ef4444" />;
      case "MESSAGE": return <Mail size={14} color="#0ea5e9" />;
      case "LOGIN_ALERT":
      case "ACCOUNT_STATUS": return <ShieldAlert size={14} color="#f97316" />;
      case "PASSWORD_CHANGED":
      case "PASSWORD_RESET": return <KeyRound size={14} color="#6366f1" />;
      default: return <Bell size={14} color={mutedText} />;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/40 dark:bg-slate-950">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <ProfileSidebar />
            </div>
          </aside>

          <section className="min-w-0 space-y-6 lg:col-span-6">
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={20} color="#6366f1" />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                    Notifications
                  </h1>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: mutedText }}>
                    {unreadCount > 0 ? `You have ${unreadCount} unread messages` : "You're all caught up!"}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    color: "#6366f1",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: isMarkingAll ? "not-allowed" : "pointer",
                    opacity: isMarkingAll ? 0.5 : 1,
                  }}
                >
                  <CheckCheck size={16} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
                <LoaderCircle size={28} className="animate-spin" color="#6366f1" />
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "12px",
                  color: mutedText,
                }}
              >
                <Bell size={40} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 600, color: textColor }}>No notifications yet</p>
                <p style={{ margin: "6px 0 0 0", fontSize: "0.88rem" }}>
                  When someone interacts with you, you'll see it here.
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      display: "flex",
                      padding: "16px",
                      gap: "16px",
                      borderBottom: index !== notifications.length - 1 ? `1px solid ${borderColor}` : "none",
                      backgroundColor: notification.isRead ? "transparent" : unreadBg,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      if (notification.isRead) e.currentTarget.style.backgroundColor = hoverBg;
                    }}
                    onMouseOut={(e) => {
                      if (notification.isRead) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          backgroundColor: isDark ? "#334155" : "#e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        {notification.actor?.profileImageUrl ? (
                          <img
                            src={notification.actor.profileImageUrl}
                            alt="avatar"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sparkles size={20} color={mutedText} />
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          backgroundColor: cardBg,
                          borderRadius: "50%",
                          padding: "2px",
                        }}
                      >
                        {getIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p style={{ margin: 0, fontSize: "0.95rem", color: textColor, lineHeight: "1.5", wordBreak: "break-word" }}>
                        {notification.actor && (
                          <span style={{ fontWeight: 700 }}>
                            {notification.actor.fullname}{" "}
                          </span>
                        )}
                        <span style={{ fontWeight: notification.isRead ? 400 : 600 }}>
                          {notification.actor
                            ? notification.message.replace(`${notification.actor.fullname} `, "")
                            : notification.message}
                        </span>
                      </p>
                      <span style={{ fontSize: "0.78rem", color: mutedText, marginTop: "4px" }}>
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    {/* Unread dot */}
                    {!notification.isRead && (
                      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {!isLoading && hasMore && notifications.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    backgroundColor: "transparent",
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    fontWeight: 600,
                    cursor: isLoadingMore ? "not-allowed" : "pointer",
                    opacity: isLoadingMore ? 0.6 : 1,
                  }}
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
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