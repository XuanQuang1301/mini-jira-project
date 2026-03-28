import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    progress: number;
    dueDate: string | null;
    projectId: number;
    assigneeId: number | null;
}

interface ProjectInfo {
    name: string;
    role: string;
}

interface ColumnData {
    name: string;
    items: Task[];
}

interface BoardData {
    [key: string]: ColumnData;
}

const initialBoard: BoardData = {
    TODO: { name: 'Cần làm', items: [] },
    IN_PROGRESS: { name: 'Đang làm', items: [] },
    REVIEW: { name: 'Chờ duyệt', items: [] },
    DONE: { name: 'Đã xong', items: [] }
};

export default function MyTasks() {
    const [columns, setColumns] = useState<BoardData>(initialBoard);
    const [isLoading, setIsLoading] = useState(true);
    const [projectsMap, setProjectsMap] = useState<Record<number, ProjectInfo>>({});
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editProgress, setEditProgress] = useState(0);
    const [editPriority, setEditPriority] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    // --- STATE MỚI CHO SUBTASKS ---
    const [subTasks, setSubTasks] = useState<any[]>([]);
    const [newSubContent, setNewSubContent] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedId = localStorage.getItem('userId');
            const myId = storedId ? Number(storedId) : null;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [tasksRes, projectsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/tasks/my-tasks', config),
                axios.get('http://localhost:5000/api/projects', config),
                axios.get('http://localhost:5000/api/users', config)
            ]);

            setAllUsers(usersRes.data);
            const projMap: Record<number, ProjectInfo> = {};
            projectsRes.data.forEach((p: any) => { projMap[p.id] = { name: p.name, role: p.role }; });
            setProjectsMap(projMap);

            const fetchedTasks: Task[] = tasksRes.data.filter((t: any) => {
                return t.assigneeId != null && Number(t.assigneeId) == myId;
            });

            const newBoard: BoardData = {
                TODO: { name: 'Cần làm', items: [] },
                IN_PROGRESS: { name: 'Đang làm', items: [] },
                REVIEW: { name: 'Chờ duyệt', items: [] },
                DONE: { name: 'Đã xong', items: [] }
            };

            fetchedTasks.forEach(task => {
                if (newBoard[task.status]) newBoard[task.status].items.push(task);
            });

            setColumns(newBoard);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LOGIC XỬ LÝ SUBTASKS ---
    const fetchSubTasks = async (taskId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/subtasks/task/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubTasks(res.data);
        } catch (error) { console.error("Lỗi lấy checklist:", error); }
    };

    const handleAddSubTask = async () => {
        const content = newSubContent.trim();
        if (!content) return;
        const taskIdNum = Number(editingTask?.id);
        if (!taskIdNum || isNaN(taskIdNum)) {
            console.error("Lỗi: Không tìm thấy ID hợp lệ để thêm subtask!", editingTask);
            alert("Lỗi hệ thống: Không xác định được mã công việc. Bạn hãy đóng Modal và mở lại nhé!");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/subtasks`, 
                { 
                    taskId: taskIdNum, 
                    content: content 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewSubContent('');
            fetchSubTasks(taskIdNum);
            fetchData(); 
        } catch (error: any) { 
            console.error("Backend mắng:", error.response?.data);
            alert("Lỗi server: " + (error.response?.data?.error || "Không thể thêm việc")); 
        }
    };

    const handleToggleSub = async (subId: number, isDone: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/subtasks/${subId}`, 
                { isDone: !isDone },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (editingTask) {
                const res = await axios.get(`http://localhost:5000/api/subtasks/task/${editingTask.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newSubTasks = res.data;
                setSubTasks(newSubTasks);
                if (newSubTasks.length > 0) {
                    const doneCount = newSubTasks.filter((s: any) => s.isDone).length;
                    const newPercent = Math.round((doneCount / newSubTasks.length) * 100);
                    setEditProgress(newPercent); // Cập nhật state để số 65% biến thành 100%
                }

                fetchData();
            }
        } catch (error) {
            alert("Lỗi cập nhật trạng thái việc!");
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const draggableTask = sourceColumn.items[source.index];

        if (destination.droppableId === 'DONE') {
            const userRole = projectsMap[draggableTask.projectId]?.role;
            if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
                alert("⛔ Chỉ Quản lý có quyền duyệt sang Đã xong!");
                return;
            }
        }

        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);

        if (source.droppableId !== destination.droppableId) {
            removed.status = destination.droppableId;
            if (destination.droppableId === 'DONE') {
                removed.progress = 100;
            }
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems },
            });
            try {
                const token = localStorage.getItem('token');
                const updateData: any = { status: destination.droppableId };
                if (destination.droppableId === 'DONE') {
                    updateData.progress = 100;
                }
                await axios.patch(`http://localhost:5000/api/tasks/${draggableId}/status`,
                    { status: destination.droppableId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchData();
            } catch (error) { fetchData(); }
        } else {
            sourceItems.splice(destination.index, 0, removed);
            setColumns({ ...columns, [source.droppableId]: { ...sourceColumn, items: sourceItems } });
        }
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDesc(task.description || '');
        const initialProgress = task.status === 'DONE' ? 100 : (task.progress || 0);
        setEditProgress(initialProgress);
        setEditPriority(task.priority);
        setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setIsEditModalOpen(true);
        fetchComments(task.id);
        fetchSubTasks(task.id); 
    };

    const fetchComments = async (taskId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/comments/task/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSendComment = async () => {
        if (!commentText.trim() || !editingTask) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/comments`, {
                taskId: editingTask.id, content: commentText
            }, { headers: { Authorization: `Bearer ${token}` } });
            setCommentText('');
            fetchComments(editingTask.id);
        } catch (error) { alert("Lỗi gửi bình luận"); }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const finalProgress = editingTask.status === 'DONE' ? 100 : editProgress;

            await axios.put(`http://localhost:5000/api/tasks/${editingTask.id}`, {
                title: editTitle, 
                description: editDesc, 
                progress: finalProgress,
                priority: editPriority, 
                dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) { 
            alert("Lỗi cập nhật"); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'URGENT': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold animate-pulse">SẴN SÀNG...🚀</div>;

    return (
        <div className="h-full flex flex-col p-6 bg-[#f4f7f9] overflow-hidden">
            <div className="mb-8 px-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Công việc của tôi</h1>
                <p className="text-slate-500 font-medium mt-1">Kéo thả thẻ để cập nhật trạng thái nhiệm vụ.</p>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full overflow-x-auto pb-8 items-start px-2 custom-scrollbar">
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div key={columnId} className="flex flex-col bg-white rounded-[2rem] min-w-[300px] w-[300px] max-h-[calc(100vh-200px)] border border-slate-200 shadow-md overflow-hidden">
                            <div className="p-5 font-black text-[11px] uppercase tracking-[0.2em] flex justify-between items-center bg-slate-50 border-b border-slate-200">
                                <div className="flex items-center gap-2.5 text-slate-700">
                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                        columnId === 'TODO' ? 'bg-slate-400' :
                                        columnId === 'IN_PROGRESS' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                                        columnId === 'REVIEW' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                    }`}></div>
                                    {column.name}
                                </div>
                                <span className="bg-slate-200 px-2.5 py-0.5 rounded-full text-slate-600 font-bold">{column.items.length}</span>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className={`p-4 min-h-[450px] overflow-y-auto custom-scrollbar transition-all ${snapshot.isDraggingOver ? 'bg-blue-50/30' : 'bg-transparent'}`}>
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        onClick={() => handleOpenEditModal(item)}
                                                        className={`p-5 mb-5 rounded-3xl bg-white border border-slate-200 transition-all duration-300 cursor-pointer group
                                                            ${snapshot.isDragging 
                                                                ? 'rotate-2 scale-105 shadow-2xl border-blue-400 z-50' 
                                                                : 'shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-blue-100">
                                                                {projectsMap[item.projectId]?.name || 'Project'}
                                                            </span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${getPriorityStyle(item.priority)}`}>
                                                                {item.priority}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-slate-800 font-bold text-sm mb-4 leading-relaxed group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-5">
                                                            <div 
                                                                className={`h-full transition-all duration-700 ${
                                                                    item.status === 'DONE' || item.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                                                }`} 
                                                                style={{ width: `${item.status === 'DONE' ? 100 : item.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-slate-400 border-t border-slate-50 pt-3">
                                                            <span className="text-[10px] font-bold">{item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                            <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-md">
                                                                {allUsers.find(u => u.id === item.assigneeId)?.name?.charAt(0) || "?"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {isEditModalOpen && editingTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
                        
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingTask.title}</h2>
                                <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">Dự án: {projectsMap[editingTask.projectId]?.name}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm">✕</button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="flex-1 p-8 overflow-y-auto space-y-8 border-r border-slate-100">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-2">Tên công việc</label>
                                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-[1.2rem] px-6 py-4 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-2">Mô tả chi tiết</label>
                                        <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-[1.2rem] px-6 py-4 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none" />
                                    </div>
                                    
                                    {/* --- PHẦN CHECKLIST MỚI THÊM --- */}
                                    <div className="mt-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest block">Việc cần làm</label>
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                                {subTasks.filter(s => s.isDone).length}/{subTasks.length}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <input 
                                                type="text" 
                                                value={newSubContent}
                                                onChange={(e) => setNewSubContent(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                                                placeholder="Thêm đầu việc mới..."
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                            <button onClick={handleAddSubTask} className="bg-blue-600 text-white px-4 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition">Thêm</button>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                            {subTasks.map(sub => (
                                                <div key={sub.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-blue-200">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={sub.isDone}
                                                        onChange={() => handleToggleSub(sub.id, sub.isDone)}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                                                    />
                                                    <span className={`text-xs font-bold flex-1 ${sub.isDone ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{sub.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                        <div className="flex justify-between items-center mb-4"><span className="text-[11px] font-black text-slate-600 uppercase">Tiến độ</span><span className="text-sm font-black text-blue-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">{editingTask.status === 'DONE' ? '100%' : `${editProgress}%`}</span></div>
                                        <input 
                                            type="range" min="0" max="100" 
                                            step={subTasks.length > 0 ? 1 : 50}
                                            value={editingTask.status === 'DONE' ? 100 : editProgress} 
                                            disabled={subTasks.length > 0 || editingTask.status === 'DONE'} 
                                            onChange={(e) => setEditProgress(Number(e.target.value))} 
                                            className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner ${subTasks.length > 0 ? 'opacity-40 cursor-not-allowed' : ''}`} 
                                        />
                                        {subTasks.length > 0 && <p className="text-[9px] text-blue-500 font-bold mt-2 italic">Tiến độ tự động theo checklist</p>}
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                        <span className="text-[11px] font-black text-slate-600 uppercase block mb-3">Mức độ ưu tiên</span>
                                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 font-bold text-xs text-slate-700 outline-none shadow-sm">
                                            <option value="LOW">THẤP (LOW)</option><option value="MEDIUM">TRUNG BÌNH (MEDIUM)</option><option value="HIGH">CAO (HIGH)</option><option value="URGENT">KHẨN CẤP (URGENT)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-[380px] flex flex-col bg-slate-50/40">
                                <div className="p-6 border-b border-slate-200 font-black text-[11px] text-slate-600 uppercase tracking-widest">💬 Bình luận ({comments.length})</div>
                                <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                                    {comments.map((c) => (
                                        <div key={c.id} className="flex gap-4">
                                            <div className="w-9 h-9 bg-blue-600 rounded-[1rem] flex items-center justify-center text-[10px] text-white font-black shrink-0 shadow-lg">{c.user?.name?.charAt(0)}</div>
                                            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                                <p className="text-[10px] font-black text-slate-900 mb-1">{c.user?.name}</p>
                                                <p className="text-[12px] text-slate-700 leading-relaxed font-medium">{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && <div className="text-center py-10 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Chưa có thảo luận nào</div>}
                                </div>
                                <div className="p-6 bg-white border-t border-slate-200 flex gap-3">
                                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} placeholder="Phản hồi..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                                    <button onClick={handleSendComment} className="bg-blue-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all">Gửi</button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-3 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">ĐÓNG</button>
                            <button onClick={handleUpdateTask} disabled={isUpdating} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                                {isUpdating ? 'ĐANG LƯU...' : 'CẬP NHẬT THAY ĐỔI'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}