import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xóa người dùng
    const handleDeleteUser = async (userId: number, userName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${userName}" khỏi hệ thống?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== userId));
            alert("Đã xóa thành viên thành công!");
        } catch (error) {
            alert("Lỗi khi xóa người dùng!");
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    if (isLoading) return <div className="p-10 text-gray-400 animate-pulse font-medium text-sm uppercase tracking-widest">Đang tải danh sách...</div>;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header Title Section - Giữ lại tiêu đề sạch sẽ */}
            <div className="px-8 pt-10 pb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
                <p className="text-sm text-gray-500 mt-1">Danh sách nhân sự và quản trị hệ thống.</p>
            </div>

            {/* Main Content Area */}
            <div className="px-8 flex-1">
                {/* Table Container - Tối giản, không còn Tabs */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="p-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-2/5">Thành viên</th>
                                <th className="p-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vai trò</th>
                                <th className="p-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Ngày tham gia</th>
                                <th className="p-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Quản lý</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar Circle */}
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-md group-hover:scale-105 transition-transform">
                                                {user.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 leading-none">{user.name}</p>
                                                <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                                            user.role === 'ADMIN' 
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center text-xs font-bold text-gray-400">
                                        {user.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            }) 
                                            : "Chưa cập nhật"}
                                    </td>
                                    <td className="p-5 text-right">
                                        {/* Nút xóa - Chỉ hiển thị rõ khi hover vào hàng */}
                                        <button 
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                            title="Xóa người dùng"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer thông tin */}
                <div className="py-6 flex justify-between items-center text-[12px] font-medium text-gray-400">
                    <div>Tổng số: <span className="text-gray-900 font-bold">{users.length}</span> thành viên hệ thống.</div>
                </div>
            </div>
        </div>
    );
}