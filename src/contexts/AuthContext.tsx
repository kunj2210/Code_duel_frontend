import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

/**
 * Map backend API user response to frontend User type
 */
const mapApiUserToUser = (userData: any): User => {
  return {
    id: userData.id,
    name: userData.username,
    email: userData.email,
    leetcodeUsername: userData.leetcodeUsername,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth token from localStorage on mount, then fetch and validate user profile from backend
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");


      if (token) {
        try {

          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');

          // Call backend to validate token and fetch fresh user data
          const response = await authApi.getProfile();

          if (response.success && response.data) {
            const mappedUser = mapApiUserToUser(response.data);

            // Update localStorage with fresh user data
            localStorage.setItem("user", JSON.stringify(mappedUser));
            setUser(mappedUser);
          } else {
            // Profile fetch unsuccessful, clear auth
            console.warn("Profile fetch unsuccessful:", response.message);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
          }
        } catch (error: any) {
          const status = (error as any)?.response?.status;

          if (status === 401 || status === 403) {
            // Token validation failed (expired, revoked, or invalid)
            console.error(
              "Token validation failed during session restore:",
              error?.message || error
            );

            // Clear auth data on explicit auth failure
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
          } else {
            // Non-auth or network error: keep existing auth, try to restore from localStorage
            console.warn(
              "Non-auth error during session restore; preserving stored auth:",
              error?.message || error
            );
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              try {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
              } catch (parseError) {
                console.error(
                  "Failed to parse stored user during session restore:",
                  parseError
                );
                localStorage.removeItem("user");
              }
            }
          }

        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;


        const mappedUser: User = {
          id: userData.id,
          name: userData.username,
          email: userData.email,
          leetcodeUsername: userData.leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        };

        const mappedUser = mapApiUserToUser(userData);


        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setUser(mappedUser);

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }

    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };

    } catch (error: unknown) {
      // Allow mock login in development if backend is not found
      const err = error as { message?: string };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock login for UI preview.");
        const mockUser: User = {
          id: 'mock-id',
          name: email.split('@')[0] || email,
          email: email.includes('@') ? email : `${email}@example.com`,
          leetcodeUsername: email.split('@')[0] || email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
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

  const register = async (username: string, email: string, password: string, leetcodeUsername: string) => {
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

        const mappedUser = mapApiUserToUser(userData);


        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setUser(mappedUser);

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }

    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };

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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};