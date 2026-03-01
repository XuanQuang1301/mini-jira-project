import { useEffect } from "react";
import {Outlet, Link, useNavigate} from 'react-router-dom'; 

export default function Layout (){
    const navigate = useNavigate(); 
    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if(!token){
            navigate('/login')
        }
    }, [navigate]); 
    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login'); 
    }
    return (
        <div className="flex h-screen bg-[#0f172a] text-white"> 
            {/* Cột Sidebar bên trái  */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-col shadow-xl"> 
                <div className="p-6 border-b border-gray-800"> 
                    <h2 className="text-3xl front-black text-blue-500   tracking-wider">MINI JIRA</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to = "/" className="block py-3 px-4 rounded-lg bg-gray-800 text-blue-400 font-semibold border border-gray-700 transition">
                        Bảng điều khiển 
                    </Link>
                    <Link to = "/projects" className="block py-3 px-4 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
                        Quản lý dự án 
                    </Link>
                    <Link to = "/tasks" className="block py-3 px-4 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
                        Công việc của tôi   
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-800"> 
                    <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded transition font-semibold border border-red-500/50"
                    > 
                        Đăng xuất 
                    </button>
                </div>
            </aside>
            {/* Khu vực nội dung chính bên phải  */}
            <main className="flex-1 overflow-y-auto p-8"> 
                <Outlet /> 
            </main>
        </div>
    );
}