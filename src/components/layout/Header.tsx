import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  MessageSquare,
  Bell,
  User as UserIcon,
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-toastify";

import { NotificationsAPI } from "@/features/notifications/notifications.api";
import NotificationDropdown from "./NotificationDropdown";
import SearchComponent from "./SearchComponent";
import { getSocket } from "@/lib/socket"; 
import { ChatAPI } from "@/features/chat/api/chat.api"; 

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logoutState } = useAuth();

  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Notification States
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const profileImageUrl = user?.profileImageUrl || "";
  const userName = user?.fullname || "User";
  const userHeadline = user?.headline || "Add a headline in your profile";

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      
      if (profileMenuRef.current && targetNode && typeof profileMenuRef.current.contains === "function") {
        if (!profileMenuRef.current.contains(targetNode)) {
          setIsProfileMenuOpen(false);
        }
      }
      
      if (notificationMenuRef.current && targetNode && typeof notificationMenuRef.current.contains === "function") {
        if (!notificationMenuRef.current.contains(targetNode)) {
          setIsNotificationOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial unread count silently in the background
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (user) {
          const data = await NotificationsAPI.getNotifications(1, 0);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    };
    
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch initial unread message count & listen to socket
  useEffect(() => {
    if (!user) return;

    ChatAPI.getConversations().then((convs) => {
      const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadMessagesCount(total);
    }).catch(console.error);

    const socket = getSocket();
    if (socket) {
      const handleNewMessage = () => {
        if (!location.pathname.startsWith("/messages")) {
          setUnreadMessagesCount((prev) => prev + 1);
        }
      };
      
      socket.on("new_message_notification", handleNewMessage);
      
      return () => {
        socket.off("new_message_notification", handleNewMessage);
      };
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/messages")) {
      setUnreadMessagesCount(0);
    }
  }, [location.pathname]);

  const isMobile = windowWidth < 768;
  
  // Updated Color Theme
  const textColor = isDark ? "#f5f5f4" : "#1c1917"; // stone-50 vs stone-900
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(28,25,23,0.6)";
  const mutedText = isDark ? "#a8a29e" : "#78716c"; // stone-400 vs stone-500
  const accentColor = "#F97316"; // Vibrant Orange
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(249, 115, 22, 0.15)"; // Amber-tinted border

  // Frosted Glass Header Style
  const macGlassStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: isMobile ? "0 1rem" : "0 2rem",
    backgroundColor: isDark ? "rgba(11, 25, 44, 0.8)" : "rgba(255, 251, 245, 0.85)", // #0B192C and #FFFBF5 with opacity
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: isDark ? "0 4px 30px rgba(0, 0, 0, 0.3)" : "0 4px 30px rgba(249, 115, 22, 0.05)",
    color: textColor,
    zIndex: 1000,
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  };

  const getNavItemStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname.startsWith(path);
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      gap: "4px",
      cursor: "pointer",
      transition: "color 0.2s ease",
      color: isActive ? accentColor : iconColor,
      fontSize: "0.75rem",
      fontWeight: isActive ? "600" : "500",
      background: "none",
      border: "none",
      padding: 0
    };
  };

  const handleLogout = () => {
    logoutState(); 
    setIsProfileMenuOpen(false);
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const handleComingSoon = () => {
    setIsProfileMenuOpen(false);
    toast.info("Posts & Activity feature coming in v1.1!", {
      theme: isDark ? "dark" : "light"
    });
  };

  const handleLinkHover = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = accentColor;
  };
  const handleLinkLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = mutedText;
  };

  if (isMobile && isMobileSearchOpen) {
    return (
      <header style={macGlassStyle}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "12px", animation: "fadeIn 0.2s" }}>
          <button onClick={() => setIsMobileSearchOpen(false)} style={{ background: "none", border: "none", color: iconColor, cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={24} />
          </button>
          <SearchComponent isMobile={true} autoFocus={true} onCloseMobile={() => setIsMobileSearchOpen(false)} />
        </div>
      </header>
    );
  }

  return (
    <header style={macGlassStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "1rem" : "1.5rem", flex: 1 }}>
        
        {/* ================= BRAND LOGO ================= */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <img 
            src={isDark ? "/logo_light.png" : "/logo.png"} 
            alt="WriteSpace Logo" 
            style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "8px" }} 
          />
          <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: textColor, display: isMobile ? "none" : "block", letterSpacing: "-0.5px" }}>
            WriteSpace
          </span>
        </Link>

        {/* ================= SEARCH BAR ================= */}
        {isMobile ? (
          <button onClick={() => setIsMobileSearchOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Search size={22} color={iconColor} />
          </button>
        ) : (
          <div style={{ width: "100%", maxWidth: "500px", marginLeft: "2rem" }}>
            <SearchComponent isMobile={false} />
          </div>
        )}
      </div>

      {isMobile ? (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: iconColor, position: "relative" }}>
            <Bell size={24} />
            {unreadCount > 0 && (
              <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", backgroundColor: accentColor, borderRadius: "50%", border: `2px solid ${isDark ? "#1c1917" : "#fff"}` }} />
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: iconColor }}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      ) : (
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link to="/home" style={getNavItemStyle("/home")}>
            <Home size={22} />
            <span>Home</span>
          </Link>
          
          <Link to="/messages" style={getNavItemStyle("/messages")}>
            <div style={{ position: "relative" }}>
              <MessageSquare size={22} />
              {unreadMessagesCount > 0 && (
                <div style={{ position: "absolute", top: "-4px", right: "-6px", backgroundColor: accentColor, color: "white", fontSize: "10px", fontWeight: "bold", minWidth: "16px", height: "16px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${isDark ? "#1c1917" : "#fff"}`, padding: "0 4px" }}>
                  {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                </div>
              )}
            </div>
            <span>Message</span>
          </Link>

          <div ref={notificationMenuRef} style={{ position: "relative" }}>
            <button onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsProfileMenuOpen(false); }} style={getNavItemStyle("/notifications")}>
              <div style={{ position: "relative" }}>
                <Bell size={22} />
                {unreadCount > 0 && (
                  <div style={{ position: "absolute", top: "-4px", right: "-6px", backgroundColor: accentColor, color: "white", fontSize: "10px", fontWeight: "bold", minWidth: "16px", height: "16px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${isDark ? "#1c1917" : "#fff"}`, padding: "0 4px" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              <span>Notifications</span>
            </button>
            
            {isNotificationOpen && (
              <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} onCountUpdate={setUnreadCount} />
            )}
          </div>

          <div ref={profileMenuRef} style={{ position: "relative" }}>
            <button onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); setIsNotificationOpen(false); }} style={{ ...getNavItemStyle("/profile"), marginLeft: "0.5rem", background: "none", border: "none" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: isDark ? "#44403c" : "#e7e5e4", border: `2px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <UserIcon size={14} color={iconColor} />
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Me</span>
                <ChevronDown size={14} style={{ marginLeft: "2px", transform: isProfileMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </div>
            </button>

            {/* ================= PROFILE DROPDOWN ================= */}
            {isProfileMenuOpen && (
              <div style={{ position: "absolute", top: "120%", right: 0, width: "272px", backgroundColor: isDark ? "#292524" : "#ffffff", border: `1px solid ${borderColor}`, borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "column", animation: "fadeIn 0.2s", fontFamily: "Inter, sans-serif" }}>
                <div style={{ padding: "16px 16px 12px 16px", borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: isDark ? "#44403c" : "#e7e5e4", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <UserIcon size={32} color={mutedText} />
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, paddingTop: "2px" }}>
                      <span style={{ fontWeight: 600, fontSize: "1rem", color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "1.2" }}>{userName}</span>
                      <span style={{ fontSize: "0.85rem", color: textColor, marginTop: "4px", lineHeight: "1.3" }}>{userHeadline}</span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "block", width: "100%", textAlign: "center", padding: "6px 0", borderRadius: "24px", border: `1px solid ${accentColor}`, color: accentColor, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", transition: "background-color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.05)")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    View Profile
                  </Link>
                </div>

                <div style={{ padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: "0 16px 8px 16px", fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Account</h4>
                  <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "block", padding: "6px 16px", color: mutedText, fontSize: "0.85rem", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Settings & Privacy
                  </Link>
                </div>

                <div style={{ padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: "0 16px 8px 16px", fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Manage</h4>
                  <div onClick={handleComingSoon} style={{ display: "block", padding: "6px 16px", color: mutedText, fontSize: "0.85rem", textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Posts & Activity
                  </div>
                </div>

                <div style={{ padding: "8px 0" }}>
                  <button onClick={handleLogout} style={{ width: "100%", display: "block", background: "none", border: "none", cursor: "pointer", color: mutedText, fontSize: "0.85rem", padding: "6px 16px", textAlign: "left", transition: "color 0.2s" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {isMobile && isMobileMenuOpen && (
        <div style={{ position: "absolute", top: "64px", left: 0, right: 0, backgroundColor: isDark ? "#1c1917" : "#ffffff", borderBottom: `1px solid ${borderColor}`, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
          {/* Mobile Menu Content */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", paddingBottom: "16px", borderBottom: `1px solid ${borderColor}` }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: isDark ? "#44403c" : "#e7e5e4", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {profileImageUrl ? <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserIcon size={28} color={mutedText} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, paddingTop: "2px", flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: "1rem", color: textColor, lineHeight: 1.2 }}>{userName}</span>
              <span style={{ fontSize: "0.85rem", color: textColor, marginTop: "4px", lineHeight: 1.3 }}>{userHeadline}</span>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "block", width: "100%", textAlign: "center", padding: "6px 0", borderRadius: "24px", border: `1px solid ${accentColor}`, color: accentColor, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", marginTop: "12px" }}>View Profile</Link>
            </div>
          </div>

          <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} style={{ ...getNavItemStyle("/home"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem", gap: "12px" }}>
            <Home size={20} /><span>Home</span>
          </Link>
          
          <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} style={{ ...getNavItemStyle("/messages"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem", gap: "12px" }}>
            <MessageSquare size={20} /><span>Messages</span>
          </Link>
          
          <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ ...getNavItemStyle("/notifications"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem", gap: "12px" }}>
            <Bell size={20} /><span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
          </button>

          {isNotificationOpen && (
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: "8px", overflow: "hidden", marginTop: "0.5rem" }}>
              <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} onCountUpdate={setUnreadCount} isMobile={true} />
            </div>
          )}

          <div style={{ borderTop: `1px solid ${borderColor}`, margin: "0.5rem 0" }} />

          <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Account</h4>
          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} style={{ color: mutedText, fontSize: "0.9rem", textDecoration: "none" }}>
            Settings & Privacy
          </Link>

          <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: textColor, fontSize: "0.9rem", fontWeight: "500", padding: 0 }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              <span>Theme</span>
            </button>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: mutedText, fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", padding: 0 }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;