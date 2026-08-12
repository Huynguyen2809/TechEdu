import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../services/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const res = await axiosClient.get("/auth/me");
      setUser(res);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const loginSuccess = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      setUser(null);
      // BUG-05: Dùng navigate() thay window.location.href để giữ SPA navigation
      window.__navigateToLogin?.();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginSuccess, logout, checkAuthStatus }}
    >
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-4">
            {/* SMELL-04: Spinner rõ ràng thay vì chỉ text pulse */}
            <div className="w-12 h-12 border-[3px] border-indigo-200 dark:border-indigo-900/60 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Đang kiểm tra quyền truy cập...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Helper component đăng ký navigate function vào window (BUG-05)
export function NavigateRegistrar() {
  const nav = useNavigate();
  useEffect(() => {
    window.__navigateToLogin = () => nav("/login", { replace: true });
    return () => { window.__navigateToLogin = null; };
  }, [nav]);
  return null;
}

export const useAuth = () => useContext(AuthContext);
