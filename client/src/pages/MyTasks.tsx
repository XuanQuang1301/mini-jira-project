import {useState, useEffect} from 'react'; 
import axios from 'axios'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

interface Task {
    id: string; 
    title: string; 
    description: string; 
    status: string; 
    priority: string; 
    dueDate: string | null; 
    projectId: number; 
}

// Cấu trúc 4 cột Kanban 
interface ColumnData {
    name: string; 
    items: Task []; 
}

interface BoardData{
    [key: string]: ColumnData; 
}

const initialBoard: BoardData = {
    TODO: {name: 'Cần làm', items: []}, 
    IN_PROGRESS: {name: 'Đang làm', items: []}, 
    REVIEW: {name: 'Chờ duyệt', items: []}, 
    DONE: {name: 'Đã xong', items: []}
}; 

export default function MyTasks(){
    const [columns, setColumns] = useState<BoardData> (initialBoard); 
    const [isLoading, setIsLoading] = useState(true); 
    const [projectsMap, setProjectsMap] = useState<Record<number, string>>({});

    // --- 1. GỌI API LẤY TASK CÁ NHÂN VÀ DANH SÁCH DỰ ÁN ---
    useEffect(() => {
        const fetchMyTasksAndProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [tasksRes, projectsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/tasks/my-tasks', config),
                    axios.get('http://localhost:5000/api/projects', config)
                ]);

                // Tạo cuốn từ điển dò tên dự án
                const projMap: Record<number, string> = {};
                projectsRes.data.forEach((p: any) => {
                    projMap[p.id] = p.name;
                });
                setProjectsMap(projMap);

                const fetchedTasks: Task[] = tasksRes.data;
                
                const newBoard: BoardData = {
                    TODO: { name: 'Cần làm', items: [] as Task[] },
                    IN_PROGRESS: { name: 'Đang làm', items: [] as Task[] },
                    REVIEW: { name: 'Chờ duyệt', items: [] as Task[] },
                    DONE: { name: 'Đã xong', items: [] as Task[] }
                };

                fetchedTasks.forEach(task => {
                    if (newBoard[task.status as keyof BoardData]) {
                        newBoard[task.status as keyof BoardData].items.push(task);
                    } else {
                        newBoard.TODO.items.push(task);
                    }
                });

                setColumns(newBoard);
            } catch (error) {
                console.error("Lỗi khi tải công việc cá nhân:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyTasksAndProjects();
    }, []);

    // --- 2. HÀM XỬ LÝ KHI THẢ CHUỘT ---
    const onDragEnd = async (result: DropResult) => {
        if(!result.destination) return 
        const {source, destination, draggableId } = result; 
        
        if(source.droppableId === destination.droppableId && source.index === destination.index) return; 
        
        const sourceColumn = columns[source.droppableId]; 
        const destColumn = columns[destination.droppableId]; 
        const sourceItems = [...sourceColumn.items]; 
        const destItems = [...destColumn.items]; 

        const [removed] = sourceItems.splice(source.index, 1); 
        
        if(source.droppableId !== destination.droppableId){
            removed.status = destination.droppableId; 
            destItems.splice(destination.index, 0, removed); 
            setColumns({
                ...columns, 
                [source.droppableId]: {...sourceColumn, items: sourceItems}, 
                [destination.droppableId]: {...destColumn, items: destItems}, 
            }); 
            try{
                const token = localStorage.getItem('token'); 
                await axios.patch(`http://localhost:5000/api/tasks/${draggableId}/status`, 
                    {status: destination.droppableId}, 
                    {headers: {Authorization: `Bearer ${token}`}}
                );  
            }catch (error){
                console.error("Lỗi cập nhật trạng thái", error);
                alert("Lỗi mạng: Không thể lưu trạng thái"); 
            }
        }else{
            sourceItems.splice(destination.index, 0, removed); 
            setColumns({
                ...columns, 
                [source.droppableId]: {...sourceColumn, items: sourceItems}
            })
        }
    }

    // --- CẬP NHẬT MÀU SẮC LIGHT MODE CHO ƯU TIÊN ---
    const getPriorityStyle = (priority: string) => {
        switch(priority) {
            case 'LOW': return 'bg-gray-100 text-gray-600 border border-gray-200';
            case 'MEDIUM': return 'bg-blue-50 text-blue-600 border border-blue-200';
            case 'HIGH': return 'bg-orange-50 text-orange-600 border border-orange-200 font-bold';
            case 'URGENT': return 'bg-red-50 text-red-600 border border-red-200 font-bold';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if(isLoading) return <div className="p-8 text-blue-600 text-xl font-bold">Đang tải bảng Kanban... ⏳</div>

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Công việc của tôi</h1>
                <p className="text-gray-500 text-sm">Kéo thả các thẻ để cập nhật tiến độ công việc.</p>
            </div>

            {/* KHU VỰC BẢNG KÉO THẢ */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full overflow-x-auto pb-4 items-start">
                    
                    {/* Duyệt qua 4 cột (TODO, IN_PROGRESS, REVIEW, DONE) */}
                    {Object.entries(columns).map(([columnId, column]) => {
                        return (
                            <div key={columnId} className="flex flex-col bg-gray-50/80 rounded-2xl min-w-[320px] w-[320px] border border-gray-200 shadow-sm max-h-full">
                                
                                {/* Tiêu đề Cột */}
                                <div className="p-4 font-bold text-sm uppercase tracking-wide border-b border-gray-200 text-gray-700 flex justify-between items-center bg-white/50 rounded-t-2xl">
                                    <div className="flex items-center gap-2">
                                        {/* Thêm chấm màu nhỏ cho từng cột để nhìn sinh động hơn */}
                                        <div className={`w-2.5 h-2.5 rounded-full ${
                                            columnId === 'TODO' ? 'bg-gray-400' :
                                            columnId === 'IN_PROGRESS' ? 'bg-blue-500' :
                                            columnId === 'REVIEW' ? 'bg-purple-500' : 'bg-green-500'
                                        }`}></div>
                                        {column.name}
                                    </div>
                                    <span className="bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold">
                                        {column.items.length}
                                    </span>
                                </div>

                                {/* Vùng thả Task (Droppable) */}
                                <div className="p-3 flex-1 overflow-y-auto">
                                    <Droppable droppableId={columnId}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`min-h-[150px] transition-colors duration-200 h-full ${
                                                    snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-xl' : ''
                                                }`}
                                            >
                                                {/* Vẽ từng thẻ Task (Draggable) */}
                                                {column.items.map((item, index) => (
                                                    <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-4 mb-3 rounded-xl transition-all duration-200 group ${
                                                                    snapshot.isDragging 
                                                                    ? 'bg-white border-2 border-blue-400 shadow-xl scale-[1.03] rotate-2' 
                                                                    : 'bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                                                                }`}
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 truncate max-w-[150px] uppercase tracking-wider" title={projectsMap[item.projectId] || `Dự án #${item.projectId}`}>
                                                                        {projectsMap[item.projectId] || `Dự án #${item.projectId}`}
                                                                    </span>
                                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${getPriorityStyle(item.priority)}`}>
                                                                        {item.priority}
                                                                    </span>
                                                                </div>
                                                                
                                                                <h3 className="text-gray-900 font-bold mb-1.5 leading-snug group-hover:text-blue-600 transition-colors">
                                                                    {item.title}
                                                                </h3>
                                                                {item.description && (
                                                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed" title={item.description}>
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                                
                                                                {/* Deadline */}
                                                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                                                    <div className={`flex items-center gap-1.5 text-xs font-medium ${item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'DONE' ? 'text-red-500' : 'text-gray-400'}`}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}
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
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    )
}