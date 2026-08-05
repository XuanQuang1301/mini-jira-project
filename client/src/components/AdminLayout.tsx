import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { 
  Shield, 
  Users, 
  LayoutDashboard, 
  FolderKanban,
  Settings, 
  LogOut, 
  Server
} from "lucide-react";

interface UserPayload {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode<UserPayload>(token);
      setUser(decoded);
    } catch (error) {
      console.error("Token error:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Tổng quan Admin", icon: LayoutDashboard },
    { path: "/admin/projects", label: "Quản lý dự án", icon: FolderKanban },
    { path: "/admin/users", label: "Quản lý người dùng", icon: Users },
    { path: "/admin/system", label: "Cấu hình hệ thống", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* SIDEBAR ADMIN (NỀN TRẮNG SANG TRỌNG) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col z-20 shrink-0 shadow-sm">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md shadow-slate-900/10">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-widest uppercase">
              ADMIN PORTAL
            </h2>
            <p className="text-[10px] font-semibold text-slate-400">Mini Jira System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Quản trị & Giám sát
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/admin/dashboard" && location.pathname === "/admin");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white font-extrabold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Status & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/80 text-[11px] shadow-2xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.4</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 py-2.5 rounded-xl transition-all text-xs font-bold shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/60">
        {/* Top Admin Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <Server className="w-4 h-4 text-slate-900" />
            <span>Trang Quản Trị Hệ Thống Mini Jira</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                AD
              </div>
              <span>{user?.email || "Admin User"}</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
