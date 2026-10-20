import React, { useEffect, useState } from "react";
import { User, Bookmark, Settings, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { UsersAPI } from "@/features/users/api/users.api";
import type { User as UserType } from "@/types/api.types";

const ProfileSidebar: React.FC = () => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  const [userData, setUserData] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFreshUserData = async () => {
      try {
        setIsLoading(true);
        const data = await UsersAPI.getMe();
        if (isMounted) {
          setUserData(data);
        }
      } catch (error) {
        console.error("Failed to fetch fresh user data for sidebar", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFreshUserData();
    return () => { isMounted = false; };
  }, []);

  const displayUser = userData || authUser;

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const cardStyle: React.CSSProperties = {
    backgroundColor: cardBg,
    borderRadius: "12px",
    border: `1px solid ${borderColor}`,
    overflow: "hidden",
    color: textColor,
    boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
    transition: "background-color 0.3s, border-color 0.3s"
  };

  const statRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: mutedText,
    textDecoration: "none",
    padding: "4px 0"
  };

  const statValueStyle: React.CSSProperties = {
    color: accentColor,
    fontWeight: "600",
    display: "flex",
    alignItems: "center"
  };

  const linkRowStyle: React.CSSProperties = {
    display: "flex", 
    alignItems: "center", 
    gap: "8px", 
    fontSize: "0.85rem", 
    cursor: "pointer", 
    color: mutedText,
    textDecoration: "none"
  };

  const bannerStyle: React.CSSProperties = {
    height: "70px",
    backgroundColor: accentColor,
    backgroundImage: displayUser?.bannerImageUrl 
      ? `url(${displayUser.bannerImageUrl})` 
      : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center"
  };

  return (
    <div style={cardStyle}>
      <div style={bannerStyle} />
      
      <div style={{ padding: "0 1rem 1rem 1rem", textAlign: "center", marginTop: "-30px" }}>
        <Link to="/profile" style={{ display: "inline-block", textDecoration: "none" }}>
          <div style={{ 
            width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 10px auto",
            backgroundColor: isDark ? "#334155" : "#e2e8f0", 
            border: `3px solid ${cardBg}`, display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            transition: "transform 0.2s ease-in-out"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {displayUser?.profileImageUrl ? (
              <img src={displayUser.profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={32} color={mutedText} />
            )}
          </div>
        </Link>
        
        <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
          >
            {displayUser?.fullname || "User"}
          </h2>
        </Link>
        <p style={{ fontSize: "0.85rem", color: mutedText, margin: "0 0 16px 0", lineHeight: "1.4", wordBreak: "break-word" }}>
          {displayUser?.headline || displayUser?.bio || "Add a headline in your profile settings to stand out."}
        </p>
        
        <div style={{ 
          borderTop: `1px solid ${borderColor}`, paddingTop: "12px", 
          borderBottom: `1px solid ${borderColor}`, paddingBottom: "12px", 
          textAlign: "left", display: "flex", flexDirection: "column", gap: "8px"
        }}>
          <Link to="/profile" style={statRowStyle} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <span>Followers</span>
            <span style={statValueStyle}>
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : (displayUser?.totalFollowers || 0)}
            </span>
          </Link>
          <Link to="/profile" style={statRowStyle} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <span>My Posts</span>
            <span style={statValueStyle}>
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : (displayUser?.totalPosts || 0)}
            </span>
          </Link>
        </div>

        <div style={{ paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
          
          <Link to="/saved" style={linkRowStyle} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <Bookmark size={16} />
            <span>Saved items</span>
          </Link>
          <Link to="/settings" style={linkRowStyle} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <Settings size={16} />
            <span>Profile Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;