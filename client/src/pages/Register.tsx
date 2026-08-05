import { useState } from 'react'; 
import api from '../services/api';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: ''
    }); 
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value
        }); 
    }; 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setMessage(''); 
        setIsLoading(true);
        try {
            const response = await api.post('/api/users/register', formData); 
            setIsError(false); 
            setMessage('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
            console.log('Dữ liệu trả về:', response.data); 
        } catch(error: any) {
            setIsError(true); 
            setMessage(error.response?.data?.error || 'Có lỗi xảy ra khi đăng ký!'); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/80 p-4 font-sans antialiased">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200/80 animate-fade-in">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25 mb-3 tracking-wider">
                        MJ
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tạo tài khoản mới</h2>
                    <p className="text-xs text-slate-500 mt-1">Bắt đầu trải nghiệm quản lý công việc với Mini Jira</p>
                </div>

                {message && (
                    <div className={`p-3.5 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2.5 border ${
                        isError ? 'bg-rose-50 text-rose-600 border-rose-200/60' : 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                    }`}>
                        {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 text-slate-900 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 text-slate-900 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                placeholder="nhapemail@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 text-slate-900 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 px-4 text-white font-semibold rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 mt-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'}`}
                    >
                        <span>{isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}</span>
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
                
                <p className="mt-8 text-center text-slate-500 text-xs border-t border-slate-100 pt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
