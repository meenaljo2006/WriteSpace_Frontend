import React from "react";
import { Activity, Users, Eye, Heart, Tag, type LucideIcon } from "lucide-react";
import type { User } from "@/types/api.types";

interface ProfileAnalyticsProps {
  profileUser: User;
  followerCount: number;
}

interface StatRowProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  isLast?: boolean;
}

// Stat Row 
const StatRow: React.FC<StatRowProps> = ({ icon: Icon, value, label, isLast = false }) => (
  <div 
    className={`flex justify-between items-center p-4 transition-colors ${
      isLast ? "" : "border-b border-black/5 dark:border-white/10"
    }`}
  >
    <div className="flex items-center gap-3 text-[#0B192C]/60 dark:text-gray-400">
      <Icon size={18} className="text-orange-500" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
    <span className="text-base font-bold text-[#0B192C] dark:text-white">
      {value}
    </span>
  </div>
);

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ profileUser, followerCount }) => {
  return (
    <div className="flex flex-col gap-4">
      
      {/* Activity Overview Card */}
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2">
          <Activity size={18} className="text-orange-500" />
          <h3 className="text-base font-bold text-[#0B192C] dark:text-white font-sans m-0">
            Activity Overview
          </h3>
        </div>
        
        {/* Stats List */}
        <div className="flex flex-col">
          <StatRow icon={Users} value={followerCount} label="Followers" />
          <StatRow icon={Users} value={profileUser.totalFollowing || 0} label="Following" />
          <StatRow icon={Eye} value={profileUser.totalReads || 0} label="Total Views" />
          <StatRow icon={Heart} value={"--"} label="Total Likes" isLast={true} />
        </div>
      </div>

      {/* Top Tags Card */}
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2">
          <Tag size={18} className="text-orange-500" />
          <h3 className="text-base font-bold text-[#0B192C] dark:text-white font-sans m-0">
            Top Tags
          </h3>
        </div>
        
        {/* Tags List */}
        <div className="p-4 flex flex-wrap gap-2">
          {["react", "typescript", "frontend"].map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProfileAnalytics;