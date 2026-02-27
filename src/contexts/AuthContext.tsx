import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  leetcodeUsername?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, leetcodeUsername: string) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(emailOrUsername, password);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        const mappedUser: User = {
          id: userData.id,
          name: userData.username,
          email: userData.email,
          leetcodeUsername: userData.leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      // Allow mock login in development if backend is not found
      const err = error as { message?: string };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock login for UI preview.");
        const mockUser: User = {
          id: 'mock-id',
          name: emailOrUsername.split('@')[0] || emailOrUsername,
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
          leetcodeUsername: emailOrUsername.split('@')[0] || emailOrUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      const errMsg = error as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = errMsg.response?.data?.message || errMsg.response?.data?.error || (error as Error).message || "Login failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, username, password, leetcodeUsername);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        const mappedUser: User = {
          id: userData.id,
          name: userData.username,
          email: userData.email,
          leetcodeUsername: userData.leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: unknown) {
      // Allow mock registration in development if backend is not found
      const err = error as { message?: string };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock registration for UI preview.");
        const mockUser: User = {
          id: 'mock-id',
          name: username,
          email: email,
          leetcodeUsername: leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      const errMsg = error as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = errMsg.response?.data?.message || errMsg.response?.data?.error || (error as Error).message || "Registration failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
