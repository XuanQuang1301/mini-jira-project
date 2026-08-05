import { useState } from "react";
import { Link } from 'react-router-dom';
import api from "../services/api";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    }); 
    const [error, setError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value
        }); 
        if(error) setError(''); 
    }; 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setIsLoading(true);
        setError('');
        try{
            const response = await api.post('/api/auth/signin', formData);
            const token = response.data.token; 
            localStorage.setItem('token', token); 
            if (response.data.user?.id) {
                localStorage.setItem('userId', String(response.data.user.id));
            }
            if (response.data.user?.name) {
                localStorage.setItem('userName', response.data.user.name);
            }
            window.location.href = '/dashboard';
        }
        catch(err: any){
            console.error('Lỗi đăng nhập:', err);
            if (err.response && err.response.status === 403) {
                setError(err.response.data || 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!');
            } else if(err.response && err.response.data && err.response.data.message){
                setError(err.response.data.message);
            } else {
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
            }
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
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Đăng nhập Mini Jira</h2>
                    <p className="text-xs text-slate-500 mt-1">Chào mừng bạn quay trở lại làm việc</p>
                </div>
                
                {error && (
                    <div className="bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2.5"> 
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div> 
                )}

                <form onSubmit={handleSubmit} className="space-y-4"> 
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
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
                            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">Quên mật khẩu?</a>
                        </div>
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
                        className={`w-full py-2.5 px-4 text-white font-semibold rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'}`}
                    > 
                        <span>{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
                
                <p className="mt-8 text-center text-slate-500 text-xs border-t border-slate-100 pt-6"> 
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    ); 
}
