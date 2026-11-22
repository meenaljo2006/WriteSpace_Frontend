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

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onCountUpdate, isMobile = false }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
            const unreadIds = data.notifications.filter((n) => !n.isRead).map((n) => n.id);
            if (unreadIds.length > 0) {
              NotificationsAPI.markAsRead(unreadIds).catch((err) => console.error("Background sync failed", err));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load notifications", error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAndSync();
    return () => { isMounted = false; };
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
      case "REACTION": return <Heart size={16} color="#ef4444" fill="#ef4444" />;
      case "COMMENT": return <MessageSquare size={16} color="#F97316" fill="#F97316" />;
      case "FOLLOW": return <UserPlus size={16} color="#10b981" />;
      case "SHARE": return <Repeat size={16} color="#8b5cf6" />;
      case "MENTION": return <AtSign size={16} color="#ec4899" />;
      case "WELCOME":
      case "SYSTEM": return <Sparkles size={16} color="#f59e0b" />;
      case "REPORT": return <AlertTriangle size={16} color="#ef4444" />;
      case "MESSAGE": return <Mail size={16} color="#0ea5e9" />;
      case "LOGIN_ALERT":
      case "ACCOUNT_STATUS": return <ShieldAlert size={16} color="#f97316" />;
      case "PASSWORD_CHANGED":
      case "PASSWORD_RESET": return <KeyRound size={16} color="#6366f1" />;
      default: return <Bell size={16} color={isDark ? "#a8a29e" : "#78716c"} />;
    }
  };

  const getTargetPath = (notification: AppNotification): string | null => {
    if (notification.type === "FOLLOW" && notification.actor) return `/profile/${notification.actor.username}`;
    if (notification.relatedId && notification.type !== "FOLLOW") return `/post/${notification.relatedId}`; 
    if (notification.actor) return `/profile/${notification.actor.username}`;
    return null;
  };

  const handleNotificationClick = (notification: AppNotification) => {
    const targetPath = getTargetPath(notification);
    onClose();
    if (targetPath) navigate(targetPath);
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

  const containerClass = isMobile 
    ? "w-full bg-white/90 dark:bg-[#15233B]/90 backdrop-blur-xl"
    : "absolute top-[140%] right-[-80px] w-[360px] bg-white/90 dark:bg-[#15233B]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col z-[100] animate-in fade-in slide-in-from-top-2 duration-200 cursor-default";

  return (
    <div className={containerClass} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-stone-200/60 dark:border-white/10">
        <h3 className="m-0 text-base font-bold text-[#0B192C] dark:text-white">
          Notifications
        </h3>
        {!isLoading && notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 transition-colors"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center p-10 text-orange-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-10 text-stone-500 dark:text-stone-400">
            <Bell size={32} className="mx-auto mb-3 opacity-50" />
            <p className="m-0 text-sm font-medium">No notifications yet</p>
            <p className="m-0 text-xs mt-1">When someone interacts with you, you'll see it here.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const hasTarget = getTargetPath(notification) !== null;
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex p-4 gap-3 border-b border-stone-100 dark:border-white/5 transition-colors ${
                  notification.isRead 
                    ? "bg-transparent hover:bg-stone-50 dark:hover:bg-white/5" 
                    : "bg-orange-50/50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20"
                } ${hasTarget ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Avatar Area */}
                <div 
                  className="relative shrink-0 cursor-pointer"
                  onClick={(e) => handleProfileClick(e, notification.actor?.username)}
                >
                  <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    {notification.actor?.profileImageUrl ? (
                      <img src={notification.actor.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles size={20} className="text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#15233B] rounded-full p-0.5 shadow-sm border border-stone-100 dark:border-white/10">
                    {getIcon(notification.type)}
                  </div>
                </div>

                {/* Text Area */}
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm text-stone-800 dark:text-stone-200 leading-snug break-words">
                    {notification.actor && (
                      <span 
                        className="font-bold hover:underline cursor-pointer"
                        onClick={(e) => handleProfileClick(e, notification.actor?.username)}
                      >
                        {notification.actor.fullname}{" "}
                      </span>
                    )}
                    <span className={notification.isRead ? "font-normal" : "font-semibold"}>
                      {notification.actor ? notification.message.replace(`${notification.actor.fullname} `, "") : notification.message}
                    </span>
                  </p>
                  <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>

                {!notification.isRead && (
                  <div className="flex items-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
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