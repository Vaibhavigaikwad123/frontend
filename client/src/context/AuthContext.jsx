import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../utils/api";
import { useToast } from "./ToastContext";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { addToast } = useToast();

  // Load user on app start if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const userData = await authAPI.getMe();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    setIsAuthenticating(true);
    try {
      const data = await authAPI.login(email, password);

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = () => {
    // Open Google OAuth in popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authAPI.getGoogleAuthUrl(),
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth callback
    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token } = event.data;

        try {
          setIsAuthenticating(true);

          // Store token
          localStorage.setItem("token", token);

          // Fetch user data
          const userData = await authAPI.getMe();
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);

          addToast('Successfully logged in with Google!', 'success');
          popup?.close();
        } catch (error) {
          addToast('Failed to complete Google login', 'error');
        } finally {
          setIsAuthenticating(false);
        }
      }
    });
  };

  // Register new user
  const register = async (userData) => {
    setIsAuthenticating(true);
    try {
      const data = await authAPI.register(userData);

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    addToast('Logged out successfully', 'success');
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
    isAuthenticating,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
