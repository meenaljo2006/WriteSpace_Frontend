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
        {/* --- Unified Public Auth Routes --- */}
        <Route 
          path="/login" 
          element={<PublicRoute><AuthPage initialMode="login" /></PublicRoute>} 
        />
        
        {/* Directly render AuthPage in register mode instead of redirecting */}
        <Route 
          path="/register" 
          element={<PublicRoute><AuthPage initialMode="register" /></PublicRoute>} 
        />
        
        {/* Password Recovery Routes */}
        <Route 
          path="/forgot-password" 
          element={<PublicRoute><AuthPage initialMode="forgot" /></PublicRoute>} 
        />
        <Route 
          path="/auth/reset-password" 
          element={<PublicRoute><AuthPage initialMode="reset" /></PublicRoute>} 
        />
        
        {/* OAuth Callback (Must remain outside PublicRoute/ProtectedLayout wrappers) */}
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
          <Route path="/messages" element={<div className="p-8 text-gray-900 dark:text-white">Messages</div>} />
          <Route path="/notifications" element={<div className="p-8 text-gray-900 dark:text-white">Notifications</div>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/home" replace />} />
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