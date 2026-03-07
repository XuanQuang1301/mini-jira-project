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

    // Hàm lấy dữ liệu đưa ra ngoài sử dụng (tái sử dụng khi tạo/xóa task)
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

    // Tự động chạy khi mới vào trang
    useEffect(() => {
        fetchProjectAndTasks(); 
    }, [id]); 

    // Hàm xử lý khi bấm nút tạo công việc 
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setIsCreating(true); 
        try {
            const token = localStorage.getItem('token'); 
            
            // Đóng gói data siêu đầy đủ
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
            
            // Thành công: Reset toàn bộ form về như mới
            setIsModalOpen(false); 
            setNewTaskTitle(''); 
            setNewTaskDesc('');
            setNewTaskPriority('MEDIUM'); 
            setNewTaskDueDate('');
            setNewTaskAssignee('');
            setNewTaskPosition(0);
            
            fetchProjectAndTasks(); // Load lại bảng
        } catch(error: any) {
            const errorMessage = error.response?.data?.error || error.message;
            console.error("Lỗi 400 chi tiết:", errorMessage); 
            alert("Không thể tạo Task: " + errorMessage); 
        } finally {
            setIsCreating(false); 
        }
    }
    // Hàm xử lý Xóa Task
    const handleDeleteTask = async (taskId: number) => {
        // Hiện bảng hỏi xác nhận trước khi xóa 
        if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này không? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Xóa thành công thì load lại bảng
            fetchProjectAndTasks();
        } catch (error: any) {
            console.error("Lỗi khi xóa task:", error);
            const errorMessage = error.response?.data?.error || error.message;
            alert("Không thể xóa công việc: " + errorMessage);
        }
    };
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
                    <button 
                        onClick={()=> setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-lg text-sm flex items-center gap-2">
                        <span className="text-lg leading-none">+</span> Thêm Task mới
                    </button>
                </div>

                {/* BẢNG DỮ LIỆU ĐƯỢC NÂNG CẤP */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/80 border-b border-gray-700 text-gray-400 text-sm">
                                <th className="p-4 font-semibold w-1/3">Công việc & Mô tả</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-center">Ưu tiên</th>
                                <th className="p-4 font-semibold text-center">Thời hạn (Deadline)</th>
                                <th className="p-4 font-semibold w-1/5">Tiến độ</th>
                                <th className="p-4 font-semibold text-right">Nhân sự</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                        Chưa có công việc nào trong dự án này. Hãy tạo task mới nhé!
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition group">
                                        {/* CỘT 1: TÊN TASK VÀ MÔ TẢ NGẮN */}
                                        <td className="p-4">
                                            <p className="text-white font-medium text-base group-hover:text-blue-400 transition-colors">
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
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${getStatusStyle(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        
                                        {/* CỘT 3: ƯU TIÊN */}
                                        <td className="p-4 text-center">
                                            <span className={`text-sm bg-gray-800/50 px-3 py-1 rounded-md border border-gray-700 ${getPriorityStyle(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>

                                        {/* CỘT 4: DEADLINE */}
                                        <td className="p-4 text-center">
                                            {task.dueDate ? (
                                                <span className="text-sm font-medium text-gray-300 bg-gray-800 px-3 py-1 rounded-md">
                                                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-600 italic">Không có</span>
                                            )}
                                        </td>
                                        
                                        {/* CỘT 5: TIẾN ĐỘ */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden border border-gray-600/30">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${task.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 w-8">{task.progress}%</span>
                                            </div>
                                        </td>
                                        
                                        {/* CỘT 6: NHÂN SỰ GIAO NHẬN */}
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="text-gray-300">
                                                    <span className="text-gray-500">Giao:</span> {task.assigneeId ? `User #${task.assigneeId}` : "Chưa giao"}
                                                </span>
                                                <span className="text-gray-500">
                                                    Tạo: User #{task.reporterId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                title="Xóa công việc này"
                                                className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
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

            {/* --- MODAL TẠO TASK MỚI (FULL OPTIONS) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Tạo công việc mới</h2>

                        <form onSubmit={handleCreateTask} className='space-y-5'>
                            
                            {/* Cột 1: Thông tin chính (Tiêu đề + Mô tả) */}
                            <div className="space-y-5">
                                <div>
                                    <label className='block text-sm font-medium text-gray-400 mb-1'>
                                        Tiêu đề công việc <span className='text-red-500'>*</span>
                                    </label>
                                    <input type="text" required
                                        value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder='VD: Thiết kế giao diện Dashboard...'
                                        className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition'
                                    />
                                </div>
                                
                                <div>
                                    <label className='block text-sm font-medium text-gray-400 mb-1'>Mô tả chi tiết</label>
                                    <textarea rows={3}
                                        value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)}
                                        placeholder='Nhập nội dung cần làm...'
                                        className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition resize-none'
                                    />
                                </div>
                            </div>

                            {/* Cột 2: Các cài đặt (Chia Grid 2 cột cho gọn) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-800/50 rounded-xl border border-gray-800">
                                <div>
                                    <label className='block text-sm font-medium text-gray-400 mb-1'>Độ ưu tiên</label>
                                    <select 
                                        value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                                        className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition cursor-pointer'
                                    >
                                        <option value="LOW">Thấp (Low)</option>
                                        <option value="MEDIUM">Trung bình (Medium)</option>
                                        <option value="HIGH">Cao (High)</option>
                                        <option value="URGENT">Khẩn cấp (Urgent)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-400 mb-1'>Deadline</label>
                                    <input type="date" 
                                        value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-400 mb-1'>ID Người nhận việc</label>
                                    <input type="number" placeholder="Bỏ trống nếu chưa giao" min={1}
                                        value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}
                                        className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-400 mb-1'>Vị trí (Position)</label>
                                    <input type="number" placeholder="Mặc định: 0" min={0}
                                        value={newTaskPosition} onChange={(e) => setNewTaskPosition(Number(e.target.value))}
                                        className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition'
                                    />
                                </div>
                            </div>

                            {/* Nút Submit */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 border border-gray-600 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg font-semibold transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isCreating} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
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