import { useState, useEffect } from 'react'; 
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';

interface Project {
    id: number; 
    name: string; 
    description: string; 
    key: string; 
    role: string; 
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
    projectId: number;
}

export default function ProjectDetail() {
    const { id } = useParams(); 
    const [project, setProject] = useState<Project | null>(null); 
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [isLoading, setIsLoading] = useState(true);  
    const [allUsers, setAllUsers] = useState<any[]>([]);
    
    // --- STATE DÀNH CHO FORM TẠO TASK ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskPosition, setNewTaskPosition] = useState(0); 

    // --- STATE CHO MODAL XEM CHI TIẾT & COMMENT ---
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    // --- STATE DUYỆT THÀNH VIÊN ---
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);
    const [isPendingOpen, setIsPendingOpen] = useState(false); 
    const [projectMembersList, setProjectMembersList] = useState<any[]>([]);

    // STATE kiểm soát Dropdown chọn người 
    const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);

    // State lưu danh sách checklist của task đang chọn
    const [subTasks, setSubTasks] = useState<any[]>([]);
    const [newSubContent, setNewSubContent] = useState('');
    const fetchData = async () => {
        setIsLoading(true); 
        try {
            const token = localStorage.getItem('token'); 
            const config = { headers: { Authorization: `Bearer ${token}` } }; 
            const [projectRes, taskRes, membersRes, allUsersRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/projects/${id}`, config), 
                axios.get(`http://localhost:5000/api/tasks/project/${id}`, config),
                axios.get(`http://localhost:5000/api/projects/${id}/members`, config),
                axios.get(`http://localhost:5000/api/users`, config) // Vẫn cần cái này để map tên ở bảng
            ]); 

            setProject(projectRes.data); 
            setTasks(taskRes.data);
            setProjectMembersList(membersRes.data);
            setAllUsers(allUsersRes.data);
            
            const projRole = projectRes.data.role;
            if (projRole === 'OWNER' || projRole === 'MANAGER' ) {
                fetchPendingMembers();
            }
        } catch (error: any) { 
            console.error("Lỗi tải dữ liệu:", error);
            if (error.response?.status === 404) {
                alert("Không tìm thấy dự án hoặc API /members chưa được tạo!");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    const fetchPendingMembers = async () => {
        if(!id) return; 
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/projects/${id}/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingMembers(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách chờ:", error);
        }
    };
    useEffect(() => {
        fetchData(); 
        //fetchPendingMembers();
    }, [id]); 
    // --- XỬ LÝ DUYỆT THÀNH VIÊN ---
    const handleApprove = async (recordId: number) => {
        try {
            const token = localStorage.getItem('token');
            // Gọi API chuyển status từ PENDING -> JOINED
            await axios.post('http://localhost:5000/api/projects/approve', 
                { memberRecordId: recordId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Đã duyệt thành viên! Bây giờ dự án sẽ hiện bên member 🎊");
            setPendingMembers(prev => prev.filter(m => m.id !== recordId));
            if (pendingMembers.length === 1) setIsPendingOpen(false);
            fetchData(); // Load lại dữ liệu project
        } catch (error) {
            alert("Lỗi khi duyệt");
        }
    };

    // --- XỬ LÝ COMMENT ---
    const fetchComments = async (taskId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/comments/task/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
        } catch (error) { console.error(error); }
    };

    const handleOpenDetail = (task: Task) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
        setCommentText('');
        fetchComments(task.id);
        fetchSubTasks(task.id);
    };

    const handleSendComment = async () => {
        if (!commentText.trim() || !selectedTask) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/comments`, {
                taskId: selectedTask.id,
                content: commentText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCommentText('');
            fetchComments(selectedTask.id);
        } catch (error) { alert("Lỗi gửi bình luận"); }
    };

    // --- XỬ LÝ TASK ---
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
            setNewTaskTitle(''); setNewTaskDesc('');
            fetchData(); 
        } catch (error: any) {
            alert("Lỗi tạo Task: " + (error.response?.data?.error || error.message)); 
        } finally {
            setIsCreating(false); 
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm("Xóa thẻ công việc này?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error: any) { alert("Lỗi khi xóa"); }
    };

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'TODO': return 'bg-gray-50 text-gray-500 border-gray-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'DONE': return 'bg-green-50 text-green-600 border-green-200';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch(priority) {
            case 'HIGH': return 'bg-orange-50 text-orange-600';
            case 'URGENT': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500';
        }
    };
    
    const handleQuickAssign = async (taskId: number, userId: number) => {
        try {
            const token = localStorage.getItem('token'); 
            await axios.patch(`http://localhost:5000/api/tasks/${taskId}/assign`, 
            {assigneeId: userId}, 
            {headers: {Authorization: `Bearer ${token}`}}); 
            setTasks(prevTasks => prevTasks.map(task => 
                task.id === taskId ? { ...task, assigneeId: userId } : task
            ));
            setAssigningTaskId(null); 
        } catch(error: any){
            console.error("Chi tiết lỗi Backend:", error.response?.data || error.message);
        alert("Lỗi khi giao việc: " + (error.response?.data?.error || "Không kết nối được API"));
        }
    }

    // Hàm lấy danh sách subtasks khi mở Modal
    const fetchSubTasks = async (taskId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/subtasks/task/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubTasks(res.data);
        } catch (error) { console.error("Lỗi lấy checklist:", error); }
    };

    // Hàm thêm mới một đầu việc
    const handleAddSubTask = async () => {
        if (!newSubContent.trim() || !selectedTask) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/subtasks`, 
                { taskId: selectedTask.id, content: newSubContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewSubContent('');
            fetchSubTasks(selectedTask.id); // Load lại checklist
            fetchData(); // Load lại task để cập nhật % Progress chính
        } catch (error) { alert("Lỗi thêm việc"); }
    };

    // Hàm tích chọn hoàn thành
    const handleToggleSub = async (subId: number, isDone: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/subtasks/${subId}`, 
                { isDone: !isDone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if(selectedTask) {
                fetchSubTasks(selectedTask.id);
                fetchData();
            }
        } catch (error) { alert("Lỗi cập nhật"); }
    };
    if (isLoading) return <div className="p-10 text-blue-600 font-black animate-pulse">ĐANG TẢI DỮ LIỆU... 🚀</div>;
    if (!project) return <div className="p-10 text-red-500 font-bold">Lỗi: Không tìm thấy dự án!</div>;

    return (
        <div className="flex flex-col h-full bg-white"> 
            {/* Header Dự án */}
            <div className="flex items-start gap-6 mb-8 border-b border-gray-100 pb-8 px-2">
                <Link to="/projects" className="mt-1 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-400 w-10 h-10 rounded-xl transition shadow-sm">&larr;</Link>
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-gray-900">{project.name}</h1>
                        <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-black tracking-widest shadow-lg shadow-blue-100 uppercase">{project.key}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 font-medium">{project.description}</p>
                </div>
                {/* HIỂN THỊ MÃ DỰ ÁN ĐỂ COPY */}
                <div className="hidden md:block text-right">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Mã tham gia</span>
                    <code className="bg-gray-50 px-3 py-2 rounded-xl border border-dashed border-gray-200 text-blue-600 font-bold text-xs select-all cursor-pointer" title="Click để copy">
                        {project.key}
                    </code>
                </div>
                {/* NÚT CHUÔNG THÔNG BÁO DUYỆT THÀNH VIÊN */}
                <div className="relative">
                    <button 
                        onClick={() => setIsPendingOpen(!isPendingOpen)}
                        className="relative p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95 group"
                    >
                        {/* Icon Chuông */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>

                        {/* Chấm đỏ thông báo số lượng */}
                        {pendingMembers.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-4 ring-white animate-bounce">
                                {pendingMembers.length}
                            </span>
                        )}
                    </button>

                    {/* DROPDOWN DANH SÁCH NGƯỜI XIN VÀO */}
                    {isPendingOpen && (
                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
                                <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Yêu cầu gia nhập</h3>
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg">{pendingMembers.length} mới</span>
                            </div>

                            <div className="max-h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {pendingMembers.length > 0 ? (
                                    pendingMembers.map((m: any) => (
                                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase shrink-0">
                                                {m.user?.name?.charAt(0) || "U"}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-black text-slate-800 truncate">{m.user?.name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{m.user?.email}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleApprove(m.id)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black transition-all active:scale-90 shadow-md shadow-emerald-100 uppercase"
                                            >
                                                Duyệt
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center flex flex-col items-center gap-2 opacity-30">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Không có yêu cầu tham gia</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50/50 rounded-b-[2rem] border-t border-slate-50 text-center">
                                <button onClick={() => setIsPendingOpen(false)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Đóng</button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Danh sách công việc</h2>
                    <p className="text-gray-400 text-xs mt-1">Quản lý các thẻ bài trong dự án</p>
                </div>
                <button onClick={()=> setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 transition active:scale-95 flex items-center gap-2">
                    <span className="text-lg">+</span> Thêm Task
                </button>
            </div>

            {/* Bảng Dữ liệu Modern */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-visible mx-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest">
                            <th className="p-5 font-black">Công việc</th>
                            <th className="p-5 font-black text-center">Trạng thái</th>
                            <th className="p-5 font-black text-center">Ưu tiên</th>
                            <th className="p-5 font-black text-center">Thời hạn</th>
                            <th className="p-5 font-black w-40">Tiến độ</th>
                            <th className="p-5 font-black text-right">Nhân sự</th>
                            <th className="p-5 font-black text-center">Xóa</th>
                        </tr>
                    </thead>
                </table>
                <div className="overflow-y-auto max-h-[calc(100vh-420px)] custom-scrollbar">
                    <table className="w-full text-left border-collapse"> 
                        <tbody className="divide-y divide-gray-50">
                            {tasks.map((task) => {
                                const assignee = allUsers.find(u => u.id === task.assigneeId);
                                return (
                                    <tr key={task.id} className="hover:bg-blue-50/20 transition-all group">
                                        <td className="p-5 cursor-pointer" onClick={() => handleOpenDetail(task)}>
                                            <p className="text-gray-900 font-bold text-sm group-hover:text-blue-600 transition-colors">{task.title}</p>
                                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1 font-normal">{task.description}</p>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`text-[10px] uppercase px-3 py-1 rounded-full font-black border ${getStatusStyle(task.status)}`}>{task.status}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                                        </td>
                                        <td className="p-5 text-center text-[11px] text-gray-500 font-bold">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : "-"}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${task.progress}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300">{task.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <span className="text-xs font-bold text-gray-700">
                                                    {assignee?.name || "Chưa giao"}
                                                </span>

                                                {/* Bọc trong một div relative để Dropdown định vị đúng */}
                                                <div className="relative">
                                                    <button 
                                                        onClick={(e) => {
                                                            // CỰC KỲ QUAN TRỌNG: Ngăn không cho sự kiện click lan ra ngoài làm mở Modal chi tiết
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setAssigningTaskId(assigningTaskId === task.id ? null : task.id);
                                                        }}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase shadow-md border-2 border-white transition-all active:scale-90 ${assignee ? 'bg-blue-600' : 'bg-gray-300 hover:bg-blue-400'}`}
                                                    >
                                                        {assignee?.name?.charAt(0) || "?"}
                                                    </button>

                                                    {/* DROPDOWN CHỌN NHÂN SỰ */}
                                                    {assigningTaskId === task.id && (
                                                        <>
                                                            {/* Lớp phủ tàng hình để click ra ngoài thì đóng dropdown */}
                                                            <div 
                                                                className="fixed inset-0 z-[110]" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setAssigningTaskId(null);
                                                                }}
                                                            ></div>

                                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-[9999] py-2 animate-in fade-in zoom-in-95 duration-150">
                                                                <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Giao việc cho:</p>
                                                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                                    {projectMembersList.length > 0 ? (
                                                                        projectMembersList.map(member => (
                                                                            <button
                                                                                key={member.id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // Không mở Modal task
                                                                                    handleQuickAssign(task.id, member.id);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                                                            >
                                                                                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] uppercase text-slate-500 font-black">
                                                                                    {member.name?.charAt(0)}
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span>{member.name}</span>
                                                                                    <span className="text-[9px] font-medium text-slate-400">{member.email}</span>
                                                                                </div>
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <p className="px-4 py-4 text-[10px] text-center text-slate-400 font-bold uppercase">Chưa có thành viên</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button onClick={() => handleDeleteTask(task.id)} className="text-gray-200 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tạo Task */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-gray-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-8">Tạo công việc mới 🚀</h2>
                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-black-400 uppercase tracking-widest">Tiêu đề</label>
                                <input type="text" required placeholder="Tên công việc..." value={newTaskTitle} onChange={(e)=>setNewTaskTitle(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-black-400 uppercase tracking-widest">Mô tả chi tiết</label>
                                <textarea rows={3} placeholder="Mô tả..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm outline-none resize-none" />
                            </div>
                            {/* KHÔNG ĐỂ CHECKLIST Ở ĐÂY KHI TẠO MỚI */}
                            <div className="grid grid-cols-2 gap-5">
                                <select value={newTaskPriority} onChange={(e)=>setNewTaskPriority(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm font-bold">
                                    <option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option><option value="URGENT">Khẩn cấp</option>
                                </select>
                                <input type="date" value={newTaskDueDate} onChange={(e)=>setNewTaskDueDate(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm outline-none" />
                            </div>
                            {/* ... (Phần chọn người thực hiện) ... */}
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-bold">Hủy</button>
                                <button type="submit" disabled={isCreating} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black">{isCreating ? 'Đang xử lý...' : 'Tạo ngay'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xem chi tiết & Thảo luận */}
            {isDetailOpen && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-100">
                        <div className="p-7 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h2 className="text-xl font-black text-gray-900">{selectedTask.title}</h2>
                            <button onClick={()=>setIsDetailOpen(false)} className="bg-white border w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition">✕</button>
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="flex-1 p-8 overflow-y-auto space-y-8 border-r border-gray-50">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả chi tiết</label>
                                    <p className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 mt-3 leading-relaxed border border-gray-100">{selectedTask.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="mt-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Việc cần làm</label>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                            {subTasks.filter(s => s.isDone).length}/{subTasks.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {subTasks.map((sub) => (
                                            <div key={sub.id} className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                                <input type="checkbox" checked={sub.isDone} disabled={true} className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-not-allowed opacity-60" />
                                                <span className={`text-xs font-medium ${sub.isDone ? 'text-gray-300 line-through' : 'text-gray-600'}`}>{sub.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                    <div className="bg-gray-50 p-5 rounded-2xl">
                                        <span className="text-[9px] block font-black text-gray-400 uppercase mb-1">Tiến độ tổng thể</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${selectedTask.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-gray-900">{selectedTask.progress}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-[360px] flex flex-col bg-gray-50/50">
                                <div className="p-5 border-b border-gray-100 bg-white font-black text-[11px] text-gray-400 uppercase tracking-widest">💬 Thảo luận ({comments.length})</div>
                                <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">
                                    {comments.map((c) => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] text-white font-black uppercase shrink-0 shadow-md">{c.user.name?.charAt(0)}</div>
                                            <div className="flex-1 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                                                <p className="text-[10px] font-black text-gray-900 mb-1">{c.user.name}</p>
                                                <p className="text-xs text-gray-600">{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-5 bg-white border-t border-gray-100 flex gap-2">
                                    <input type="text" value={commentText} onChange={(e)=>setCommentText(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSendComment()} placeholder="Phản hồi..." className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                                    <button onClick={handleSendComment} className="bg-blue-600 text-white px-4 rounded-xl font-black text-[10px] uppercase shadow-md shadow-blue-100 transition active:scale-90">Gửi</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}