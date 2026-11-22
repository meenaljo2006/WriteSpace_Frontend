import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import ProfileSidebar from "@/features/users/components/profile/ProfileSidebar";
import TrendingSidebar from "@/features/posts/components/TrendingSidebar";
import ProfileAnalytics from "@/features/users/components/profile/ProfileAnalytics"; 
import { useAuth } from "@/app/providers/AuthProvider";

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation(); // Location hook
  const isProfilePage = location.pathname.includes("/profile"); // Profile page check

  // Sidebar data state 
  const [sidebarData, setSidebarData] = useState<any>(null);

  // Auth check
  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FFFBF5] dark:bg-[#0B192C]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative h-screen bg-[#FFFBF5] dark:bg-[#0B192C] font-sans overflow-hidden transition-colors duration-300">
      
      {/* Background Waves */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full dark:hidden" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M0,150 C400,250 800,50 1440,200 L1440,0 L0,0 Z" fill="#FED7AA" fillOpacity="0.5"/>
          <path d="M0,400 C500,600 900,200 1440,500 L1440,0 L0,0 Z" fill="#FDBA74" fillOpacity="0.3"/>
        </svg>
        <svg className="absolute w-full h-full hidden dark:block" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M0,150 C400,250 800,50 1440,200 L1440,0 L0,0 Z" fill="#4C1D95" fillOpacity="0.15" style={{ filter: "blur(40px)" }} />
          <path d="M0,400 C500,600 900,200 1440,500 L1440,0 L0,0 Z" fill="#EA580C" fillOpacity="0.08" style={{ filter: "blur(50px)" }} />
          <path d="M-100,800 C300,500 800,900 1500,600 L1500,1000 L-100,1000 Z" fill="#1E1B4B" fillOpacity="0.4" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <Header />
        
        <main className="flex-1 max-w-[1400px] w-full mx-auto flex gap-6 px-10 pt-20 h-[calc(100vh-64px)] overflow-hidden">
          
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0 h-full overflow-y-auto pb-6 scrollbar-hide">
            <ProfileSidebar />
          </aside>

          {/* CENTER FEED */}
          <div className="flex-1 max-w-4xl mx-auto w-full h-full overflow-y-auto pb-10 scrollbar-hide bg-white/40 dark:bg-black/20 backdrop-blur-xl border-x border-white/50 dark:border-white/5 px-4 pt-4 rounded-3xl">
            <Outlet context={setSidebarData} /> 
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block w-72 flex-shrink-0 h-full overflow-y-auto pb-6 scrollbar-hide">
            {isProfilePage ? (
              sidebarData ? (
                <ProfileAnalytics 
                  profileUser={sidebarData.profile} 
                  followerCount={sidebarData.followerCount} 
                />
              ) : (
                <div className="p-4 text-center text-sm text-stone-500 animate-pulse">Loading stats...</div>
              )
            ) : (
              <TrendingSidebar />
            )}
          </aside>
          
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;