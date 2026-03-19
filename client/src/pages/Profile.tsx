import { useState } from 'react'; 

export default function Profile() {
    const [name, setName] = useState('Xuân Quang'); 
    const [email, setEmail] = useState('quangxuan1301@gmail.com'); 
    const [isSaving, setIsSaving] = useState(false); 

    // Logic kiểm tra chức vụ: Nếu gõ đúng email này thì là Admin, khác thì là User
    const userRole = email === 'quangxuan1301@gmail.com' ? 'Quản trị viên (Admin)' : 'Thành viên (User)';

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault(); // Đã thêm () để chặn load lại trang
        setIsSaving(true); 
        
        // Giả lập thời gian gọi API lưu dữ liệu
        setTimeout(() => {
            alert("Đã cập nhật thông tin thành công!"); 
            setIsSaving(false); 
        }, 1000); 
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Hồ sơ cá nhân</h1>
                <p className="text-gray-500 text-sm">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
            </div>
            
            {/* Vỏ ngoài của Form (Light Mode) */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                
                {/* Phần Header của Form */}
                <div className="p-8 border-b border-gray-100 flex items-center gap-6 bg-gray-50/50">
                    {/* Avatar đổi sang tone sáng giống thanh Topbar */}
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-black shadow-inner uppercase">
                        {email ? email.charAt(0) : 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{name || 'Chưa có tên'}</h2>
                        <p className="text-gray-500 mt-1">{email || 'Chưa có email'}</p>
                        <button className="mt-4 text-sm bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-300 font-medium transition shadow-sm">
                            Đổi ảnh đại diện
                        </button>
                    </div>
                </div>

                {/* Phần Form nhập liệu */}
                <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nhập Họ Tên */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
                            />
                        </div>

                        {/* Nhập Email (Đã cho phép chỉnh sửa) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ Email</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Đổi email sẽ thay đổi tài khoản đăng nhập của bạn.
                            </p>
                        </div>

                        {/* Chức vụ (Tự động thay đổi, không cho sửa tay) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Chức vụ / Vai trò</label>
                            <input 
                                type="text" 
                                value={userRole}
                                disabled
                                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-medium cursor-not-allowed"
                            />
                            <p className="text-xs text-blue-600 mt-2 font-medium">
                                * Quyền quản trị viên chỉ cấp tự động cho email quangxuan1301@gmail.com
                            </p>
                        </div>
                    </div>

                    {/* Khu vực nút bấm */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" className="px-6 py-3 rounded-xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition">
                            Khôi phục
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}