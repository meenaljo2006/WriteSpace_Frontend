import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@/types/api.types";
import { UsersAPI } from "@/features/users/api/users.api";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/features/auth/api/auth.api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  loginState: (user: User, accessToken: string) => void;
  logoutState: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem("userData");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  
  // SWR: Only block UI if we have a token but NO cached data
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const logoutState = useCallback(async () => {
    try {
      await AuthAPI.logout(); // Destroy session on Redis backend
    } catch (error) {
      console.error("Backend logout failed, proceeding locally", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
      localStorage.removeItem("feedCache");
      setAccessToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleForceLogout = () => {
      setAccessToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:force-logout", handleForceLogout);
    return () => window.removeEventListener("auth:force-logout", handleForceLogout);
  }, [navigate]);

  const loginState = useCallback((newUser: User, newAccessToken: string) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("userData", JSON.stringify(newUser));
    setAccessToken(newAccessToken);
    setUser(newUser);
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);

    try {
      let currentToken = localStorage.getItem("accessToken");

      // No access token? Try to recover the session using
      // the HttpOnly refresh-token cookie.
      if (!currentToken) {
        try {
          const refreshed = await AuthAPI.refreshToken();

          currentToken = refreshed.accessToken;

          localStorage.setItem("accessToken", currentToken);
          setAccessToken(currentToken);
        } catch {
          // No valid refresh session. User is simply logged out.
          setAccessToken(null);
          setUser(null);

          localStorage.removeItem("accessToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("user");

          return;
        }
      }

      // We now have an access token, so fetch the latest user.
      const freshUserData = await UsersAPI.getMe();

      setUser(freshUserData);
      setAccessToken(currentToken);

      localStorage.setItem("accessToken", currentToken);
      localStorage.setItem("userData", JSON.stringify(freshUserData));
    } catch (error) {
      console.error("Session restoration failed.", error);

      setAccessToken(null);
      setUser(null);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Socket Connection Logic
  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);
    } else {
      disconnectSocket();
    }
    
    return () => {
      // Disconnect when AuthProvider unmounts
      disconnectSocket();
    };
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoadingAuth,
      loginState,
      logoutState,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};