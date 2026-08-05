import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { 
  Users, 
  FolderKanban, 
  ArrowRight,
  UserCheck,
  UserX,
  Sparkles,
  Settings,
  ShieldCheck,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          api.get("/api/users").catch(() => ({ data: [] })),
          api.get("/api/project/all").catch(() => api.get("/api/project/my")).catch(() => ({ data: [] }))
        ]);

        setUsers(usersRes.data || []);
        setProjects(projectsRes.data || []);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const lockedUsersCount = users.filter((u) => u.locked || u.isLocked).length;
  const activeUsersCount = users.length - lockedUsersCount;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-800 text-xs font-semibold gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        <span>Đang nạp dữ liệu Tổng quan Quản trị...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans antialiased text-slate-800">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Tổng Quan Hệ Thống Admin</span>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-200 font-bold">
              Hệ thống hoạt động
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Bảng điều khiển trung tâm giám sát hệ thống Mini Jira
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/projects"
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <FolderKanban className="w-4 h-4 text-white" />
            <span>Vào Quản lý dự án</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          to="/admin/users" 
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{users.length}</h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {activeUsersCount} tài khoản hoạt động
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center transition-transform group-hover:scale-105">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/users" 
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tài khoản bị khóa</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{lockedUsersCount}</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                <UserX className="w-3.5 h-3.5 text-rose-500" /> Đang tạm khóa
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/projects" 
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng số dự án</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{projects.length}</h3>
              <p className="text-[11px] text-blue-600 mt-1 font-semibold flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-blue-600" /> Dự án trên hệ thống
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/projects"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Quản Lý Dự Án Hệ Thống</h3>
            <p className="text-xs text-slate-500 mt-1">Xem danh sách toàn bộ dự án, thông tin chủ sở hữu và danh sách task trong từng dự án.</p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <span>Mở trang Quản lý dự án</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Quản Lý Người Dùng</h3>
            <p className="text-xs text-slate-500 mt-1">Quản lý danh sách thành viên, mở khóa hoặc khóa tài khoản trong hệ thống.</p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-purple-600">
            <span>Mở trang Quản lý người dùng</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/system"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-900 transition-colors">Cấu Hình Hệ Thống</h3>
            <p className="text-xs text-slate-500 mt-1">Xem cấu hình cổng dịch vụ, phiên bản ứng dụng và định hướng tính năng tương lai.</p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Mở Cấu hình hệ thống</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Registered Users Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">Danh sách tài khoản hệ thống gần đây</h3>
          </div>
          <Link to="/admin/users" className="text-xs text-blue-600 hover:underline font-bold">
            Xem tất cả ({users.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold text-[11px] uppercase">
                <th className="py-2.5 px-3">Thành viên</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.slice(0, 5).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                      {u.name ? u.name.substring(0, 2).toUpperCase() : "U"}
                    </div>
                    <span>{u.name || "Chưa đặt tên"}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-medium">{u.email}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.locked || u.isLocked
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold"
                      }`}
                    >
                      {u.locked || u.isLocked ? "Bị khóa" : "Hoạt động"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Future Development Placeholder */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Khu vực mở rộng Dashboard phát triển sau này</span>
          </div>
          <h3 className="text-base font-bold tracking-tight">Sẵn sàng cho Báo cáo Thống kê & Phân tích nâng cao</h3>
          <p className="text-xs text-slate-300">
            Khu vực này sẵn sàng để tích hợp các biểu đồ phân tích thời gian làm việc, biểu đồ hiệu suất thành viên và báo cáo hệ thống.
          </p>
        </div>
        <Link
          to="/admin/projects"
          className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all shadow-xs"
        >
          Quản lý dự án ngay
        </Link>
      </div>
    </div>
  );
}
