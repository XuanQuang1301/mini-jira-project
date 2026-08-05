import { useState, useEffect } from 'react';
import api from '../services/api';
import ChangeAvatarModal from '../components/profile/ChangeAvatarModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import { User, Mail, MapPin, Phone, Building, Shield, Key, Edit3, Camera, CheckCircle2, Save, X } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/users/profile');
            setUser(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUserProfile(); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/api/users/profile', user);
            alert('Cập nhật thông tin hồ sơ thành công!');
            if (user.name) localStorage.setItem('userName', user.name);
            if (user.avatarUrl) localStorage.setItem('avatar', user.avatarUrl);
            window.location.reload();
            setIsEditing(false); 
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu thông tin!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchUserProfile();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600 text-xs font-semibold gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Đang tải thông tin cá nhân...</span>
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-rose-500 font-bold text-xs">Không tìm thấy thông tin người dùng!</div>;
    }

    const inputClass = `w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all ${
        isEditing 
        ? 'border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 shadow-2xs' 
        : 'border border-transparent bg-slate-50 text-slate-700 font-medium cursor-default pointer-events-none'
    }`;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in font-sans antialiased">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-extrabold text-2xl text-blue-600 uppercase">
                                    {user.name?.substring(0, 1) || 'U'}
                                </span>
                            )}
                        </div>
                        {isEditing && (
                            <button 
                                onClick={() => setShowAvatarModal(true)}
                                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-200 hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Đổi ảnh đại diện"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name || 'Người dùng'}</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                            <Shield className="w-3 h-3" />
                            {user.role || 'Member'}
                        </span>
                    </div>
                </div>

                <div>
                    {!isEditing ? (
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs flex items-center gap-2 active:scale-95"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-3.5 rounded-xl text-xs transition"
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Form Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Thông tin tài khoản</h3>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ và tên</label>
                            <input 
                                name="name" 
                                value={user.name || ''} 
                                onChange={handleChange}
                                className={inputClass}
                                readOnly={!isEditing}
                                placeholder="Nhập họ và tên..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email (Không thể thay đổi)</label>
                            <div className="relative">
                                <input 
                                    value={user.email || ''} 
                                    className="w-full border border-transparent rounded-xl px-3.5 py-2.5 bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed outline-none"
                                    readOnly
                                />
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
                            <input 
                                name="phoneNumber" 
                                value={user.phoneNumber || ''} 
                                onChange={handleChange}
                                className={inputClass}
                                readOnly={!isEditing}
                                placeholder={isEditing ? "Nhập số điện thoại..." : "Chưa cập nhật"}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Địa chỉ liên hệ</label>
                            <input 
                                name="address" 
                                value={user.address || ''} 
                                onChange={handleChange}
                                className={inputClass}
                                readOnly={!isEditing}
                                placeholder={isEditing ? "Nhập địa chỉ..." : "Chưa cập nhật"}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Thành phố</label>
                            {isEditing ? (
                                <select 
                                    name="city"
                                    value={user.city || ''}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white focus:border-blue-500"
                                >
                                    <option value="">-- Chọn thành phố --</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                </select>
                            ) : (
                                <input value={user.city || 'Chưa cập nhật'} className={inputClass} readOnly />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Khu vực / Miền</label>
                            {isEditing ? (
                                <select 
                                    name="state"
                                    value={user.state || ''}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white focus:border-blue-500"
                                >
                                    <option value="">-- Chọn vùng --</option>
                                    <option value="Miền Bắc">Miền Bắc</option>
                                    <option value="Miền Trung">Miền Trung</option>
                                    <option value="Miền Nam">Miền Nam</option>
                                </select>
                            ) : (
                                <input value={user.state || 'Chưa cập nhật'} className={inputClass} readOnly />
                            )}
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
                        <div className="flex gap-3 items-center">
                            <input 
                                type="password"
                                value="********"
                                className="w-full border border-transparent rounded-xl px-3.5 py-2.5 bg-slate-100 text-slate-500 text-xs font-medium outline-none cursor-not-allowed"
                                readOnly
                            />
                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="shrink-0 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                                >
                                    <Key className="w-3.5 h-3.5" />
                                    <span>Đổi mật khẩu</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {showAvatarModal && (
                <ChangeAvatarModal 
                    currentAvatar={user.avatarUrl} 
                    onClose={() => setShowAvatarModal(false)} 
                    onUpdate={(newUrl: string) => {
                        setUser({ ...user, avatarUrl: newUrl });
                        localStorage.setItem("avatar", newUrl);
                        window.location.reload();
                    }} 
                />
            )}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </div>
    );
}
