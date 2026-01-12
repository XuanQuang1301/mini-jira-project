import React, { useState } from 'react';
import { login } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      alert("Đăng nhập thành công!");
      navigate('/dashboard'); 
    } catch (error) {
      alert("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Mini-Jira Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" required
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Mật khẩu" required
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;