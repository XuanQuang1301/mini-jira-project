import { useState } from "react";
import {Link} from 'react-router-dom'
export default function Login(){
    const [formData, setFormData] = useState({
        email: '', 
        password: ''
    }); 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> )=> {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value
        }); 
    }; 
    const handleSubmit = (e: React.FormEvent) => {
        console.log('Dữ liệu đăng nhập tạm thời:', formData); 
    }
    return (
        <div className="min-h-screen flex items-center justtify-center bg-gray-900"> 
            <div className="bg-gray-800 p-8 router-xl shadow-2xl w-full max-w-md border-gray-700 "> 
                <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">Đăng nhập</h2>
                <form> 
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
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition duration-200 mt-4"
                    > 
                        Đăng nhập 
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