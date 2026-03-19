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
    position: number;
    dueDate: string | null;
    assigneeId: number | null;
    reporterId: number;
}

export default function ProjectDetail() {
    const { id } = useParams(); 
    const [project, setProject] = useState<Project | null>(null); 
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [isLoading, setIsLoading] = useState(true);  
    
    // --- CÁC STATE DÀNH CHO FORM TẠO TASK ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    // Các trường dữ liệu của Task
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskPosition, setNewTaskPosition] = useState(0); 

    // Hàm lấy dữ liệu
    const fetchProjectAndTasks = async()=> {
        try {
            const token = localStorage.getItem('token'); 
            const config = {headers: {Authorization: `Bearer ${token}`}}; 
            const [projectRes, taskRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/projects/${id}`, config), 
                axios.get(`http://localhost:5000/api/tasks/project/${id}`, config)
            ]); 
            setProject(projectRes.data); 
            setTasks(taskRes.data); 
        } catch(error) {
            console.error("Lỗi khi tải chi tiết dự án", error); 
        } finally {
            setIsLoading(false); 
        }
    }

    useEffect(() => {
        fetchProjectAndTasks(); 
    }, [id]); 

    // Hàm tạo Task
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setIsCreating(true); 
        try {
            const token = localStorage.getItem('token'); 
            
            const payload = {
                projectId: Number(id),
                title: newTaskTitle,
                description: newTaskDesc || "Chưa có mô tả chi tiết",
                priority: newTaskPriority,
                status: 'TODO',
                position: Number(newTaskPosition) || 0,
                progress: 0,
                dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
                assigneeId: newTaskAssignee ? Number(newTaskAssignee) : null,
            };

            await axios.post('http://localhost:5000/api/tasks', payload, {
                headers: { Authorization: `Bearer ${token}` }
            }); 
            
            setIsModalOpen(false); 
            setNewTaskTitle(''); 
            setNewTaskDesc('');
            setNewTaskPriority('MEDIUM'); 
            setNewTaskDueDate('');
            setNewTaskAssignee('');
            setNewTaskPosition(0);
            
            fetchProjectAndTasks(); 
        } catch(error: any) {
            const errorMessage = error.response?.data?.error || error.message;
            alert("Không thể tạo Task: " + errorMessage); 
        } finally {
            setIsCreating(false); 
        }
    }

    // Hàm Xóa Task
    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này không? Hành động này không thể hoàn tác.")) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProjectAndTasks();
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message;
            alert("Không thể xóa công việc: " + errorMessage);
        }
    };

    if (isLoading) return <div className="text-blue-600 p-8 text-xl font-semibold">Đang tải dữ liệu dự án... ⏳</div>;
    if (!project) return <div className="text-red-500 p-8 text-xl font-semibold">Không tìm thấy dự án! 🚨</div>;

    // --- CẬP NHẬT MÀU SẮC LIGHT MODE CHO TRẠNG THÁI ---
    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'TODO': return 'bg-gray-100 text-gray-600 border border-gray-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border border-blue-200';
            case 'REVIEW': return 'bg-purple-50 text-purple-600 border border-purple-200';
            case 'DONE': return 'bg-green-50 text-green-600 border border-green-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // --- CẬP NHẬT MÀU SẮC LIGHT MODE CHO ƯU TIÊN ---
    const getPriorityStyle = (priority: string) => {
        switch(priority) {
            case 'LOW': return 'bg-gray-100 text-gray-600';
            case 'MEDIUM': return 'bg-blue-50 text-blue-600 font-medium';
            case 'HIGH': return 'bg-orange-50 text-orange-600 font-bold';
            case 'URGENT': return 'bg-red-50 text-red-600 font-bold border border-red-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="flex flex-col h-full"> 
            {/* --- PHẦN HEADER DỰ ÁN --- */}
            <div className="flex items-start gap-6 mb-8 border-b border-gray-200 pb-6">
                <Link 
                    to="/projects" 
                    className="mt-1 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-blue-600 w-10 h-10 rounded-xl transition shadow-sm"
                    title="Quay lại danh sách"
                >
                    &larr;
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
                        {project.name}
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-md border border-blue-200 uppercase tracking-wide">
                            {project.key}
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm max-w-3xl">{project.description}</p>
                </div>
            </div>

            {/* --- PHẦN DANH SÁCH TASK (DẠNG BẢNG) --- */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Danh sách công việc</h2>
                        <p className="text-gray-500 text-sm mt-1">Tổng quan tiến độ các Task trong dự án</p>
                    </div>
                    <button 
                        onClick={()=> setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm hover:shadow-md text-sm flex items-center gap-2">
                        <span className="text-lg leading-none">+</span> Thêm Task mới
                    </button>
                </div>

                {/* BẢNG DỮ LIỆU LIGHT MODE */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold w-1/3">Công việc & Mô tả</th>
                                <th className="p-4 font-bold text-center">Trạng thái</th>
                                <th className="p-4 font-bold text-center">Ưu tiên</th>
                                <th className="p-4 font-bold text-center">Thời hạn</th>
                                <th className="p-4 font-bold w-1/5">Tiến độ</th>
                                <th className="p-4 font-bold text-right">Nhân sự</th>
                                <th className="p-4 font-bold text-center">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                            <p className="font-medium">Chưa có công việc nào trong dự án này.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition group">
                                        {/* CỘT 1: TÊN TASK VÀ MÔ TẢ NGẮN */}
                                        <td className="p-4">
                                            <p className="text-gray-900 font-bold text-base group-hover:text-blue-600 transition-colors">
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-gray-500 text-xs mt-1 line-clamp-2" title={task.description}>
                                                    {task.description}
                                                </p>
                                            )}
                                        </td>
                                        
                                        {/* CỘT 2: TRẠNG THÁI */}
                                        <td className="p-4 text-center">
                                            <span className={`text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-full font-bold shadow-sm ${getStatusStyle(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        
                                        {/* CỘT 3: ƯU TIÊN */}
                                        <td className="p-4 text-center">
                                            <span className={`text-xs px-2.5 py-1 rounded-md ${getPriorityStyle(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>

                                        {/* CỘT 4: DEADLINE */}
                                        <td className="p-4 text-center">
                                            {task.dueDate ? (
                                                <span className="text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
                                                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Không có</span>
                                            )}
                                        </td>
                                        
                                        {/* CỘT 5: TIẾN ĐỘ */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${task.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 w-8">{task.progress}%</span>
                                            </div>
                                        </td>
                                        
                                        {/* CỘT 6: NHÂN SỰ */}
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="text-gray-700 font-medium">
                                                    <span className="text-gray-400 font-normal">Giao:</span> {task.assigneeId ? `User #${task.assigneeId}` : "Chưa giao"}
                                                </span>
                                                <span className="text-gray-400">
                                                    Tạo: User #{task.reporterId}
                                                </span>
                                            </div>
                                        </td>

                                        {/* CỘT 7: HÀNH ĐỘNG (XÓA) */}
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                title="Xóa công việc này"
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL TẠO TASK MỚI (LIGHT MODE) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Tạo công việc mới</h2>

                        <form onSubmit={handleCreateTask} className='space-y-6'>
                            
                            {/* Cột 1: Thông tin chính */}
                            <div className="space-y-5">
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1.5'>
                                        Tiêu đề công việc <span className='text-red-500'>*</span>
                                    </label>
                                    <input type="text" required
                                        value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder='VD: Thiết kế giao diện Dashboard...'
                                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition'
                                    />
                                </div>
                                
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1.5'>Mô tả chi tiết</label>
                                    <textarea rows={3}
                                        value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)}
                                        placeholder='Nhập nội dung cần làm...'
                                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition resize-none'
                                    />
                                </div>
                            </div>

                            {/* Cột 2: Các cài đặt (Không viền để nhìn thoáng hơn) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1.5'>Độ ưu tiên</label>
                                    <select 
                                        value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition cursor-pointer'
                                    >
                                        <option value="LOW">Thấp (Low)</option>
                                        <option value="MEDIUM">Trung bình (Medium)</option>
                                        <option value="HIGH">Cao (High)</option>
                                        <option value="URGENT">Khẩn cấp (Urgent)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1.5'>Deadline</label>
                                    <input type="date" 
                                        value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1.5'>ID Người nhận việc</label>
                                    <input type="number" placeholder="Bỏ trống nếu chưa giao" min={1}
                                        value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}
                                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1.5'>Vị trí (Position)</label>
                                    <input type="number" placeholder="Mặc định: 0" min={0}
                                        value={newTaskPosition} onChange={(e) => setNewTaskPosition(Number(e.target.value))}
                                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition'
                                    />
                                </div>
                            </div>

                            {/* Nút Submit */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isCreating} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? 'Đang lưu...' : 'Tạo Task ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}