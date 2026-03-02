import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {Outlet, Link, useNavigate} from 'react-router-dom'; 
interface UserPayload{
    id: string; 
    email: string; 
    role?: string
}
export default function Layout (){
    const navigate = useNavigate(); 
    const [user, setUser] = useState<UserPayload | null> (null); 
    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if(!token){
            navigate('/login')
        }else{
            try{
                const decoded = jwtDecode<UserPayload> (token); 
                console.log("Cục token của tôi chứa:", decoded); 
                setUser(decoded); 
            }catch (error){
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

    const  getLinkClass = (path: string)=> {
        if(location.pathname === path){
            return "block py-3 px-4 rounded-lg bg-gray-800 text-blue-400 font-semibold border border-gray-700 transition"; 
        }
        return "block py-3 px-4 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
    }
    return (
        <div className="flex h-screen bg-[#0f172a] text-white"> 
            {/* Cột Sidebar bên trái  */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-col shadow-xl"> 
                <div className="p-6 border-b border-gray-800"> 
                    <h2 className="text-3xl front-black text-blue-500   tracking-wider">MINI JIRA</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to = "/" className={getLinkClass("/")}>
                        Bảng điều khiển 
                    </Link>
                    <Link to = "/projects" className={getLinkClass("/projects")}>
                        Quản lý dự án 
                    </Link>
                    <Link to = "/tasks" className={getLinkClass("/tasks")}>
                        Công việc của tôi   
                    </Link>

                    {user?.email === 'quangxuan1301@gmail.com' && 
                        (<Link to = "/users" 
                        className={getLinkClass("/users")}
                        > 
                            Danh sách người dùng
                        </Link>
                    )}
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