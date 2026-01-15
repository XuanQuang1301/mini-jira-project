import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Plus, MoreVertical, Calendar, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: "active" | "completed" | "on-hold";
  priority: "high" | "medium" | "low";
  dueDate: string;
  team: number;
  tasks: { total: number; completed: number };
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Website Marketing",
      description: "Thiết kế và phát triển website mới cho chiến dịch marketing",
      progress: 85,
      status: "active",
      priority: "high",
      dueDate: "15/01/2026",
      team: 5,
      tasks: { total: 24, completed: 20 },
    },
    {
      id: 2,
      name: "Mobile App v2.0",
      description: "Nâng cấp ứng dụng di động lên phiên bản 2.0",
      progress: 60,
      status: "active",
      priority: "high",
      dueDate: "20/01/2026",
      team: 7,
      tasks: { total: 35, completed: 21 },
    },
    {
      id: 3,
      name: "CRM System",
      description: "Triển khai hệ thống CRM cho công ty",
      progress: 45,
      status: "active",
      priority: "medium",
      dueDate: "25/01/2026",
      team: 4,
      tasks: { total: 42, completed: 19 },
    },
    {
      id: 4,
      name: "Dashboard Analytics",
      description: "Xây dựng dashboard phân tích dữ liệu",
      progress: 90,
      status: "active",
      priority: "medium",
      dueDate: "12/01/2026",
      team: 3,
      tasks: { total: 18, completed: 16 },
    },
    {
      id: 5,
      name: "E-commerce Platform",
      description: "Phát triển nền tảng thương mại điện tử",
      progress: 30,
      status: "active",
      priority: "low",
      dueDate: "30/01/2026",
      team: 6,
      tasks: { total: 50, completed: 15 },
    },
    {
      id: 6,
      name: "Internal Tools",
      description: "Công cụ nội bộ cho nhân viên",
      progress: 100,
      status: "completed",
      priority: "low",
      dueDate: "05/01/2026",
      team: 2,
      tasks: { total: 12, completed: 12 },
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: Project["status"]) => {
    const statusMap = {
      active: { label: "Đang thực hiện", variant: "default" as const },
      completed: { label: "Hoàn thành", variant: "secondary" as const },
      "on-hold": { label: "Tạm dừng", variant: "outline" as const },
    };
    return statusMap[status];
  };

  const getPriorityBadge = (priority: Project["priority"]) => {
    const priorityMap = {
      high: { label: "Cao", className: "bg-red-100 text-red-700 hover:bg-red-100" },
      medium: { label: "Trung bình", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
      low: { label: "Thấp", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    };
    return priorityMap[priority];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Dự án</h2>
          <p className="text-gray-600">Quản lý tất cả các dự án của bạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Tạo dự án mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo dự án mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên dự án</Label>
                <Input id="name" placeholder="Nhập tên dự án" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" placeholder="Mô tả dự án" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Độ ưu tiên</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Tạo dự án
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const status = getStatusBadge(project.status);
          const priority = getPriorityBadge(project.priority);
          
          return (
            <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge className={priority.className}>{priority.label}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Tiến độ</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar size={16} />
                    <span>{project.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users size={16} />
                    <span>{project.team} thành viên</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span>{project.tasks.completed}/{project.tasks.total} nhiệm vụ hoàn thành</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
