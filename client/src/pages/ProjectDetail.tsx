import { useState, useEffect } from 'react'; 
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';

interface Project {
    id: number; 
    name: string; 
    description: string; 
    key: string; 
}

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    progress: number;
    assigneeId: number | null;
}

export default function ProjectDetail() {
    const { id } = useParams(); 
    const [project, setProject] = useState<Project | null>(null); 
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const fetchProjectAndTasks = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [projectRes, tasksRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/projects/${id}`, config),
                    axios.get(`http://localhost:5000/api/tasks/project/${id}`, config)
                ]);
                
                setProject(projectRes.data); 
                setTasks(tasksRes.data); 
            } catch(error) {
                console.error("Lỗi khi tải dữ liệu:", error); 
            } finally {
                setIsLoading(false); 
            }
        }
        fetchProjectAndTasks(); 
    }, [id]); 

    if (isLoading) return <div className="text-blue-400 p-8 text-xl font-semibold">Đang tải dữ liệu dự án... ⏳</div>;
    if (!project) return <div className="text-red-500 p-8 text-xl font-semibold">Không tìm thấy dự án! 🚨</div>;

    // Hàm tô màu cho Trạng thái
    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'TODO': return 'bg-gray-700 text-gray-300';
            case 'IN_PROGRESS': return 'bg-blue-900/50 text-blue-400 border border-blue-700/50';
            case 'DONE': return 'bg-green-900/50 text-green-400 border border-green-700/50';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    // Hàm tô màu cho Mức độ ưu tiên
    const getPriorityStyle = (priority: string) => {
        switch(priority) {
            case 'LOW': return 'text-gray-400';
            case 'MEDIUM': return 'text-blue-400';
            case 'HIGH': return 'text-orange-400 font-bold';
            case 'URGENT': return 'text-red-500 font-bold';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="flex flex-col h-full"> 
            {/* --- PHẦN HEADER DỰ ÁN --- */}
            <div className="flex items-start gap-6 mb-8 border-b border-gray-800 pb-6">
                <Link 
                    to="/projects" 
                    className="mt-1 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white w-10 h-10 rounded-lg transition"
                    title="Quay lại danh sách"
                >
                    &larr;
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
                        {project.name}
                        <span className="text-sm font-bold bg-blue-900/50 text-blue-400 px-3 py-1 rounded-md border border-blue-700/50">
                            {project.key}
                        </span>
                    </h1>
                    <p className="text-gray-400 text-sm max-w-3xl">{project.description}</p>
                </div>
            </div>

            {/* --- PHẦN DANH SÁCH TASK (DẠNG BẢNG) --- */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Danh sách công việc</h2>
                        <p className="text-gray-400 text-sm mt-1">Tổng quan tiến độ các Task trong dự án</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-lg text-sm flex items-center gap-2">
                        <span className="text-lg leading-none">+</span> Thêm Task mới
                    </button>
                </div>

                {/* BẢNG DỮ LIỆU */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/80 border-b border-gray-700 text-gray-400 text-sm">
                                <th className="p-4 font-semibold w-1/3">Tên công việc</th>
                                <th className="p-4 font-semibold">Trạng thái</th>
                                <th className="p-4 font-semibold">Ưu tiên</th>
                                <th className="p-4 font-semibold w-1/4">Tiến độ</th>
                                <th className="p-4 font-semibold text-center">Người nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                        Chưa có công việc nào trong dự án này. Hãy tạo task mới nhé!
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                        {/* Tên Task */}
                                        <td className="p-4">
                                            <p className="text-white font-medium">{task.title}</p>
                                        </td>
                                        
                                        {/* Trạng thái */}
                                        <td className="p-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusStyle(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        
                                        {/* Ưu tiên */}
                                        <td className="p-4">
                                            <span className={`text-sm ${getPriorityStyle(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        
                                        {/* Tiến độ (Progress Bar) */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                                        style={{ width: `${task.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-400 w-8">{task.progress}%</span>
                                            </div>
                                        </td>
                                        
                                        {/* Người nhận */}
                                        <td className="p-4 text-center text-gray-400">
                                            {task.assigneeId ? `User #${task.assigneeId}` : "Chưa giao"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}