import { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cơ bản để Typescript không báo lỗi
interface Project {
    id: number;
}

interface Task {
    id: number;
    status: string;
    dueDate: string | null;
}

export default function Dashboard() {
    // Các State để lưu trữ con số thống kê
    const [totalProjects, setTotalProjects] = useState(0);
    const [inProgressTasks, setInProgressTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Gọi 2 API cùng lúc
                const [projectsRes, tasksRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/projects', config),
                    axios.get('http://localhost:5000/api/tasks/my-tasks', config) 
                ]);

                const projects: Project[] = projectsRes.data;
                const myTasks: Task[] = tasksRes.data;

                // 1. Tính tổng số dự án
                setTotalProjects(projects.length);

                // 2. Tính số Task ĐANG LÀM
                const inProgress = myTasks.filter(task => task.status === 'IN_PROGRESS').length;
                setInProgressTasks(inProgress);

                // 3. Tính số Task TRỄ HẠN 
                const now = new Date();
                const overdue = myTasks.filter(task => {
                    if (task.status === 'DONE' || !task.dueDate) return false;
                    const deadline = new Date(task.dueDate);
                    return deadline < now;
                }).length;
                setOverdueTasks(overdue);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="text-blue-600 p-8 text-xl font-semibold">Đang tổng hợp dữ liệu... ⏳</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Bảng điều khiển</h1>
                <p className="text-gray-500 mt-1">Tổng quan về các dự án và nhiệm vụ của bạn</p>
            </div>
            
            {/* 3 Thẻ thống kê (Card) - Layout mới chuẩn Light Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Card Dự án */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 font-medium mb-2 text-sm">Tổng dự án</h3>
                            <p className="text-4xl font-bold text-gray-800">{totalProjects}</p>
                        </div>
                        {/* Hộp icon màu xanh */}
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Card Đang làm */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 font-medium mb-2 text-sm">Đang thực hiện</h3>
                            <p className="text-4xl font-bold text-gray-800">{inProgressTasks}</p>
                        </div>
                        {/* Hộp icon màu cam */}
                        <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Card Trễ hạn */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 font-medium mb-2 text-sm">Quá hạn</h3>
                            <p className="text-4xl font-bold text-gray-800">{overdueTasks}</p>
                        </div>
                        {/* Hộp icon màu đỏ */}
                        <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vùng trống làm Biểu đồ */}
            <div className="flex-1 bg-white rounded-2xl border-2 border-gray-100 border-dashed flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-gray-400 font-medium">Khu vực thống kê biểu đồ (Đang phát triển...)</p>
            </div>
        </div>
    );
}