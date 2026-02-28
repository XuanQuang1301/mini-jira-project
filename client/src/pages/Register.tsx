import {useState} from 'react'; 
import axios from 'axios'
import { Link } from 'react-router-dom';
export default function Resister(){
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: ''
    }); 
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) =>{
        setFormData ({
            ...formData, 
            [e.target.name]: e.target.value
        }); 
    }; 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setMessage(''); 
        try{
            const response = await axios.post('http://localhost:5000/api/users/register', formData); 
            setIsError(false); 
            setMessage('Đăng kí thành công! Bạn có thể đăng nhập ngay')
            console.log('Dữ liệu trả về:', response.data); 
        }
        catch(error: any) {
            setIsError(true); 
            setMessage(error.response?.data?.error || 'Có lỗi xảy ra khi đăng ký'); 
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">Tạo Tài Khoản</h2>
        
        {message && (
          <div className={`p-3 rounded mb-4 text-sm text-center ${isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Họ và Tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên của bạn"
            />
          </div>

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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-black font-semibold rounded transition duration-200 mt-4"
          >
            Đăng Ký
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
       Đã có tài khoản?{' '}
       <Link to="/login" className="text-blue-400 hover:underline">
         Đăng nhập
       </Link>
     </p>
      </div>
    </div>
    )
}