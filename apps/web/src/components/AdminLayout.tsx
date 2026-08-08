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
  ChevronRight
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
    if (!token) { navigate("/login"); return; }
    try {
      const decoded = jwtDecode<UserPayload>(token);
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard, desc: "Thống kê hệ thống" },
    { path: "/admin/projects", label: "Quản lý dự án", icon: FolderKanban, desc: "Toàn bộ projects" },
    { path: "/admin/users", label: "Người dùng", icon: Users, desc: "Tài khoản & phân quyền" },
    { path: "/admin/system", label: "Cấu hình", icon: Settings, desc: "Thiết lập hệ thống" },
  ];

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const displayInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-[240px] flex flex-col shrink-0 z-20" style={{background: 'linear-gradient(160deg, #0f2847 0%, #1a3a64 100%)'}}>

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)'}}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-tight">Admin Portal</h2>
              <p className="text-[10px] font-medium mt-0.5" style={{color: 'rgba(148,163,184,0.8)'}}>Mini Jira System</p>
            </div>
          </div>
        </div>

        {/* User pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{background: 'rgba(255,255,255,0.07)'}}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
              style={{background: 'linear-gradient(135deg, #3b82f6, #6366f1)'}}>
              {displayInitials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{displayName}</p>
              <p className="text-[9px] font-semibold" style={{color: '#6366f1'}}>Quản trị viên</p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{color: 'rgba(148,163,184,0.5)'}}>
            Quản trị & Giám sát
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/admin/dashboard" && location.pathname === "/admin");

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))',
                  borderLeft: '3px solid #6366f1',
                } : {
                  borderLeft: '3px solid transparent',
                }}
              >
                {/* Icon bg */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive ? 'bg-indigo-500/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.label}
                  </p>
                </div>

                {isActive && (
                  <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
          {/* Status */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)'}}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-slate-300">System Active</span>
            </div>
            <span className="text-[10px] font-mono" style={{color: 'rgba(148,163,184,0.5)'}}>v1.0.4</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all group"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: 'rgba(252,165,165,0.8)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.18)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(252,165,165,0.8)';
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
