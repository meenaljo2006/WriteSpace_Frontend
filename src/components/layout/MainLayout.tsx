import React from 'react';
import Header from './Header'; 
import ProfileSidebar from "@/features/users/components/profile/ProfileSidebar";
import TrendingSidebar from "@/features/posts/components/TrendingSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative h-screen bg-[#FFFBF5] dark:bg-[#0B192C] font-sans overflow-hidden transition-colors duration-300">

      <div className="relative z-10 flex flex-col h-full">
        <Header />
        {/* Main scroll area */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto flex gap-6 px-4 pt-6 h-[calc(100vh-64px)] overflow-hidden">
          
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0 h-full overflow-y-auto pb-6 scrollbar-hide">
            <ProfileSidebar />
          </aside>

          {/* CENTER FEED */}
          <div className="flex-1 max-w-2xl mx-auto w-full h-full overflow-y-auto pb-10 scrollbar-hide">
            {children}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block w-72 flex-shrink-0 h-full overflow-y-auto pb-6 scrollbar-hide">
            <TrendingSidebar />
          </aside>
          
        </main>
      </div>
    </div>
  );
};

export default MainLayout;