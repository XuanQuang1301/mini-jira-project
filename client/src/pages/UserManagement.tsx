import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Lock, Unlock, Shield, AlertCircle, CheckCircle2, UserCheck, UserX } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleLock = async (userId: number, userName: string, isLocked: boolean) => {
        const action = isLocked ? 'mở khóa' : 'khóa';
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${userName}"?`)) return;

        setLoadingId(userId);
        try {
            const res = await api.put(`/api/users/${userId}/lock`, {});
            const newLockedState: boolean = res.data.locked;
            setUsers(users.map(u => u.id === userId ? { ...u, locked: newLockedState } : u));
            alert(res.data.message);
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Lỗi khi thay đổi trạng thái tài khoản!');
        } finally {
            setLoadingId(null);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600 text-xs font-semibold gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Đang tải danh sách người dùng...</span>
            </div>
        );
    }

    const lockedCount = users.filter(u => u.locked).length;

    return (
        <div className="h-full flex flex-col space-y-6 pb-12 animate-fade-in font-sans antialiased">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý người dùng</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Danh sách tài khoản nhân sự và phân quyền hệ thống</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Tổng số: {users.length} tài khoản</span>
                </div>
            </div>

            {/* User Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                                <th className="p-4 font-bold">Thành viên</th>
                                <th className="p-4 font-bold">Vai trò</th>
                                <th className="p-4 font-bold text-center">Trạng thái</th>
                                <th className="p-4 font-bold text-center">Ngày tham gia</th>
                                <th className="p-4 font-bold text-right">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white text-xs">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors group ${user.locked ? 'bg-slate-50/50 opacity-70' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden shrink-0 ${user.locked ? 'bg-slate-400' : 'bg-blue-600'}`}>
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name ? user.name.substring(0, 2) : 'U'
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{user.name || 'Chưa đặt tên'}</p>
                                                <p className="text-[11px] text-slate-400 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                            user.role === 'ADMIN'
                                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-200'
                                        }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="p-4 text-center">
                                        {user.locked ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-200">
                                                <Lock className="w-3 h-3" />
                                                Đã khóa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Hoạt động
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4 text-center text-slate-500 font-medium text-xs">
                                        {user.createAt ? new Date(user.createAt).toLocaleDateString('vi-VN') : "15/04/2026"}
                                    </td>

                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleToggleLock(user.id, user.name, user.locked)}
                                            disabled={loadingId === user.id}
                                            title={user.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
                                                user.locked
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200'
                                            }`}
                                        >
                                            {loadingId === user.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : user.locked ? (
                                                <>
                                                    <Unlock className="w-3.5 h-3.5" />
                                                    <span>Mở khóa</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-3.5 h-3.5" />
                                                    <span>Khóa TK</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer bar */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
                    <div>Hiển thị tổng số {users.length} tài khoản trong hệ thống</div>
                    {lockedCount > 0 && (
                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            <span>{lockedCount} tài khoản bị khóa</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
