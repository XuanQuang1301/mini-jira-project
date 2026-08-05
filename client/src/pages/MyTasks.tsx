import { useState, useEffect } from 'react';
import api from '../services/api';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { 
    CheckSquare, Clock, AlertCircle, CheckCircle2, MessageSquare, 
    Plus, Search, X, ChevronRight, User, Hash, AlertTriangle, MessageCircle, Send,
    LayoutGrid, List, Edit3
} from 'lucide-react';

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    position: number;
    progress: number;
    dueDate: string | null;
    projectId: number;
    assigneeId: number | null;
}

interface Column {
    name: string;
    items: Task[];
}

interface BoardData {
    [key: string]: Column;
}

interface ProjectInfo {
    name: string;
    role: string;
}

export default function MyTasks() {
    const [columns, setColumns] = useState<BoardData>({
        TODO: { name: 'Cần làm', items: [] },
        IN_PROGRESS: { name: 'Đang làm', items: [] },
        REVIEW: { name: 'Chờ duyệt', items: [] },
        DONE: { name: 'Đã xong', items: [] }
    });

    const [projectsMap, setProjectsMap] = useState<Record<number, ProjectInfo>>({});
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditingTask, setIsEditingTask] = useState(false); 
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editProgress, setEditProgress] = useState(0);
    const [editPriority, setEditPriority] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    const [subTasks, setSubTasks] = useState<any[]>([]);
    const [newSubContent, setNewSubContent] = useState('');

    const fetchData = async () => {
        try {
            const [tasksRes, projectsRes, usersRes] = await Promise.all([
                api.get('/api/project/tasks/my-tasks'),
                api.get('/api/project/my'),
                api.get('/api/users')
            ]);

            setAllUsers(usersRes.data);
            const projMap: Record<number, ProjectInfo> = {};
            projectsRes.data.forEach((p: any) => { projMap[p.id] = { name: p.name, role: p.role }; });
            setProjectsMap(projMap);

            const fetchedTasks: Task[] = tasksRes.data;
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

    useEffect(() => {
        fetchData();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        if (sourceColId === destColId && source.index === destination.index) {
            return;
        }

        const taskId = Number(draggableId);
        let draggedTaskItem: Task | null = null;

        setColumns((prev) => {
            const sourceColumn = prev[sourceColId];
            const destColumn = prev[destColId];
            if (!sourceColumn || !destColumn) return prev;

            const foundTask = sourceColumn.items.find(t => t.id === taskId);
            if (!foundTask) return prev;
            draggedTaskItem = foundTask;

            const updatedTask: Task = { 
                ...foundTask, 
                status: destColId,
                progress: destColId === 'DONE' ? 100 : foundTask.progress
            };

            // Loại bỏ khỏi cột nguồn
            const newSourceItems = sourceColumn.items.filter(t => t.id !== taskId);

            // Danh sách cơ sở cho cột đích
            const targetBaseItems = sourceColId === destColId ? newSourceItems : [...destColumn.items];

            // Nếu đang dùng bộ lọc ưu tiên, tính toán vị trí chèn chính xác dựa vào danh sách đã lọc
            const targetFiltered = targetBaseItems.filter(item => activeFilter === 'ALL' || item.priority === activeFilter);
            
            let insertIndex = targetBaseItems.length;
            if (destination.index < targetFiltered.length) {
                const pivotTask = targetFiltered[destination.index];
                const realPivotIdx = targetBaseItems.findIndex(t => t.id === pivotTask.id);
                if (realPivotIdx !== -1) {
                    insertIndex = realPivotIdx;
                }
            }

            targetBaseItems.splice(insertIndex, 0, updatedTask);

            return {
                ...prev,
                [sourceColId]: { ...sourceColumn, items: sourceColId === destColId ? targetBaseItems : newSourceItems },
                [destColId]: { ...destColumn, items: targetBaseItems }
            };
        });

        if (!draggedTaskItem) return;

        try {
            await api.patch(
                `/api/project/${(draggedTaskItem as Task).projectId}/tasks/${(draggedTaskItem as Task).id}/status`,
                { status: destColId }
            );
        } catch (error: any) {
            console.error("Lỗi cập nhật trạng thái:", error);
            alert(error.response?.data?.error || "Lỗi khi cập nhật trạng thái!");
            fetchData();
        }
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDesc(task.description || '');
        setEditProgress(task.progress || 0);
        setEditPriority(task.priority || 'MEDIUM');
        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setIsEditingTask(false);
        setIsEditModalOpen(true);
        fetchComments(task.projectId, task.id);
        fetchSubTasks(task.id);
    };

    const fetchComments = async (projectId: number, taskId: number) => {
        try {
            const res = await api.get(`/api/project/${projectId}/tasks/${taskId}/comments`);
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

    const handleSendComment = async () => {
        if (!commentText.trim() || !editingTask) return;
        try {
            const res = await api.post(`/api/project/${editingTask.projectId}/tasks/${editingTask.id}/comments`,
                { content: commentText }
            );
            setComments([res.data, ...comments]);
            setCommentText('');
        } catch (err) {
            alert("Lỗi gửi bình luận");
        }
    };

    const handleAddSubTask = async () => {
        if (!newSubContent.trim() || !editingTask) return;
        try {
            await api.post(`/api/tasks/${editingTask.id}/subtasks`,
                { content: newSubContent }
            );
            setNewSubContent('');
            fetchSubTasks(editingTask.id);
            fetchData();
        } catch (err) {
            alert("Lỗi thêm subtask");
        }
    };

    const handleToggleSub = async (subId: number, current: boolean) => {
        if (!editingTask) return;
        try {
            await api.patch(`/api/tasks/subtasks/${subId}`,
                { isDone: !current }
            );
            fetchSubTasks(editingTask.id);
            fetchData();
        } catch (err) {
            alert("Lỗi toggle subtask");
        }
    };

    const handleSaveTaskInfo = async () => {
        if (!editingTask) return;
        setIsUpdating(true);
        try {
            await api.put(`/api/project/${editingTask.projectId}/tasks/${editingTask.id}`,
                {
                    title: editTitle,
                    description: editDesc,
                    priority: editPriority,
                    dueDate: editDueDate || null
                }
            );

            setIsEditingTask(false);
            setEditingTask({
                ...editingTask,
                title: editTitle,
                description: editDesc,
                priority: editPriority,
                dueDate: editDueDate || null
            });
            fetchData();
        } catch (err: any) {
            alert("Không thể cập nhật công việc");
        } finally {
            setIsUpdating(false);
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
                <span>Đang tải công việc cá nhân...</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Công việc của tôi</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        {viewMode === 'kanban' 
                            ? 'Bảng Kanban kéo thả theo dõi tất cả nhiệm vụ được phân công' 
                            : 'Danh sách chi tiết tất cả nhiệm vụ được phân công'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'kanban'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Bảng Kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'list'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <List className="w-3.5 h-3.5" />
                            <span>Danh sách</span>
                        </button>
                    </div>

                    {/* Priority Filter tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setActiveFilter(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    activeFilter === p
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {p === 'ALL' ? 'Tất cả' : p === 'HIGH' ? 'Cao' : p === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area: Kanban vs List View */}
            {viewMode === 'kanban' ? (
                /* Kanban Board */
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 flex-1 items-start">
                        {Object.entries(columns).map(([colId, col]) => {
                            const filteredItems = col.items.filter(item => activeFilter === 'ALL' || item.priority === activeFilter);

                            return (
                                <div key={colId} className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/60 flex flex-col max-h-[calc(100vh-220px)] shadow-2xs">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${
                                                colId === 'TODO' ? 'bg-slate-400' :
                                                colId === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                colId === 'REVIEW' ? 'bg-purple-500' : 'bg-emerald-500'
                                            }`} />
                                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col.name}</h3>
                                        </div>
                                        <span className="text-[11px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                                            {filteredItems.length}
                                        </span>
                                    </div>

                                    {/* Droppable Area */}
                                    <Droppable droppableId={colId}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 min-h-[150px] transition-colors rounded-xl p-1 ${
                                                    snapshot.isDraggingOver ? 'bg-blue-50/50 border-2 border-dashed border-blue-300' : ''
                                                }`}
                                            >
                                                {filteredItems.map((task, index) => {
                                                    const proj = projectsMap[task.projectId];

                                                    return (
                                                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    onClick={() => handleOpenEditModal(task)}
                                                                    className={`bg-white p-4 rounded-xl border border-slate-200/80 cursor-pointer group space-y-3 transition-colors ${
                                                                        snapshot.isDragging ? 'shadow-2xl border-blue-500 ring-2 ring-blue-400/30' : 'hover:shadow-md'
                                                                    }`}
                                                                >
                                                                    {/* Project Name Badge */}
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md line-clamp-1 max-w-[140px]">
                                                                            {proj?.name || `Dự án #${task.projectId}`}
                                                                        </span>
                                                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                                                                            {task.priority === 'HIGH' ? 'Cao' : task.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                                                        </span>
                                                                    </div>

                                                                    {/* Task Title & Description */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                            {task.title}
                                                                        </h4>
                                                                        {task.description && (
                                                                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                                                                {task.description}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Progress Bar */}
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                                                            <span>Tiến độ</span>
                                                                            <span>{task.progress}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                                                                        </div>
                                                                    </div>

                                                                    {/* Footer details */}
                                                                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                                                                        <span className="flex items-center gap-1 font-medium">
                                                                            <Clock className="w-3 h-3 text-slate-400" />
                                                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '--'}
                                                                        </span>
                                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                    {/* Search & Filter Bar for List View */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm công việc theo tên, mô tả..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">
                            Tổng số: <strong className="text-blue-600 font-bold">
                                {Object.values(columns)
                                    .flatMap(col => col.items)
                                    .filter(t => (activeFilter === 'ALL' || t.priority === activeFilter) &&
                                        (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                         (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())))
                                    ).length}
                            </strong> công việc
                        </span>
                    </div>

                    {/* List View Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold border-b border-slate-200">
                                    <th className="py-3 px-4">Tên công việc</th>
                                    <th className="py-3 px-4">Dự án</th>
                                    <th className="py-3 px-4">Trạng thái</th>
                                    <th className="py-3 px-4">Ưu tiên</th>
                                    <th className="py-3 px-4">Tiến độ</th>
                                    <th className="py-3 px-4">Hạn chót</th>
                                    <th className="py-3 px-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {(() => {
                                    const allTasks = Object.values(columns)
                                        .flatMap(col => col.items)
                                        .filter(t => (activeFilter === 'ALL' || t.priority === activeFilter) &&
                                            (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                             (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())))
                                        );

                                    if (allTasks.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-400">
                                                    Không tìm thấy công việc nào phù hợp.
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return allTasks.map((task) => {
                                        const proj = projectsMap[task.projectId];
                                        return (
                                            <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-3 px-4 max-w-[280px]">
                                                    <div 
                                                        onClick={() => handleOpenEditModal(task)}
                                                        className="cursor-pointer"
                                                    >
                                                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                            {task.title}
                                                        </p>
                                                        {task.description && (
                                                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                                        {proj?.name || `Dự án #${task.projectId}`}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                                        task.status === 'TODO' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                                        task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        task.status === 'REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            task.status === 'TODO' ? 'bg-slate-400' :
                                                            task.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                            task.status === 'REVIEW' ? 'bg-purple-500' : 'bg-emerald-500'
                                                        }`} />
                                                        {task.status === 'TODO' ? 'Cần làm' :
                                                         task.status === 'IN_PROGRESS' ? 'Đang làm' :
                                                         task.status === 'REVIEW' ? 'Chờ duyệt' : 'Đã xong'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 w-36">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                                            <span>{task.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 text-[11px] font-semibold">
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '--'}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenEditModal(task)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Chi tiết</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* EDIT TASK MODAL */}
            {isEditModalOpen && editingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                    {projectsMap[editingTask.projectId]?.name}
                                </span>
                                <h2 className="text-lg font-bold text-slate-900 mt-1">{editingTask.title}</h2>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Left Column: Details & Subtasks */}
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                                {!isEditingTask ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin chi tiết</h4>
                                            <button onClick={() => setIsEditingTask(true)} className="text-xs text-blue-600 font-semibold hover:underline">
                                                Chỉnh sửa
                                            </button>
                                        </div>

                                        <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                                            {editingTask.description || "Chưa có mô tả."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="text-slate-400 font-medium block mb-1">Mức ưu tiên</span>
                                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getPriorityStyle(editingTask.priority)}`}>
                                                    {editingTask.priority}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="text-slate-400 font-medium block mb-1">Thời hạn</span>
                                                <span className="font-bold text-slate-800">
                                                    {editingTask.dueDate ? new Date(editingTask.dueDate).toLocaleDateString('vi-VN') : '--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                        <h4 className="text-xs font-bold text-slate-900">Sửa thông tin công việc</h4>
                                        <input
                                            type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                                            placeholder="Tiêu đề..."
                                        />
                                        <textarea
                                            value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 resize-none"
                                            placeholder="Mô tả..."
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none">
                                                <option value="LOW">LOW</option>
                                                <option value="MEDIUM">MEDIUM</option>
                                                <option value="HIGH">HIGH</option>
                                            </select>
                                            <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none" />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={() => setIsEditingTask(false)} className="flex-1 bg-slate-200 text-slate-700 py-1.5 rounded-xl text-xs font-medium">Hủy</button>
                                            <button onClick={handleSaveTaskInfo} disabled={isUpdating} className="flex-1 bg-blue-600 text-white py-1.5 rounded-xl text-xs font-medium hover:bg-blue-700">Lưu</button>
                                        </div>
                                    </div>
                                )}

                                {/* Subtasks Checklist */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtasks Checklist</h4>
                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                            {subTasks.filter(s => s.isDone || s.done).length}/{subTasks.length}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text" value={newSubContent} onChange={(e) => setNewSubContent(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                                            placeholder="Thêm mục checklist..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-blue-500"
                                        />
                                        <button onClick={handleAddSubTask} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700">
                                            Thêm
                                        </button>
                                    </div>

                                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                                        {subTasks.map(sub => (
                                            <div key={sub.id} onClick={() => handleToggleSub(sub.id, sub.isDone || sub.done || false)}
                                                className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/80 transition">
                                                <input type="checkbox" checked={sub.isDone || sub.done || false} readOnly
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 pointer-events-none" />
                                                <span className={`text-xs font-medium flex-1 ${(sub.isDone || sub.done) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {sub.content}
                                                </span>
                                            </div>
                                        ))}
                                        {subTasks.length === 0 && <p className="text-xs text-slate-400 text-center py-3 font-medium">Chưa có checklist nào.</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Comments */}
                            <div className="w-full md:w-[320px] bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-200/80 flex flex-col">
                                <div className="p-4 border-b border-slate-200/80 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Bình luận ({comments.length})</span>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                                    {comments.map((c) => (
                                        <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-xs space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-900">{c.userName || c.userEmail}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">{c.content}</p>
                                        </div>
                                    ))}
                                    {comments.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có bình luận.</p>}
                                </div>

                                <div className="p-3 bg-white border-t border-slate-200/80 flex gap-2">
                                    <input 
                                        type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} 
                                        placeholder="Ý kiến thảo luận..." 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-blue-500" 
                                    />
                                    <button onClick={handleSendComment} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
