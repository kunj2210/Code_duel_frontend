import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);


  const login = (userData: User) => {
    setUser(userData);

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      // Allow mock login in development if backend is not found
      if (error.message === "Network Error") {
        console.warn("Backend not found. Using mock login for UI preview.");
        const mockUser: User = {
          id: 'mock-id',
          name: emailOrUsername.split('@')[0],
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
          leetcodeUsername: emailOrUsername.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Login failed";
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
      const response = await authApi.register(
        email,
        username,
        password,
        leetcodeUsername
      );

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Map backend user to frontend User type
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
    } catch (error: any) {
      // Allow mock registration in development if backend is not found
      if (error.message === "Network Error") {
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Registration failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }

  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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