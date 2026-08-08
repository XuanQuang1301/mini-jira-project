import { useState, useEffect } from 'react'; 
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import { 
    Plus, Trash2, Edit3, UserPlus, Users, Settings, 
    ArrowLeft, Hash, CheckCircle2, Clock, AlertCircle, MessageSquare, 
    X, Check, Shield, Crown, User, Calendar, Tag, AlertTriangle, RotateCcw, CheckSquare
} from 'lucide-react';

interface Project {
    id: number; 
    name: string; 
    description: string; 
    key: string; 
    role: string; 
    status?: string; 
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
    
    // TAB CONTROLS
    const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');

    // CREATE TASK FORM
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskPosition, setNewTaskPosition] = useState(0); 

    // DETAIL & COMMENT MODAL
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    // MEMBER & APPROVAL
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);
    const [isPendingOpen, setIsPendingOpen] = useState(false); 
    const [projectMembersList, setProjectMembersList] = useState<any[]>([]);

    // ADD MEMBER FORM
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('MEMBER'); 
    const [isAddingMember, setIsAddingMember] = useState(false);

    // ASSIGNEE DROPDOWN CONTROL
    const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);

    // SUBTASKS
    const [subTasks, setSubTasks] = useState<any[]>([]);
    const [newSubContent, setNewSubContent] = useState('');
    
    // REJECT TASK
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const navigate = useNavigate();

    // EDIT PROJECT
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [editProjName, setEditProjName] = useState('');
    const [editProjKey, setEditProjKey] = useState('');
    const [editProjDesc, setEditProjDesc] = useState('');
    const [editProjStatus, setEditProjStatus] = useState('PLANNING');
    const [isUpdatingProj, setIsUpdatingProj] = useState(false);
    
    // DELETE TASK
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // DELETE PROJECT
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);

    // EDIT TASK
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskDesc, setEditTaskDesc] = useState('');
    const [editTaskPriority, setEditTaskPriority] = useState('MEDIUM');
    const [editTaskDueDate, setEditTaskDueDate] = useState('');
    const [editTaskAssignee, setEditTaskAssignee] = useState('');

    const { myRole, currentUserId } = (() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { myRole: 'MEMBER', currentUserId: null };            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUserEmail = payload.sub;

            const me = projectMembersList.find(m => m.userEmail === currentUserEmail || m.userName === currentUserEmail);
            
            return { 
                myRole: me ? me.role : 'MEMBER', 
                currentUserId: me ? me.userId : null 
            };
        } catch (error) {
            return { myRole: 'MEMBER', currentUserId: null };
        }
    })();
    
    const canModifyTask = myRole === 'OWNER' || myRole === 'MANAGER' || (selectedTask?.assigneeId === currentUserId);
    const canToggleSub = selectedTask?.assigneeId === currentUserId;
    const isPrivileged = myRole === 'OWNER' || myRole === 'MANAGER';

    const fetchData = async (showLoading = true) => {
        if (showLoading) setIsLoading(true); 
        try {
            const [projectRes, taskRes, membersRes, allUsersRes] = await Promise.all([
                api.get(`/api/project/${id}`), 
                api.get(`/api/project/${id}/tasks`),
                api.get(`/api/project/${id}/members`),
                api.get(`/api/users`) 
            ]); 

            setProject(projectRes.data); 
            setTasks(taskRes.data);
            setProjectMembersList(membersRes.data);
            setAllUsers(allUsersRes.data);
            
            const token = localStorage.getItem('token');
            const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
            const currentUserEmail = payload ? payload.sub : null;
            const me = membersRes.data.find((m: any) => m.userEmail === currentUserEmail || m.userName === currentUserEmail);
            const fetchedRole = me ? me.role : 'MEMBER';
            
            if (fetchedRole === 'OWNER' || fetchedRole === 'MANAGER') {
                fetchPendingMembers();
            }
        } catch (error: any) { 
            console.error("Lỗi tải dữ liệu:", error);
            if (error.response?.status === 404) {
                alert("Không tìm thấy dự án!");
            }
        } finally {
            if (showLoading) setIsLoading(false); 
        }
    };

    const fetchPendingMembers = async () => {
        if (!id) return; 
        try {
            const res = await api.get(`/api/project/${id}/pending`);
            setPendingMembers(res.data);
        } catch (error: any) {
            if (error.response?.status === 403) {
                setPendingMembers([]); 
            } else {
                console.error("Lỗi lấy danh sách chờ:", error);
            }
        }
    };

    useEffect(() => {
        fetchData(true); 
    }, [id]); 

    const handleApprove = async (recordId: number) => {
        try {
            await api.post('/api/project/approve', { memberRecordId: recordId });
            alert("Đã phê duyệt thành viên vào dự án!");
            setPendingMembers(prev => prev.filter(m => m.id !== recordId));
            if (pendingMembers.length === 1) setIsPendingOpen(false);
            fetchData(); 
        } catch (error) {
            alert("Lỗi khi duyệt thành viên");
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingMember(true);
        try {
            const res = await api.post(`/api/project/${id}/members`, { email: newMemberEmail, role: newMemberRole });
            alert(res.data.message || "Đã thêm thành viên thành công!");
            setShowAddMemberModal(false);
            setNewMemberEmail('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Không thể thêm thành viên!");
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId: number, memberName: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${memberName}" khỏi dự án?`)) {
            try {
                await api.delete(`/api/project/${id}/members/${memberId}`);
                alert("Đã xóa thành viên!");
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.error || "Lỗi khi xóa thành viên");
            }
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setIsCreating(true); 
        try {
            await api.post(`/api/project/${id}/tasks`, {
                title: newTaskTitle, 
                description: newTaskDesc, 
                priority: newTaskPriority, 
                dueDate: newTaskDueDate || null,
                assigneeId: newTaskAssignee ? Number(newTaskAssignee) : null,
                position: Number(newTaskPosition) || 0
            });
            
            setIsModalOpen(false); 
            setNewTaskTitle(''); 
            setNewTaskDesc(''); 
            setNewTaskPriority('MEDIUM'); 
            setNewTaskDueDate(''); 
            setNewTaskAssignee('');
            setNewTaskPosition(0);
            fetchData(); 
        } catch (err: any) {
            console.error("Lỗi tạo Task:", err); 
            alert(err.response?.data?.error || "Không thể tạo Task!"); 
        } finally {
            setIsCreating(false); 
        }
    };

    const handleOpenDetail = async (task: Task) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
        fetchSubTasks(task.id);
        
        try {
            const res = await api.get(`/api/project/${id}/tasks/${task.id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error("Lỗi lấy comment:", err);
        }
    };

    const fetchSubTasks = async (taskId: number) => {
        try {
            const res = await api.get(`/api/tasks/${taskId}/subtasks`);
            setSubTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSubTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubContent.trim() || !selectedTask) return;
        try {
            await api.post(`/api/tasks/${selectedTask.id}/subtasks`, { content: newSubContent });
            setNewSubContent('');
            fetchSubTasks(selectedTask.id);
            fetchData(false);
        } catch (err) {
            alert("Lỗi thêm subtask");
        }
    };

    const handleToggleSubTask = async (subId: number, currentStatus: boolean) => {
        if (!selectedTask) return;
        try {
            await api.patch(`/api/tasks/subtasks/${subId}`, { isDone: !currentStatus });
            fetchSubTasks(selectedTask.id);
            fetchData(false);
        } catch (err) {
            alert("Lỗi cập nhật subtask");
        }
    };

    const handleDeleteSubTask = async (subId: number) => {
        if (!selectedTask) return;
        try {
            await api.delete(`/api/tasks/subtasks/${subId}`);
            fetchSubTasks(selectedTask.id);
            fetchData(false);
        } catch (err) {
            alert("Lỗi xóa subtask");
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !selectedTask) return;
        try {
            const res = await api.post(`/api/project/${id}/tasks/${selectedTask.id}/comments`, { content: commentText });
            setComments([res.data, ...comments]);
            setCommentText('');
        } catch (err) {
            console.error("Lỗi gửi comment:", err);
            alert("Không thể gửi bình luận!");
        }
    };

    const handleQuickAssign = async (taskId: number, assigneeId: number | null) => {
        try {
            await api.patch(`/api/project/${id}/tasks/${taskId}/assignee`, { assigneeId });
            setAssigningTaskId(null);
            fetchData(false); 
        } catch (error) {
            console.error("Lỗi giao việc:", error);
            alert("Không thể thay đổi người làm!");
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await api.patch(`/api/project/${id}/tasks/${taskId}/status`, { status: newStatus });
            
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask({ ...selectedTask, status: newStatus });
            }
            fetchData(false); 
        } catch (error: any) {
            alert(error.response?.data?.error || "Lỗi khi đổi trạng thái!");
        }
    };

    const handleRejectTask = async () => {
        if (!selectedTask || !rejectReason.trim()) return;
        setIsRejecting(true);
        try {
            await api.patch(`/api/project/${id}/tasks/${selectedTask.id}/status`, { status: 'REJECTED', rejectReason });
            
            setSelectedTask({ ...selectedTask, status: 'REJECTED' });
            setShowRejectModal(false);
            setRejectReason('');
            fetchData(false);
            alert("Đã từ chối task thành công!");
        } catch (error: any) {
            alert(error.response?.data?.error || "Lỗi khi từ chối task!");
        } finally {
            setIsRejecting(false);
        }
    };

    const openEditProjectModal = () => {
        if (!project) return;
        setEditProjName(project.name);
        setEditProjKey(project.key);
        setEditProjDesc(project.description || '');
        setEditProjStatus(project.status || 'PLANNING');
        setShowEditProjectModal(true);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProj(true);
        try {
            await api.patch(`/api/project/${id}`, { name: editProjName, key: editProjKey, description: editProjDesc, status: editProjStatus });
            alert("Cập nhật dự án thành công!");
            setShowEditProjectModal(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Lỗi khi cập nhật dự án");
        } finally {
            setIsUpdatingProj(false);
        }
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/project/${id}/tasks/${taskToDelete}`);
            
            if (selectedTask && selectedTask.id === taskToDelete) {
                setIsDetailOpen(false);
                setSelectedTask(null);
            }
            setTaskToDelete(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Lỗi khi xóa công việc!");
        } finally {
            setIsDeleting(false);
        }
    };

    const executeDeleteProject = async () => {
        setIsDeletingProject(true);
        try {
            await api.delete(`/api/project/delete/${id}`);
            alert("Đã xóa dự án thành công!");
            navigate('/projects');
        } catch (err: any) {
            alert(err.response?.data?.error || "Không thể xóa dự án!");
        } finally {
            setIsDeletingProject(false);
            setShowDeleteProjectModal(false);
        }
    };

    const startEditingTask = () => {
        if (!selectedTask) return;
        setEditTaskTitle(selectedTask.title);
        setEditTaskDesc(selectedTask.description || '');
        setEditTaskPriority(selectedTask.priority);
        setEditTaskDueDate(selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : '');
        setEditTaskAssignee(selectedTask.assigneeId ? String(selectedTask.assigneeId) : '');
        setIsEditingTask(true);
    };

    const handleSaveTaskEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;
        setIsUpdatingTask(true);
        try {
            await api.put(`/api/project/${id}/tasks/${selectedTask.id}`, 
                {
                    title: editTaskTitle,
                    description: editTaskDesc,
                    priority: editTaskPriority,
                    dueDate: editTaskDueDate || null,
                    assigneeId: editTaskAssignee ? Number(editTaskAssignee) : null
                }
            );

            const updatedTask = {
                ...selectedTask,
                title: editTaskTitle,
                description: editTaskDesc,
                priority: editTaskPriority,
                dueDate: editTaskDueDate || null,
                assigneeId: editTaskAssignee ? Number(editTaskAssignee) : null
            };

            setSelectedTask(updatedTask);
            setIsEditingTask(false);
            fetchData(false);
        } catch (error: any) {
            alert(error.response?.data?.error || "Lỗi khi cập nhật công việc!");
        } finally {
            setIsUpdatingTask(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'REVIEW': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600 text-xs font-semibold gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Đang tải thông tin dự án...</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>Không tìm thấy dữ liệu dự án.</p>
                <Link to="/projects" className="text-blue-600 font-semibold text-xs mt-2 inline-block hover:underline">Quay lại danh sách</Link>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6 pb-12 animate-fade-in">
            {/* Top Navigation */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Link to="/projects" className="hover:text-blue-600 transition flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Dự án</span>
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-800">{project.name}</span>
            </div>

            {/* Project Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
                        {project.key && (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                <Hash className="w-3.5 h-3.5" />
                                {project.key}
                            </span>
                        )}
                        <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-md font-extrabold border ${
                            project.role === 'MENTOR' || project.role === 'OWNER'
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : project.role === 'MANAGER'
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}> 
                            {project.role}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{project.description || "Chưa có mô tả dự án."}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isPrivileged && (
                        <button
                            onClick={openEditProjectModal}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1.5"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Cài đặt</span>
                        </button>
                    )}
                    {myRole === 'OWNER' && (
                        <button
                            onClick={() => setShowDeleteProjectModal(true)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 border border-rose-200/60"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa dự án</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Pending Approvals Alert Banner */}
            {isPrivileged && pendingMembers.length > 0 && (
                <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-amber-900">Yêu cầu gia nhập đang chờ duyệt ({pendingMembers.length})</p>
                            <p className="text-[11px] text-amber-700">Có thành viên mới sử dụng Mã dự án để xin tham gia nhóm</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsPendingOpen(!isPendingOpen)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs transition shadow-2xs"
                    >
                        {isPendingOpen ? 'Ẩn danh sách' : 'Xem & Phê duyệt'}
                    </button>
                </div>
            )}

            {/* Pending Members List */}
            {isPendingOpen && pendingMembers.length > 0 && (
                <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Danh sách chờ xác nhận</h3>
                    <div className="divide-y divide-slate-100">
                        {pendingMembers.map((m) => (
                            <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-bold text-slate-800">{m.userName || m.userEmail}</p>
                                    <p className="text-slate-400 text-[11px]">{m.userEmail}</p>
                                </div>
                                <button
                                    onClick={() => handleApprove(m.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition"
                                >
                                    <Check className="w-3 h-3" /> Duyệt
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                            activeTab === 'tasks'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Danh sách công việc</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'tasks' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            {tasks.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                            activeTab === 'members'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Thành viên</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'members' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            {projectMembersList.length}
                        </span>
                    </button>
                </div>

                {activeTab === 'tasks' && (
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Task</span>
                    </button>
                )}

                {activeTab === 'members' && isPrivileged && (
                    <button 
                        onClick={() => setShowAddMemberModal(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Mời thành viên</span>
                    </button>
                )}
            </div>

            {/* TAB CONTENT: TASKS */}
            {activeTab === 'tasks' && (
                <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                                    <th className="p-4 font-bold">Công việc</th>
                                    <th className="p-4 font-bold text-center">Trạng thái</th>
                                    <th className="p-4 font-bold text-center">Độ ưu tiên</th>
                                    <th className="p-4 font-bold text-center">Thời hạn</th>
                                    <th className="p-4 font-bold">Tiến độ</th>
                                    <th className="p-4 font-bold text-right">Người thực hiện</th>
                                    <th className="p-4 font-bold text-center w-12">Thao tác</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                                            Chưa có công việc nào trong dự án này. Hãy tạo task mới!
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => {
                                        const assignee = allUsers.find(u => u.id === task.assigneeId);

                                        return (
                                            <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-4 cursor-pointer" onClick={() => handleOpenDetail(task)}>
                                                    <p className="text-slate-900 font-bold text-xs group-hover:text-blue-600 transition-colors">{task.title}</p>
                                                    <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{task.description}</p>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-extrabold border ${getStatusStyle(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-extrabold border ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-slate-500 font-medium">
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '--'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className="bg-blue-600 h-1.5 rounded-full transition-all" 
                                                                style={{ width: `${task.progress}%` }} 
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-500 min-w-[28px]">{task.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {assignee ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                                                            <User className="w-3 h-3 text-slate-400" />
                                                            {assignee.name || assignee.email}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">Chưa phân công</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {isPrivileged && (
                                                        <button 
                                                            onClick={() => setTaskToDelete(task.id)}
                                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: MEMBERS */}
            {activeTab === 'members' && (
                <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Danh sách thành viên dự án</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectMembersList.map((m) => (
                            <div key={m.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs uppercase">
                                        {(m.userName || m.userEmail || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{m.userName || m.userEmail}</p>
                                        <p className="text-[11px] text-slate-400">{m.userEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-extrabold border ${
                                        m.role === 'OWNER' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                        m.role === 'MANAGER' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {m.role}
                                    </span>
                                    {isPrivileged && m.role !== 'OWNER' && (
                                        <button 
                                            onClick={() => handleRemoveMember(m.id, m.userName || m.userEmail)}
                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL: CREATE TASK */}
            {isModalOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-fade-in"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
                    >
                        <div
                            className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-up"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
                            }}
                        >
                            {/* ── Header ── */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">Tạo công việc mới</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">Thêm task vào bảng Kanban của dự án</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── Form Body ── */}
                            <form onSubmit={handleCreateTask} className="p-6 space-y-4 bg-white">
                                {/* Tên công việc */}
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Tên công việc <span className="text-rose-500 normal-case">*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề công việc..."
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Mô tả
                                    </label>
                                    <textarea 
                                        value={newTaskDesc}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                        rows={3}
                                        placeholder="Mô tả chi tiết nội dung công việc..."
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                                    />
                                </div>

                                {/* Mức ưu tiên + Thời hạn */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                            Mức ưu tiên
                                        </label>
                                        <select 
                                            value={newTaskPriority}
                                            onChange={(e) => setNewTaskPriority(e.target.value)}
                                            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                        >
                                            <option value="LOW">↓ Thấp</option>
                                            <option value="MEDIUM">→ Trung bình</option>
                                            <option value="HIGH">↑ Cao</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                            Thời hạn
                                        </label>
                                        <input 
                                            type="date"
                                            value={newTaskDueDate}
                                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                                            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Người thực hiện */}
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Người thực hiện
                                    </label>
                                    <select 
                                        value={newTaskAssignee}
                                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                    >
                                        <option value="">-- Chưa phân công --</option>
                                        {allUsers.map((u) => (
                                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* ── Actions ── */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Đang tạo...
                                            </span>
                                        ) : 'Tạo Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

            {/* MODAL: TASK DETAIL & COMMENTS */}
            {isDetailOpen && selectedTask &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-fade-in"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsDetailOpen(false); }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div>
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-extrabold border ${getStatusStyle(selectedTask.status)}`}>
                                        {selectedTask.status}
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedTask.title}</h2>
                                </div>
                                <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                                {/* Description */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Mô tả công việc</h4>
                                    <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                                        {selectedTask.description || "Không có mô tả."}
                                    </p>
                                </div>

                                {/* Status Change Buttons */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Đổi trạng thái</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((st) => (
                                            <button
                                                key={st}
                                                onClick={() => handleStatusChange(selectedTask.id, st)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                                    selectedTask.status === st
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subtasks Checklist */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Subtasks / Danh sách việc nhỏ</h4>
                                    <form onSubmit={handleAddSubTask} className="flex gap-2 mb-3">
                                        <input 
                                            type="text" value={newSubContent} onChange={(e) => setNewSubContent(e.target.value)}
                                            placeholder="Thêm mục nhỏ..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-blue-600"
                                        />
                                        <button type="submit" className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800">
                                            Thêm
                                        </button>
                                    </form>

                                    <div className="space-y-1.5">
                                        {subTasks.map((sub) => (
                                            <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                                <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                                                    <input 
                                                        type="checkbox" checked={sub.isDone} 
                                                        onChange={() => handleToggleSubTask(sub.id, sub.isDone)}
                                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className={sub.isDone ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                                                        {sub.content}
                                                    </span>
                                                </label>
                                                <button onClick={() => handleDeleteSubTask(sub.id)} className="text-slate-400 hover:text-rose-600 p-1">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Bình luận ({comments.length})</span>
                                    </h4>

                                    <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                                        <input 
                                            type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Nhập ý kiến thảo luận..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-blue-600"
                                        />
                                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700">
                                            Gửi
                                        </button>
                                    </form>

                                    <div className="space-y-3">
                                        {comments.map((c) => (
                                            <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-slate-900">{c.userName || c.userEmail}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-slate-700">{c.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {/* MODAL: ADD MEMBER BY EMAIL */}
            {showAddMemberModal &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-fade-in"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddMemberModal(false); }}
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md animate-scale-up">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Mời thành viên mới</h2>
                                <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">Email người dùng <span className="text-rose-500 normal-case">*</span></label>
                                    <input 
                                        type="email" required value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">Vai trò trong dự án</label>
                                    <select 
                                        value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="MEMBER">Thành viên (MEMBER)</option>
                                        <option value="MANAGER">Quản lý (MANAGER)</option>
                                    </select>
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowAddMemberModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition-all">
                                        Hủy
                                    </button>
                                    <button type="submit" disabled={isAddingMember} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50">
                                        {isAddingMember ? 'Đang gửi...' : 'Gửi lời mời'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

            {/* MODAL: DELETE CONFIRMATION */}
            {showDeleteProjectModal &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-fade-in"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteProjectModal(false); }}
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md animate-scale-up text-center">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mb-1">Xác nhận xóa dự án</h2>
                            <p className="text-xs text-slate-500 mb-6">Hành động này sẽ xóa vĩnh viễn dự án và toàn bộ công việc liên quan!</p>

                            <div className="flex gap-2.5">
                                <button onClick={() => setShowDeleteProjectModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition-all">
                                    Hủy bỏ
                                </button>
                                <button onClick={executeDeleteProject} disabled={isDeletingProject} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-600/20 disabled:opacity-50">
                                    {isDeletingProject ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
