import { useState } from 'react';
import api from '../../services/api';
import { X, Lock, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ onClose }: any) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không khớp!");
            return;
        }
        if (newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        setIsSaving(true);
        try {
            await api.put('/api/users/profile/password', { oldPassword, newPassword });
            
            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại trong lần tới.");
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Lỗi khi đổi mật khẩu!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200/80 animate-fade-in">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Lock className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Đổi mật khẩu</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Mật khẩu hiện tại</label>
                        <input 
                            type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50/30 focus:bg-white"
                            placeholder="Nhập mật khẩu cũ..."
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Mật khẩu mới</label>
                        <input 
                            type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50/30 focus:bg-white"
                            placeholder="Nhập mật khẩu mới..."
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Xác nhận mật khẩu mới</label>
                        <input 
                            type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50/30 focus:bg-white"
                            placeholder="Nhập lại mật khẩu mới..."
                        />
                    </div>

                    <div className="flex justify-end gap-2.5 mt-8 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-xs text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                            Hủy bỏ
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium text-xs shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95">
                            {isSaving ? 'Đang xử lý...' : 'Lưu mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
