import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Download, FileText, Table as TableIcon, TrendingUp, Users, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export function Reports() {
  const [timeRange, setTimeRange] = useState("6months");
  const [reportType, setReportType] = useState("overview");

  // Data for charts
  const performanceData = [
    { month: "T7/2025", planned: 20, completed: 18, efficiency: 90 },
    { month: "T8/2025", planned: 25, completed: 23, efficiency: 92 },
    { month: "T9/2025", planned: 22, completed: 20, efficiency: 91 },
    { month: "T10/2025", planned: 28, completed: 25, efficiency: 89 },
    { month: "T11/2025", planned: 30, completed: 28, efficiency: 93 },
    { month: "T12/2025", planned: 26, completed: 24, efficiency: 92 },
    { month: "T1/2026", planned: 24, completed: 22, efficiency: 92 },
  ];

  const resourceData = [
    { name: "Design", hours: 320, percentage: 25 },
    { name: "Development", hours: 520, percentage: 40 },
    { name: "Testing", hours: 200, percentage: 15 },
    { name: "Management", hours: 160, percentage: 12 },
    { name: "Documentation", hours: 100, percentage: 8 },
  ];

  const teamPerformanceData = [
    { name: "Nguyễn Văn A", tasksCompleted: 24, tasksTotal: 30, efficiency: 85, hours: 160 },
    { name: "Trần Thị B", tasksCompleted: 32, tasksTotal: 40, efficiency: 90, hours: 168 },
    { name: "Lê Văn C", tasksCompleted: 18, tasksTotal: 25, efficiency: 75, hours: 152 },
    { name: "Phạm Thị D", tasksCompleted: 28, tasksTotal: 32, efficiency: 88, hours: 160 },
    { name: "Hoàng Văn E", tasksCompleted: 15, tasksTotal: 20, efficiency: 80, hours: 144 },
    { name: "Vũ Thị F", tasksCompleted: 40, tasksTotal: 45, efficiency: 92, hours: 172 },
  ];

  const projectStatusData = [
    { name: "Hoàn thành đúng hạn", value: 65, color: "#10b981" },
    { name: "Hoàn thành trễ", value: 15, color: "#f59e0b" },
    { name: "Đang thực hiện", value: 15, color: "#3b82f6" },
    { name: "Tạm dừng", value: 5, color: "#6b7280" },
  ];

  const budgetData = [
    { month: "T7/2025", planned: 100, actual: 95 },
    { month: "T8/2025", planned: 120, actual: 118 },
    { month: "T9/2025", planned: 110, actual: 105 },
    { month: "T10/2025", planned: 130, actual: 135 },
    { month: "T11/2025", planned: 140, actual: 138 },
    { month: "T12/2025", planned: 125, actual: 122 },
    { month: "T1/2026", planned: 115, actual: 110 },
  ];

  const exportToCSV = () => {
    const headers = ["Tên", "Nhiệm vụ hoàn thành", "Tổng nhiệm vụ", "Hiệu suất (%)", "Giờ làm việc"];
    const rows = teamPerformanceData.map((member) => [
      member.name,
      member.tasksCompleted,
      member.tasksTotal,
      member.efficiency,
      member.hours,
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bao-cao-hieu-suat-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Mock PDF export - in real app, would use library like jsPDF
    alert("Xuất PDF: Tính năng này sẽ tạo file PDF với tất cả biểu đồ và bảng dữ liệu");
  };

  const exportToExcel = () => {
    // Mock Excel export - in real app, would use library like xlsx
    alert("Xuất Excel: Tính năng này sẽ tạo file Excel với các sheet dữ liệu chi tiết");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Báo cáo</h2>
          <p className="text-gray-600">Phân tích hiệu suất và xuất dữ liệu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportToCSV}>
            <TableIcon size={20} />
            Xuất CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportToExcel}>
            <FileText size={20} />
            Xuất Excel
          </Button>
          <Button className="gap-2" onClick={exportToPDF}>
            <Download size={20} />
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-2 block">Loại báo cáo</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Tổng quan</SelectItem>
                <SelectItem value="performance">Hiệu suất</SelectItem>
                <SelectItem value="resources">Nguồn lực</SelectItem>
                <SelectItem value="budget">Ngân sách</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-2 block">Khoảng thời gian</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 tháng</SelectItem>
                <SelectItem value="3months">3 tháng</SelectItem>
                <SelectItem value="6months">6 tháng</SelectItem>
                <SelectItem value="1year">1 năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Hiệu suất trung bình</p>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-3xl mb-1">91%</p>
          <p className="text-sm text-green-600">+3% so với kỳ trước</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Dự án hoàn thành</p>
            <FileText className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl mb-1">156</p>
          <p className="text-sm text-blue-600">+12 dự án mới</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Tổng giờ làm việc</p>
            <Clock className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl mb-1">1,300</p>
          <p className="text-sm text-gray-600">giờ trong tháng</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Thành viên hoạt động</p>
            <Users className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl mb-1">24</p>
          <p className="text-sm text-purple-600">6 nhóm làm việc</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg mb-4">Hiệu suất theo thời gian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="planned"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                name="Kế hoạch"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                name="Hoàn thành"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg mb-4">Trạng thái dự án</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg mb-4">Phân bổ nguồn lực</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="hours" fill="#3b82f6" name="Giờ làm việc" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg mb-4">Ngân sách theo thời gian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Kế hoạch (triệu)"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                name="Thực tế (triệu)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Hiệu suất nhóm</h3>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
            <Download size={16} />
            Xuất dữ liệu
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thành viên</TableHead>
              <TableHead>Nhiệm vụ</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Hiệu suất</TableHead>
              <TableHead>Giờ làm việc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamPerformanceData.map((member) => (
              <TableRow key={member.name}>
                <TableCell>{member.name}</TableCell>
                <TableCell>
                  {member.tasksCompleted}/{member.tasksTotal}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(member.tasksCompleted / member.tasksTotal) * 100}
                      className="h-2 w-24"
                    />
                    <span className="text-sm text-gray-600">
                      {Math.round((member.tasksCompleted / member.tasksTotal) * 100)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      member.efficiency >= 90
                        ? "bg-green-100 text-green-700"
                        : member.efficiency >= 80
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  >
                    {member.efficiency}%
                  </Badge>
                </TableCell>
                <TableCell>{member.hours}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg mb-3">Tóm tắt báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-2">
              <strong>Điểm mạnh:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Hiệu suất tăng 3% so với kỳ trước</li>
              <li>92% dự án hoàn thành đúng hoặc trước hạn</li>
              <li>Tỷ lệ sử dụng nguồn lực tối ưu ở mức 91%</li>
            </ul>
          </div>
          <div>
            <p className="text-gray-600 mb-2">
              <strong>Cần cải thiện:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>5% dự án bị tạm dừng, cần đánh giá lại</li>
              <li>Một số thành viên có tỷ lệ hoàn thành dưới 80%</li>
              <li>Chi phí thực tế vượt kế hoạch 4% trong tháng 10</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
