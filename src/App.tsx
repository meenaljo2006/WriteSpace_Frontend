import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Auth & Layout Components
import AuthPage from "./pages/auth/AuthPage";
import OAuthSuccess from "./pages/auth/OAuthSuccess";
import Profile from "@/features/users/components/profile/Profile";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import HomePage from "./pages/home/HomePage";
import PostDetailPage from "./pages/home/PostDetailPage";
import SettingsPage from "./pages/settings/SettingsPage";
import PublicProfileLayout from "./components/layout/PublicProfileLayout";
import SearchPage from "./pages/search/SearchPage";
import SavedPostsPage from "./pages/saved/SavedPostsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import MessagesPage from "./pages/messages/MessagesPage";

// --- NAYE LANDING PAGE IMPORTS ---
import PublicLayout from "./features/landing/layout/PublicLayout";
import Landing from "./features/landing/pages/Landing"; // apne path ke hisaab se check kar lena
import Features from "./features/landing/pages/Features";
import Community from "./features/landing/pages/Community";
// --------------------------------

// Context & Providers
import { ThemeProvider, useTheme } from "@/app/providers/ThemeProvider";
import { AuthProvider, useAuth } from "@/app/providers/AuthProvider";

// Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Route Protectors ---

interface RouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  
  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Loader2 size={40} className="animate-spin text-[#6366f1]" />
      </div>
    );
  }
  
  // Agar user pehle se login hai, to use landing page ya login page se hata kar /home bhej do
  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>;
};

// --- Main Router Content ---

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <ToastContainer 
        position="top-center" 
        autoClose={2000} 
        theme={theme === "dark" ? "dark" : "light"} 
      />
      
      <Routes>
        {/* --- NAYA: PUBLIC LANDING PAGES (Navbar + Footer ke sath) --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
          <Route path="/community" element={<PublicRoute><Community /></PublicRoute>} />
        </Route>

        {/* --- Unified Public Auth Routes --- */}
        <Route 
          path="/login" 
          element={<PublicRoute><AuthPage initialMode="login" /></PublicRoute>} 
        />
        
        <Route 
          path="/register" 
          element={<PublicRoute><AuthPage initialMode="register" /></PublicRoute>} 
        />
        
        <Route 
          path="/forgot-password" 
          element={<PublicRoute><AuthPage initialMode="forgot" /></PublicRoute>} 
        />
        <Route 
          path="/auth/reset-password" 
          element={<PublicRoute><AuthPage initialMode="reset" /></PublicRoute>} 
        />
        
        <Route path="/auth/success" element={<OAuthSuccess />} />

        {/* --- Completely Protected App Area --- */}
        <Route path="/profile/:username" element={<PublicProfileLayout />}>
          <Route index element={<Profile />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Fallback Route: Ab random URL pe /home nahi, balki Landing page (/) pe bhejenge */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

// --- App Entry Point ---

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;