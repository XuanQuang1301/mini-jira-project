import { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import axios from "axios";
export default function Login(){
    const navigate = useNavigate(); //Chuyển trang sau khi đăng nhập thành công 
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    }); 
    const [error, setError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> )=> {
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
            const response =  await axios.post('http://localhost:5000/api/users/login', formData);
            const token = response.data.token; 
            localStorage.setItem('token', token); 
            console.log('Đăng nhập thành công! Token:', token); 
            navigate('/'); 
        }
        catch(err: any){
            console.error('Lỗi đăng nhập:', err); 
            if(err.response && err.response.data && err.response.data.message){
                setError(err.response.data.message); 
            }else{ 
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại!!!'); 
            }
        }finally{
            setIsLoading(false); 
        }
    }; 
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900"> 
            <div className="bg-gray-800 p-8 router-xl shadow-2xl w-full max-w-md border-gray-700 "> 
                <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">Đăng nhập</h2>
                {error &&(
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-center"> 
                        {error}
                    </div> 
                )}
                <form onSubmit={handleSubmit} className="space-y-5"> 
                    <div> 
                        <label className="block text-gray-400 mb-1 text-sm">Email</label>
                        <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="admin@gmail.com"
                        /> 
                    </div>
                    <div> 
                        <label className="block text-gray-400 mb-1 text-sm">Mật khẩu</label>
                        <input 
                        type ="password"
                        name = "password"
                        value = {formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="*****"
                        /> 
                    </div>
                    <button
                    type = "submit"
                    className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition duration-200 mt-4 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    > 
                        {isLoading ? 'Đang xử lí...' : 'Đăng nhập'}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-400 text-sm"> 
                    Chưa có tài khoản?{''}
                    <Link to="/register" className="text-blue-400 hover:underline"> Đăng ký ngay</Link>
                    
                </p>
            </div>
        </div>
    ); 
}