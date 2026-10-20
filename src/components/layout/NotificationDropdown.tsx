import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageSquare, UserPlus, Sparkles, Repeat, CheckCheck, Loader2, Bell, AtSign, AlertTriangle, Mail, ShieldAlert, KeyRound } from "lucide-react";
import { NotificationsAPI } from "@/features/notifications/notifications.api";
import type { AppNotification, NotificationType } from "@/types/api.types";
import { useTheme } from "@/app/providers/ThemeProvider";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onCountUpdate: (count: number) => void;
  isMobile?: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onCountUpdate,
  isMobile = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Theme Variables
  const bgColor = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const unreadBg = isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)";
  const hoverBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchAndSync = async () => {
      setIsLoading(true);
      try {
        const data = await NotificationsAPI.getNotifications(20, 0);
        
        if (isMounted) {
          setNotifications(data.notifications);
          setIsLoading(false);
          
          if (data.unreadCount > 0) {
            onCountUpdate(0);
            
            const unreadIds = data.notifications
              .filter((n) => !n.isRead)
              .map((n) => n.id);
              
            if (unreadIds.length > 0) {
              NotificationsAPI.markAsRead(unreadIds).catch((err) => 
                console.error("Background sync failed", err)
              );
            }
          }
        }
      } catch (error) {
        console.error("Failed to load notifications", error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAndSync();

    return () => {
      isMounted = false;
    };
  }, [isOpen, onCountUpdate]);

  const getTimeAgo = (dateString: string) => {
    const past = new Date(dateString);
    const diffMs = new Date().getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return past.toLocaleDateString();
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "REACTION":
        return <Heart size={16} color="#ef4444" fill="#ef4444" />;
      case "COMMENT":
        return <MessageSquare size={16} color="#3b82f6" fill="#3b82f6" />;
      case "FOLLOW":
        return <UserPlus size={16} color="#10b981" />;
      case "SHARE":
        return <Repeat size={16} color="#8b5cf6" />;
      case "MENTION":
        return <AtSign size={16} color="#ec4899" />;
      case "WELCOME":
      case "SYSTEM":
        return <Sparkles size={16} color="#f59e0b" />;
      case "REPORT":
        return <AlertTriangle size={16} color="#ef4444" />;
      case "MESSAGE":
        return <Mail size={16} color="#0ea5e9" />;
      case "LOGIN_ALERT":
      case "ACCOUNT_STATUS":
        return <ShieldAlert size={16} color="#f97316" />;
      case "PASSWORD_CHANGED":
      case "PASSWORD_RESET":
        return <KeyRound size={16} color="#6366f1" />;
      default:
        return <Bell size={16} color={mutedText} />;
    }
  };

  const getTargetPath = (notification: AppNotification): string | null => {
    if (notification.type === "FOLLOW" && notification.actor) {
      return `/profile/${notification.actor.username}`;
    }
    
    if (notification.relatedId && notification.type !== "FOLLOW") {
      return `/post/${notification.relatedId}`; 
    }

    if (notification.actor) {
      return `/profile/${notification.actor.username}`;
    }

    return null;
  };

  const handleNotificationClick = (notification: AppNotification) => {
    const targetPath = getTargetPath(notification);
    onClose();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const handleProfileClick = (e: React.MouseEvent, username?: string) => {
    e.stopPropagation();
    if (username) {
      onClose();
      navigate(`/profile/${username}`);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      onCountUpdate(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const containerStyle: React.CSSProperties = isMobile
    ? { width: "100%", backgroundColor: bgColor }
    : {
        position: "absolute",
        top: "140%",
        right: "-80px", 
        width: "360px",
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.2s ease-out",
        fontFamily: "Inter, sans-serif",
        cursor: "default",
      };

  return (
    <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "16px", borderBottom: `1px solid ${borderColor}` 
      }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: textColor }}>
          Notifications
        </h3>
        {!isLoading && notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: "none", border: "none", cursor: "pointer", 
              color: "#6366f1", fontSize: "0.85rem", fontWeight: 600, 
              display: "flex", alignItems: "center", gap: "4px", padding: 0
            }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: mutedText }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: mutedText }}>
            <Bell size={32} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>No notifications yet</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>When someone interacts with you, you'll see it here.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const hasTarget = getTargetPath(notification) !== null;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  display: "flex",
                  padding: "16px",
                  gap: "12px",
                  borderBottom: `1px solid ${borderColor}`,
                  backgroundColor: notification.isRead ? "transparent" : unreadBg,
                  textDecoration: "none",
                  transition: "background-color 0.2s",
                  cursor: hasTarget ? "pointer" : "default",
                }}
                onMouseOver={(e) => {
                  if (hasTarget) e.currentTarget.style.backgroundColor = hoverBg;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? "transparent" : unreadBg;
                }}
              >
                {/* Left: Avatar & Badge */}
                <div 
                  style={{ position: "relative", flexShrink: 0, cursor: notification.actor ? "pointer" : "default" }}
                  onClick={(e) => handleProfileClick(e, notification.actor?.username)}
                >
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%", 
                    backgroundColor: isDark ? "#334155" : "#e2e8f0", 
                    overflow: "hidden"
                  }}>
                    {notification.actor?.profileImageUrl ? (
                      <img src={notification.actor.profileImageUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Sparkles size={20} color={mutedText} />
                      </div>
                    )}
                  </div>
                  <div style={{
                    position: "absolute", bottom: "-2px", right: "-2px",
                    backgroundColor: bgColor, borderRadius: "50%", padding: "2px"
                  }}>
                    {getIcon(notification.type)}
                  </div>
                </div>

                {/* Right: Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, fontSize: "0.9rem", color: textColor, 
                    lineHeight: "1.4", wordBreak: "break-word" 
                  }}>
                    {notification.actor && (
                      <span 
                        style={{ fontWeight: 600, cursor: "pointer" }}
                        onClick={(e) => handleProfileClick(e, notification.actor?.username)}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                      >
                        {notification.actor.fullname}{" "}
                      </span>
                    )}
                    <span style={{ fontWeight: notification.isRead ? 400 : 600 }}>
                      {notification.actor ? notification.message.replace(`${notification.actor.fullname} `, "") : notification.message}
                    </span>
                  </p>
                  <span style={{ fontSize: "0.75rem", color: mutedText, marginTop: "4px", display: "block" }}>
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>

                {!notification.isRead && (
                  <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6" }} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;