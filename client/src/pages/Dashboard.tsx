import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error("Lỗi lấy dự án", err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dự án của tôi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Tạo dự án mới
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer">
            <div className="text-xs font-bold text-blue-600 mb-2">{p.key}</div>
            <h3 className="text-lg font-semibold text-slate-800">{p.name}</h3>
            <p className="text-sm text-slate-500 mt-2">Chủ sở hữu: Bạn</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;