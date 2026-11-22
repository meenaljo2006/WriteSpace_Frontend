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
  const bannerStyle: React.CSSProperties = {
    backgroundImage: displayUser?.bannerImageUrl 
      ? `url(${displayUser.bannerImageUrl})` 
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center"
  };

  return (
    <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl overflow-hidden transition-colors duration-300">
      
      {/* Banner */}
      <div 
        className="h-20 w-full bg-gradient-to-r from-orange-400 to-orange-300 dark:from-orange-700 dark:to-orange-900"
        style={bannerStyle}
      />
      
      <div className="px-4 pb-4 text-center -mt-8">
        {/* Avatar */}
        <Link to="/profile" className="inline-block no-underline group">
          <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-stone-200 dark:bg-stone-800 border-4 border-white dark:border-[#15233B] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105 shadow-sm">
            {displayUser?.profileImageUrl ? (
              <img src={displayUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-stone-400 dark:text-stone-500" />
            )}
          </div>
        </Link>
        
        {/* Name & Headline */}
        <Link to="/profile" className="no-underline text-inherit">
          <h2 className="text-lg font-bold text-[#0B192C] dark:text-white m-0 mb-1 hover:underline font-sans">
            {displayUser?.fullname || "User"}
          </h2>
        </Link>
        <p className="text-sm text-[#0B192C]/60 dark:text-gray-400 mb-4 leading-relaxed break-words line-clamp-2">
          {displayUser?.headline || displayUser?.bio || "Add a headline in your profile settings to stand out."}
        </p>
        
        {/* Stats */}
        <div className="border-t border-b border-black/5 dark:border-white/10 py-3 text-left flex flex-col gap-2">
          <Link to="/profile" className="flex justify-between text-sm text-[#0B192C]/60 dark:text-gray-400 hover:text-[#0B192C] dark:hover:text-white transition-colors no-underline">
            <span>Followers</span>
            <span className="font-semibold text-orange-500 flex items-center">
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : (displayUser?.totalFollowers || 0)}
            </span>
          </Link>
          <Link to="/profile" className="flex justify-between text-sm text-[#0B192C]/60 dark:text-gray-400 hover:text-[#0B192C] dark:hover:text-white transition-colors no-underline">
            <span>My Posts</span>
            <span className="font-semibold text-orange-500 flex items-center">
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : (displayUser?.totalPosts || 0)}
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="pt-3 flex flex-col gap-2.5 text-left">
          <Link to="/saved" className="flex items-center gap-2 text-sm text-[#0B192C]/60 dark:text-gray-400 hover:text-orange-500 transition-colors no-underline">
            <Bookmark size={16} />
            <span>Saved items</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-2 text-sm text-[#0B192C]/60 dark:text-gray-400 hover:text-orange-500 transition-colors no-underline">
            <Settings size={16} />
            <span>Profile Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;