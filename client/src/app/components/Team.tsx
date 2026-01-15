import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Mail, Phone, MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  status: "active" | "busy" | "away";
  projects: number;
  tasksCompleted: number;
  tasksTotal: number;
  performance: number;
}

export function Team() {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      role: "UI/UX Designer",
      email: "nguyenvana@example.com",
      phone: "0123 456 789",
      avatar: "NVA",
      status: "active",
      projects: 3,
      tasksCompleted: 24,
      tasksTotal: 30,
      performance: 85,
    },
    {
      id: 2,
      name: "Trần Thị B",
      role: "Backend Developer",
      email: "tranthib@example.com",
      phone: "0123 456 790",
      avatar: "TTB",
      status: "busy",
      projects: 4,
      tasksCompleted: 32,
      tasksTotal: 40,
      performance: 90,
    },
    {
      id: 3,
      name: "Lê Văn C",
      role: "Frontend Developer",
      email: "levanc@example.com",
      phone: "0123 456 791",
      avatar: "LVC",
      status: "active",
      projects: 2,
      tasksCompleted: 18,
      tasksTotal: 25,
      performance: 75,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      role: "QA Engineer",
      email: "phamthid@example.com",
      phone: "0123 456 792",
      avatar: "PTD",
      status: "active",
      projects: 3,
      tasksCompleted: 28,
      tasksTotal: 32,
      performance: 88,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      role: "DevOps Engineer",
      email: "hoangvane@example.com",
      phone: "0123 456 793",
      avatar: "HVE",
      status: "away",
      projects: 2,
      tasksCompleted: 15,
      tasksTotal: 20,
      performance: 80,
    },
    {
      id: 6,
      name: "Vũ Thị F",
      role: "Product Manager",
      email: "vuthif@example.com",
      phone: "0123 456 794",
      avatar: "VTF",
      status: "active",
      projects: 5,
      tasksCompleted: 40,
      tasksTotal: 45,
      performance: 92,
    },
  ];

  const getStatusBadge = (status: TeamMember["status"]) => {
    const statusMap = {
      active: { label: "Đang hoạt động", className: "bg-green-100 text-green-700" },
      busy: { label: "Bận", className: "bg-orange-100 text-orange-700" },
      away: { label: "Vắng mặt", className: "bg-gray-100 text-gray-700" },
    };
    return statusMap[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Nhóm</h2>
          <p className="text-gray-600">Quản lý thành viên trong nhóm</p>
        </div>
        <Button className="gap-2">
          <Plus size={20} />
          Thêm thành viên
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Tổng thành viên</p>
          <p className="text-3xl mt-2">{teamMembers.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Đang hoạt động</p>
          <p className="text-3xl mt-2">{teamMembers.filter(m => m.status === "active").length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Tổng dự án</p>
          <p className="text-3xl mt-2">{teamMembers.reduce((sum, m) => sum + m.projects, 0)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Hiệu suất TB</p>
          <p className="text-3xl mt-2">
            {Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length)}%
          </p>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const status = getStatusBadge(member.status);
          
          return (
            <Card key={member.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                    <DropdownMenuItem>Gửi tin nhắn</DropdownMenuItem>
                    <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Badge className={status.className}>{status.label}</Badge>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{member.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dự án tham gia</span>
                  <span>{member.projects}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Nhiệm vụ</span>
                  <span>{member.tasksCompleted}/{member.tasksTotal}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Hiệu suất</span>
                    <span>{member.performance}%</span>
                  </div>
                  <Progress value={member.performance} className="h-2" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
