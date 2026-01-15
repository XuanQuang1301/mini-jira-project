import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FolderKanban, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const projectData = [
  { month: "T1", completed: 12, inProgress: 8 },
  { month: "T2", completed: 15, inProgress: 10 },
  { month: "T3", completed: 18, inProgress: 12 },
  { month: "T4", completed: 22, inProgress: 9 },
  { month: "T5", completed: 25, inProgress: 15 },
  { month: "T6", completed: 28, inProgress: 11 },
];

const statusData = [
  { name: "Hoàn thành", value: 45, color: "#10b981" },
  { name: "Đang thực hiện", value: 30, color: "#3b82f6" },
  { name: "Chờ xử lý", value: 15, color: "#f59e0b" },
  { name: "Quá hạn", value: 10, color: "#ef4444" },
];

export function Dashboard() {
  const stats = [
    {
      title: "Tổng dự án",
      value: "24",
      icon: FolderKanban,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Hoàn thành",
      value: "18",
      icon: CheckCircle2,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Đang thực hiện",
      value: "5",
      icon: Clock,
      color: "bg-orange-500",
      change: "+3%",
    },
    {
      title: "Quá hạn",
      value: "1",
      icon: AlertCircle,
      color: "bg-red-500",
      change: "-2%",
    },
  ];

  const recentProjects = [
    { name: "Website Marketing", progress: 85, dueDate: "15/01/2026", status: "on-track" },
    { name: "Mobile App v2.0", progress: 60, dueDate: "20/01/2026", status: "on-track" },
    { name: "CRM System", progress: 45, dueDate: "25/01/2026", status: "at-risk" },
    { name: "Dashboard Analytics", progress: 90, dueDate: "12/01/2026", status: "on-track" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Bảng điều khiển</h2>
        <p className="text-gray-600">Tổng quan về các dự án và nhiệm vụ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} so với tháng trước</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg mb-4">Thống kê dự án theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
              <Bar dataKey="inProgress" fill="#3b82f6" name="Đang thực hiện" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg mb-4">Trạng thái dự án</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="p-6">
        <h3 className="text-lg mb-4">Dự án gần đây</h3>
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <div key={project.name} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span>{project.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Hạn: {project.dueDate}</span>
                    <span className="text-sm">{project.progress}%</span>
                  </div>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              <div>
                {project.status === "on-track" ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Đúng tiến độ
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Cần chú ý
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
