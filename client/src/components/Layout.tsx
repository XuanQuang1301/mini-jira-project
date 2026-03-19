import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; 

interface UserPayload {
    id: string; 
    email: string; 
    role?: string
}

export default function Layout () {
    const navigate = useNavigate(); 
    const location = useLocation(); 
    const [user, setUser] = useState<UserPayload | null> (null); 

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if(!token){
            navigate('/login')
        } else {
            try {
                const decoded = jwtDecode<UserPayload> (token); 
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
    }

    const getLinkClass = (path: string)=> {
        if(location.pathname === path){
            // Nút đang chọn: Nền xanh nhạt, chữ xanh đậm giống ảnh
            return "block py-3 px-4 rounded-xl bg-blue-50 text-blue-600 font-bold transition"; 
        }
        // Nút bình thường: Chữ xám, khi di chuột vào nền xám nhạt
        return "block py-3 px-4 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition"
    }

    return (
        // Nền tổng thể đổi thành màu xám cực nhạt (slate-50) để làm nổi bật các Card màu trắng
        <div className="flex h-screen bg-slate-50 text-gray-800 overflow-hidden font-sans"> 
            
            {/* --- CỘT SIDEBAR BÊN TRÁI (Nền trắng tinh) --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shrink-0"> 
                <div className="p-6 border-b border-gray-100 flex items-center gap-3"> 
                    {/* Logo màu xanh đậm */}
                    <h2 className="text-2xl font-extrabold text-blue-600 tracking-tight">MINI JIRA</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-2">
                    <Link to="/" className={getLinkClass("/")}>
                        Bảng điều khiển 
                    </Link>
                    <Link to="/projects" className={getLinkClass("/projects")}>
                        Quản lý dự án 
                    </Link>
                    <Link to="/tasks" className={getLinkClass("/tasks")}>
                        Công việc của tôi   
                    </Link>

                    {user?.email === 'quangxuan1301@gmail.com' && 
                        (<Link to="/users" className={getLinkClass("/users")}> 
                            Danh sách người dùng
                        </Link>
                    )}
                </nav>
                <div className="p-6 border-t border-gray-100"> 
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl transition font-semibold"
                    > 
                        Đăng xuất 
                    </button>
                </div>
            </aside>

            {/* --- KHU VỰC BÊN PHẢI --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* 1. THANH NGANG (TOPBAR) Nền trắng */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0 z-10">
                    <div>
                        {/* Có thể để thanh tìm kiếm ở đây sau này */}
                        <span className="text-gray-500 text-sm font-medium">Hệ thống quản lý công việc</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 leading-none">
                                {user?.email ? user.email.split('@')[0] : 'Đang tải...'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                {user?.email === 'quangxuan1301@gmail.com' ? 'Quản trị viên' : 'Thành viên'}
                            </p>
                        </div>
                        
                        {/* Avatar giống ảnh mẫu: Nền xanh nhạt, chữ xanh đậm */}
                        <Link 
                            to="/profile" 
                            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold hover:scale-105 transition-transform cursor-pointer uppercase"
                            title="Hồ sơ cá nhân"
                        >
                            {user?.email ? user.email.charAt(0) : 'U'}
                        </Link>
                    </div>
                </header>

                {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
                <main className="flex-1 overflow-y-auto p-8 relative"> 
                    <Outlet /> 
                </main>
            </div>

        </div>
    );
}