import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Calendar, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  description: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface DragItem {
  id: number;
  columnId: string;
}

function TaskCard({ task, columnId }: { task: Task; columnId: string }) {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-orange-100 text-orange-700",
      low: "bg-blue-100 text-blue-700",
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: Task["priority"]) => {
    const labels = {
      high: "Cao",
      medium: "TB",
      low: "Thấp",
    };
    return labels[priority];
  };

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <Card className="p-4 hover:shadow-md transition-shadow mb-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm flex-1">{task.title}</h4>
            <Badge className={getPriorityColor(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600">{task.project}</p>
          
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  {task.assigneeAvatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{task.assignee}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              <span>{task.dueDate}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KanbanColumn({
  column,
  onDrop,
}: {
  column: Column;
  onDrop: (taskId: number, targetColumnId: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: DragItem) => {
      if (item.columnId !== column.id) {
        onDrop(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getColumnColor = (id: string) => {
    const colors = {
      todo: "border-t-gray-400",
      "in-progress": "border-t-blue-500",
      review: "border-t-orange-500",
      done: "border-t-green-500",
    };
    return colors[id as keyof typeof colors] || "border-t-gray-400";
  };

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] ${isOver ? "bg-blue-50" : ""} transition-colors rounded-lg`}
    >
      <Card className={`h-full border-t-4 ${getColumnColor(column.id)}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base">{column.title}</h3>
            <Badge variant="secondary">{column.tasks.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600">
            <Plus size={16} />
            Thêm nhiệm vụ
          </Button>
        </div>
        <div className="p-4 space-y-3 overflow-auto max-h-[calc(100vh-280px)]">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} columnId={column.id} />
          ))}
          {column.tasks.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              Kéo thả nhiệm vụ vào đây
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "Cần làm",
      tasks: [
        {
          id: 5,
          title: "Tối ưu hiệu suất database",
          project: "Dashboard Analytics",
          assignee: "Hoàng Văn E",
          assigneeAvatar: "HVE",
          dueDate: "15/01/2026",
          priority: "high",
          description: "Cần tối ưu các query và index để cải thiện tốc độ",
        },
        {
          id: 6,
          title: "Thiết kế logo mới",
          project: "Website Marketing",
          assignee: "Nguyễn Văn A",
          assigneeAvatar: "NVA",
          dueDate: "16/01/2026",
          priority: "medium",
          description: "Thiết kế logo phù hợp với brand identity mới",
        },
        {
          id: 8,
          title: "Viết unit test",
          project: "Mobile App v2.0",
          assignee: "Lê Văn C",
          assigneeAvatar: "LVC",
          dueDate: "17/01/2026",
          priority: "low",
          description: "Viết test coverage cho các module chính",
        },
      ],
    },
    {
      id: "in-progress",
      title: "Đang làm",
      tasks: [
        {
          id: 1,
          title: "Thiết kế giao diện trang chủ",
          project: "Website Marketing",
          assignee: "Nguyễn Văn A",
          assigneeAvatar: "NVA",
          dueDate: "12/01/2026",
          priority: "high",
          description: "Thiết kế UI/UX cho trang chủ website marketing",
        },
        {
          id: 2,
          title: "Viết API đăng nhập",
          project: "Mobile App v2.0",
          assignee: "Trần Thị B",
          assigneeAvatar: "TTB",
          dueDate: "13/01/2026",
          priority: "high",
          description: "Implement authentication API với JWT",
        },
        {
          id: 7,
          title: "Code review module báo cáo",
          project: "CRM System",
          assignee: "Trần Thị B",
          assigneeAvatar: "TTB",
          dueDate: "12/01/2026",
          priority: "medium",
          description: "Review code và đảm bảo quality standards",
        },
      ],
    },
    {
      id: "review",
      title: "Đang review",
      tasks: [
        {
          id: 3,
          title: "Test chức năng thanh toán",
          project: "E-commerce Platform",
          assignee: "Lê Văn C",
          assigneeAvatar: "LVC",
          dueDate: "14/01/2026",
          priority: "medium",
          description: "Test tích hợp với cổng thanh toán và xử lý lỗi",
        },
      ],
    },
    {
      id: "done",
      title: "Hoàn thành",
      tasks: [
        {
          id: 4,
          title: "Cập nhật tài liệu hướng dẫn",
          project: "CRM System",
          assignee: "Phạm Thị D",
          assigneeAvatar: "PTD",
          dueDate: "11/01/2026",
          priority: "low",
          description: "Cập nhật documentation cho version mới",
        },
      ],
    },
  ]);

  const handleDrop = (taskId: number, targetColumnId: string) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      let movedTask: Task | null = null;
      let sourceColumnIndex = -1;

      // Tìm và xóa task từ column cũ
      for (let i = 0; i < newColumns.length; i++) {
        const taskIndex = newColumns[i].tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          movedTask = newColumns[i].tasks[taskIndex];
          newColumns[i].tasks.splice(taskIndex, 1);
          sourceColumnIndex = i;
          break;
        }
      }

      // Thêm task vào column mới
      if (movedTask) {
        const targetColumnIndex = newColumns.findIndex((c) => c.id === targetColumnId);
        if (targetColumnIndex !== -1) {
          newColumns[targetColumnIndex].tasks.push(movedTask);
        }
      }

      return newColumns;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} onDrop={handleDrop} />
        ))}
      </div>
    </DndProvider>
  );
}
