import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Plus, Calendar, User, LayoutGrid, List } from "lucide-react";
import { cn } from "./ui/utils";
import { KanbanBoard } from "./KanbanBoard";

interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "review" | "done";
  completed: boolean;
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Thiết kế giao diện trang chủ",
      project: "Website Marketing",
      assignee: "Nguyễn Văn A",
      dueDate: "12/01/2026",
      priority: "high",
      status: "in-progress",
      completed: false,
    },
    {
      id: 2,
      title: "Viết API đăng nhập",
      project: "Mobile App v2.0",
      assignee: "Trần Thị B",
      dueDate: "13/01/2026",
      priority: "high",
      status: "in-progress",
      completed: false,
    },
    {
      id: 3,
      title: "Test chức năng thanh toán",
      project: "E-commerce Platform",
      assignee: "Lê Văn C",
      dueDate: "14/01/2026",
      priority: "medium",
      status: "review",
      completed: false,
    },
    {
      id: 4,
      title: "Cập nhật tài liệu hướng dẫn",
      project: "CRM System",
      assignee: "Phạm Thị D",
      dueDate: "11/01/2026",
      priority: "low",
      status: "done",
      completed: true,
    },
    {
      id: 5,
      title: "Tối ưu hiệu suất database",
      project: "Dashboard Analytics",
      assignee: "Hoàng Văn E",
      dueDate: "15/01/2026",
      priority: "high",
      status: "todo",
      completed: false,
    },
    {
      id: 6,
      title: "Thiết kế logo mới",
      project: "Website Marketing",
      assignee: "Nguyễn Văn A",
      dueDate: "16/01/2026",
      priority: "medium",
      status: "todo",
      completed: false,
    },
    {
      id: 7,
      title: "Code review module báo cáo",
      project: "CRM System",
      assignee: "Trần Thị B",
      dueDate: "12/01/2026",
      priority: "medium",
      status: "in-progress",
      completed: false,
    },
    {
      id: 8,
      title: "Viết unit test",
      project: "Mobile App v2.0",
      assignee: "Lê Văn C",
      dueDate: "17/01/2026",
      priority: "low",
      status: "todo",
      completed: false,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "review" | "done">("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const filteredTasks = filter === "all" 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-orange-100 text-orange-700",
      low: "bg-blue-100 text-blue-700",
    };
    return colors[priority];
  };

  const getStatusLabel = (status: Task["status"]) => {
    const labels = {
      todo: "Cần làm",
      "in-progress": "Đang làm",
      review: "Đang review",
      done: "Hoàn thành",
    };
    return labels[status];
  };

  const toggleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, status: !task.completed ? "done" : "in-progress" }
        : task
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Nhiệm vụ</h2>
          <p className="text-gray-600">Quản lý và theo dõi nhiệm vụ của bạn</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode("list")}
            >
              <List size={18} />
              Danh sách
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid size={18} />
              Kanban
            </Button>
          </div>
          <Button className="gap-2">
            <Plus size={20} />
            Tạo nhiệm vụ mới
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { key: "all", label: "Tất cả" },
              { key: "todo", label: "Cần làm" },
              { key: "in-progress", label: "Đang làm" },
              { key: "review", label: "Đang review" },
              { key: "done", label: "Hoàn thành" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={cn(
                  "px-4 py-2 border-b-2 transition-colors",
                  filter === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                {label} ({statusCounts[key as keyof typeof statusCounts]})
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskComplete(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3
                          className={cn(
                            "text-base mb-1",
                            task.completed && "line-through text-gray-500"
                          )}
                        >
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600">{task.project}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === "high" ? "Cao" : task.priority === "medium" ? "TB" : "Thấp"}
                        </Badge>
                        <Badge variant="outline">{getStatusLabel(task.status)}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không có nhiệm vụ nào
            </div>
          )}
        </>
      ) : (
        <KanbanBoard />
      )}
    </div>
  );
}