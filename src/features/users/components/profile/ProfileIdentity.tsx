import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Calendar, Edit3, Globe, Plus, X, Share2, Link as LinkIcon, MessageSquare } from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { FaXTwitter, FaLinkedinIn, FaFacebookF, FaWhatsapp, FaRedditAlien } from "react-icons/fa6";
import { SiLeetcode, SiCodeforces, SiGeeksforgeeks } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { ChatAPI } from "@/features/chat/api/chat.api";
import { toast } from "react-toastify";

import type { User } from "@/types/api.types";
import { useTheme } from "@/app/providers/ThemeProvider";

interface ProfileIdentityProps {
  profileUser: User;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onToggleFollow: (e: React.MouseEvent) => void;
  onOpenEditModal: () => void;
}

const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ profileUser, isOwnProfile, isFollowing, onToggleFollow, onOpenEditModal }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [isBioModalOpen, setIsBioModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  
  const accentColor = "#F97316"; 
  const primaryAction = "#F97316"; 

  const socials = [
    { name: "Website", url: profileUser.website, icon: Globe, color: isDark ? "#818cf8" : "#4f46e5" },
    { name: "GitHub", url: profileUser.github, icon: FaGithub, color: isDark ? "#ffffff" : "#181717" },
    { name: "Twitter", url: profileUser.twitter, icon: FaTwitter, color: "#1DA1F2" },
    { name: "LinkedIn", url: profileUser.linkedin, icon: FaLinkedin, color: "#0A66C2" },
    { name: "Instagram", url: profileUser.instagram, icon: FaInstagram, color: "#E1306C" },
    { name: "YouTube", url: profileUser.youtube, icon: FaYoutube, color: "#FF0000" },
    { name: "Facebook", url: profileUser.facebook, icon: FaFacebook, color: "#1877F2" },
    { name: "LeetCode", url: profileUser.leetcode, icon: SiLeetcode, color: "#FFA116" },
    { name: "Codeforces", url: profileUser.codeforces, icon: SiCodeforces, color: "#1F8ACB" },
    { name: "GeeksforGeeks", url: profileUser.geeksforgeeks, icon: SiGeeksforgeeks, color: "#2F8D46" },
  ].filter(s => s.url && s.url.trim() !== "");

  const MAX_BIO_LENGTH = 180;
  const bioText = profileUser.bio || "";
  const isBioLong = bioText.length > MAX_BIO_LENGTH;
  const shortBio = isBioLong ? bioText.slice(0, MAX_BIO_LENGTH) : bioText;

  const shareUrl = `${window.location.origin}/profile/${profileUser.username}`;
  const encodedTitle = encodeURIComponent(`Check out ${profileUser.fullname}'s profile on Writespace`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleShareSubmit = async (platform: string, url: string) => {
    setIsShareModalOpen(false);
    try {
      if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
      } else {
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
      }
    } catch (error) {
      console.error("Failed to share", error);
    }
  };

  const handleMessageClick = async () => {
    try {
      const { id } = await ChatAPI.startConversation(profileUser.id);
      navigate(`/messages?id=${id}`);
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* MAIN IDENTITY CARD */}
        <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, overflow: "hidden", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.05)" }}>
          
          <div 
            style={{ 
              height: "120px", 
              backgroundColor: isDark ? "#334155" : "#e2e8f0", // <-- Original Grey Colors
              backgroundImage: profileUser.bannerImageUrl ? `url(${profileUser.bannerImageUrl})` : "none", 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }} 
          />
          
          <div style={{ padding: "0 20px 20px 20px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-45px", marginBottom: "16px" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", border: `4px solid ${cardBg}`, backgroundColor: "#cbd5e1", overflow: "hidden", flexShrink: 0 }}>
                <img src={profileUser.profileImageUrl || `https://ui-avatars.com/api/?name=${profileUser.username}`} alt={profileUser.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  title="Share Profile"
                >
                  <Share2 size={14} />
                </button>

                {isOwnProfile ? (
                  <button 
                    onClick={onOpenEditModal} 
                    style={{ padding: "6px 14px", borderRadius: "20px", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor, fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "background 0.2s" }} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={handleMessageClick} 
                      style={{ padding: "6px 16px", borderRadius: "20px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor }}
                    >
                      <MessageSquare size={14} /> Message
                    </button>

                    <button 
                      onClick={onToggleFollow} 
                      style={{ padding: "6px 16px", borderRadius: "20px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", backgroundColor: isFollowing ? "transparent" : primaryAction, border: isFollowing ? `1px solid ${borderColor}` : "none", color: isFollowing ? textColor : "#ffffff" }}
                    >
                      {isFollowing ? "Following" : <><Plus size={14} /> Follow</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h1 style={{ margin: "0 0 2px 0", fontSize: "1.3rem", fontWeight: 800, color: textColor }}>{profileUser.fullname}</h1>
            <span style={{ fontSize: "0.9rem", color: mutedText }}>@{profileUser.username}</span>
            
            {profileUser.headline && (
              <p style={{ margin: "12px 0 0 0", fontSize: "0.95rem", color: textColor, lineHeight: "1.5" }}>{profileUser.headline}</p>
            )}

            {/* Location & Joined Date */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px", fontSize: "0.85rem", color: mutedText }}>
              {profileUser.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {profileUser.location}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={16} /> Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Recently"}
              </div>
            </div>

            {/* ================= SOCIAL LINKS ================= */}
            {socials.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
                {socials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                        border: `1px solid ${borderColor}`,
                        color: textColor,
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "#F97316"; 
                        e.currentTarget.style.color = "#F97316"; 
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = borderColor;
                        e.currentTarget.style.color = textColor;
                      }}
                    >
                      <Icon size={14} color={social.color} />
                      {social.name}
                    </a>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ABOUT SECTION */}
        {profileUser.bio && (
          <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor }}>About</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", color: textColor, whiteSpace: "pre-wrap" }}>
              {isBioLong ? shortBio : bioText}
              {isBioLong && (
                <span 
                  onClick={() => setIsBioModalOpen(true)}
                  style={{ color: accentColor, fontWeight: 600, cursor: "pointer", marginLeft: "4px" }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  ...more
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* FULL BIO MODAL */}
      {isBioModalOpen && createPortal(
        <div 
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "20px" }}
          onClick={() => setIsBioModalOpen(false)}
        >
          <div 
            style={{ backgroundColor: cardBg, borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: `1px solid ${borderColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${borderColor}` }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: textColor, fontWeight: 700 }}>About {profileUser.fullname}</h2>
              <button onClick={() => setIsBioModalOpen(false)} style={{ background: "transparent", border: "none", color: mutedText, cursor: "pointer", display: "flex", padding: "4px" }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", fontSize: "0.95rem", lineHeight: "1.7", color: textColor, whiteSpace: "pre-wrap" }}>
              {bioText}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SHARE MODAL */}
      {isShareModalOpen && createPortal(
        <div onClick={() => setIsShareModalOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: cardBg, borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: textColor, fontSize: "1.2rem", fontWeight: 700 }}>Share Profile</h3>
              <button onClick={() => setIsShareModalOpen(false)} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", padding: "4px" }}><X size={20}/></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px", justifyContent: "items-center" }}>
              <button onClick={() => handleShareSubmit("twitter", `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: isDark ? "#ffffff" : "#000000", color: isDark ? "#000000" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}><FaXTwitter size={24} /></div>
                <span style={{ fontSize: "0.75rem", color: textColor, fontWeight: 500 }}>X (Twitter)</span>
              </button>
              
              <button onClick={() => handleShareSubmit("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#0A66C2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}><FaLinkedinIn size={24} /></div>
                <span style={{ fontSize: "0.75rem", color: textColor, fontWeight: 500 }}>LinkedIn</span>
              </button>

              <button onClick={() => handleShareSubmit("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#1877F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}><FaFacebookF size={24} /></div>
                <span style={{ fontSize: "0.75rem", color: textColor, fontWeight: 500 }}>Facebook</span>
              </button>

              <button onClick={() => handleShareSubmit("whatsapp", `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#25D366", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}><FaWhatsapp size={24} /></div>
                <span style={{ fontSize: "0.75rem", color: textColor, fontWeight: 500 }}>WhatsApp</span>
              </button>

              <button onClick={() => handleShareSubmit("reddit", `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#FF4500", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}><FaRedditAlien size={24} /></div>
                <span style={{ fontSize: "0.75rem", color: textColor, fontWeight: 500 }}>Reddit</span>
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: "20px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: mutedText, fontWeight: 600 }}>Or copy link</p>
              <div style={{ display: "flex", alignItems: "center", backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9", borderRadius: "8px", border: `1px solid ${borderColor}`, padding: "4px 4px 4px 12px" }}>
                <LinkIcon size={16} color={mutedText} style={{ flexShrink: 0 }} />
                <input type="text" readOnly value={shareUrl} style={{ flex: 1, background: "transparent", border: "none", color: textColor, outline: "none", padding: "8px", fontSize: "0.85rem", textOverflow: "ellipsis" }} />
                <button onClick={() => handleShareSubmit("copy", shareUrl)} style={{ backgroundColor: primaryAction, color: "white", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", flexShrink: 0 }}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProfileIdentity;