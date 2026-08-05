import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FolderKanban, 
    CheckSquare, 
    CalendarRange, 
    Users, 
    LogOut, 
    User,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";

interface UserPayload {
    id: string; 
    email: string; 
    role?: string;
}

export default function Layout() {
    const navigate = useNavigate(); 
    const location = useLocation(); 
    const [user, setUser] = useState<UserPayload | null>(null); 

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if(!token){
            navigate('/login');
        } else {
            try {
                const decoded = jwtDecode<UserPayload>(token); 
                setUser(decoded); 
            } catch (error) {
                console.error("Token bị lỗi hoặc hết hạn", error); 
                localStorage.removeItem('token'); 
                navigate('/login'); 
            }
        }
    }, [navigate]); 

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login'); 
    };

    const navItems = [
        { path: "/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
        { path: "/projects", label: "Quản lý dự án", icon: FolderKanban },
        { path: "/tasks", label: "Công việc của tôi", icon: CheckSquare },
        { path: "/timeline", label: "Dòng thời gian", icon: CalendarRange },
    ];

    const isAdmin = user?.email === 'quangxuan13012005@gmail.com' || user?.email === 'quangxuan1301@gmail.com';

    return (
        <div className="flex h-screen bg-slate-50/70 text-slate-800 overflow-hidden font-sans antialiased"> 
            
            {/* --- SIDEBAR BÊN TRÁI --- */}
            <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col z-20 shrink-0 shadow-sm"> 
                {/* Brand Header */}
                <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3"> 
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-lg tracking-wider">
                        MJ
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">MINI JIRA</h2>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">Không gian làm việc</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu chính</p>
                    
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-blue-50/80 text-blue-600 font-semibold shadow-xs"
                                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                                }`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                <span>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Info & Logout */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50"> 
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 py-2 rounded-lg transition-colors text-xs font-semibold shadow-2xs"
                    > 
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* --- KHU VỰC BÊN PHẢI --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* TOPBAR HEADER */}
                <header className="bg-white border-b border-slate-200/80 h-16 flex items-center justify-between px-8 shrink-0 z-10 shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Đang hoạt động
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {user?.email ? user.email.split('@')[0] : 'Đang tải...'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {isAdmin ? 'Quản trị viên' : 'Thành viên'}
                            </p>
                        </div>
                        
                        <Link 
                            to="/profile" 
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-blue-600 font-bold hover:border-blue-300 transition-colors shadow-2xs uppercase text-xs"
                            title="Hồ sơ cá nhân"
                        >
                            <User className="w-4 h-4 text-slate-600" />
                        </Link>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative custom-scrollbar bg-slate-50/50"> 
                    <Outlet /> 
                </main>
            </div>

        </div>
    );
}
