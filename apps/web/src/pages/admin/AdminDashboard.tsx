import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import {
  Users, FolderKanban, ArrowRight, UserCheck, UserX,
  Settings, Activity, Search, Shield,
  TrendingUp, BarChart3, Clock, CheckCircle2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

function CustomAdminDonutTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
          <span className="font-bold text-slate-100">{data.name}</span>
        </div>
        <div className="text-slate-300 font-medium text-[11px] flex items-center justify-between gap-3 border-t border-slate-800 pt-1.5">
          <span>Số lượng: <strong className="text-white font-bold">{data.value}</strong></span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"monthly" | "quarterly" | "yearly">("monthly");

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

  // Build bar chart data from projects/users dynamically based on activeTab
  const currentYear = new Date().getFullYear();
  let barChartData: any[] = [];

  if (activeTab === "monthly") {
    const monthLabels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    barChartData = Array.from({ length: 12 }, (_, i) => ({ name: monthLabels[i], projects: 0, users: 0 }));
    projects.forEach(p => {
      const d = p.createdAt ? new Date(p.createdAt) : null;
      if (d && d.getFullYear() === currentYear) barChartData[d.getMonth()].projects += 1;
    });
    users.forEach(u => {
      const d = u.createdAt ? new Date(u.createdAt) : null;
      if (d && d.getFullYear() === currentYear) barChartData[d.getMonth()].users += 1;
    });
  } else if (activeTab === "quarterly") {
    barChartData = [
      { name: "Quý 1", projects: 0, users: 0 },
      { name: "Quý 2", projects: 0, users: 0 },
      { name: "Quý 3", projects: 0, users: 0 },
      { name: "Quý 4", projects: 0, users: 0 },
    ];
    projects.forEach(p => {
      const d = p.createdAt ? new Date(p.createdAt) : null;
      if (d && d.getFullYear() === currentYear) {
        const q = Math.floor(d.getMonth() / 3);
        barChartData[q].projects += 1;
      }
    });
    users.forEach(u => {
      const d = u.createdAt ? new Date(u.createdAt) : null;
      if (d && d.getFullYear() === currentYear) {
        const q = Math.floor(d.getMonth() / 3);
        barChartData[q].users += 1;
      }
    });
  } else {
    // yearly
    const years = [currentYear - 2, currentYear - 1, currentYear];
    barChartData = years.map(y => ({ name: `${y}`, projects: 0, users: 0 }));
    projects.forEach(p => {
      const d = p.createdAt ? new Date(p.createdAt) : null;
      if (d) {
        const idx = years.indexOf(d.getFullYear());
        if (idx !== -1) barChartData[idx].projects += 1;
      }
    });
    users.forEach(u => {
      const d = u.createdAt ? new Date(u.createdAt) : null;
      if (d) {
        const idx = years.indexOf(d.getFullYear());
        if (idx !== -1) barChartData[idx].users += 1;
      }
    });
  }

  // Donut data
  const donutData = [
    { name: "Hoạt động", value: activeUsersCount, color: "#2563EB" },
    { name: "Bị khóa", value: lockedUsersCount, color: "#EF4444" },
    { name: "Dự án", value: projects.length, color: "#F59E0B" },
  ].filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-slate-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: "Tổng người dùng",
      value: users.length,
      sub: `${activeUsersCount} đang hoạt động`,
      icon: <Users className="w-5 h-5" />,
      iconBg: "bg-blue-50 text-blue-600",
      valueColor: "text-slate-900",
    },
    {
      label: "Tài khoản hoạt động",
      value: activeUsersCount,
      sub: "Không bị khóa",
      icon: <UserCheck className="w-5 h-5" />,
      iconBg: "bg-emerald-50 text-emerald-600",
      valueColor: "text-emerald-600",
    },
    {
      label: "Tổng dự án",
      value: projects.length,
      sub: "Trên toàn hệ thống",
      icon: <FolderKanban className="w-5 h-5" />,
      iconBg: "bg-amber-50 text-amber-600",
      valueColor: "text-slate-900",
    },
    {
      label: "Tài khoản bị khóa",
      value: lockedUsersCount,
      sub: "Cần xem xét",
      icon: <UserX className="w-5 h-5" />,
      iconBg: "bg-rose-50 text-rose-600",
      valueColor: "text-rose-600",
    },
  ];

  // Recent activity from users + projects mixed
  const recentActivity = [
    ...users.slice(0, 3).map(u => ({
      id: `u-${u.id}`,
      title: u.name || u.email || "Người dùng mới",
      sub: u.email,
      date: u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—",
      tag: u.isLocked ? "Bị khóa" : "Tài khoản mới",
      tagColor: u.isLocked ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-blue-50 text-blue-600 border-blue-200",
      icon: <Users className="w-3.5 h-3.5" />,
      iconBg: "bg-blue-100 text-blue-600",
    })),
    ...projects.slice(0, 2).map(p => ({
      id: `p-${p.id}`,
      title: p.name || "Dự án mới",
      sub: `Mã: ${p.key || "N/A"}`,
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "—",
      tag: "Dự án",
      tagColor: "bg-amber-50 text-amber-600 border-amber-200",
      icon: <FolderKanban className="w-3.5 h-3.5" />,
      iconBg: "bg-amber-100 text-amber-600",
    })),
  ];

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in font-sans antialiased text-slate-800 pb-10">

      {/* ── ROW 1: Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Tổng quan quản trị hệ thống Mini Jira</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all w-48"
            />
          </div>
          {/* Notification Bell */}
          <NotificationBell />
          {/* Admin badge */}
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-tight">{card.label}</p>
            </div>
            <h3 className={`text-3xl font-extrabold tracking-tight ${card.valueColor}`}>{card.value}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── ROW 3: Bar Chart (2/3) + Donut (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Hoạt động hệ thống
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Dự án mới
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" /> Người dùng mới
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {(["monthly", "quarterly", "yearly"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    activeTab === tab ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "monthly" ? "Tháng" : tab === "quarterly" ? "Quý" : "Năm"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '12px' }}
                  formatter={(value: any, name: string) => [value, name === 'projects' ? 'Dự án mới' : 'Người dùng mới']}
                />
                <Bar dataKey="projects" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="users" fill="#BFDBFE" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Phân bổ hệ thống</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Người dùng & Dự án</p>
          </div>

          {donutData.length > 0 ? (
            <>
              <div className="relative flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomAdminDonutTooltip />} />
                    <Pie
                      data={donutData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={68}
                      paddingAngle={3} dataKey="value" stroke="#ffffff" strokeWidth={2}
                    >
                      {donutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{users.length + projects.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Tổng</span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 space-y-2">
                {donutData.map((item, i) => {
                  const total = donutData.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.value}</span>
                        <span className="text-slate-400 font-medium">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* ── ROW 4: Recent Activity + User Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" />
              Hoạt động gần đây
            </h3>
            <Link to="/admin/users" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-6">Chưa có hoạt động</p>
            ) : recentActivity.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/30 transition-all">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{item.sub} · {item.date}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Quick nav */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { to: "/admin/projects", label: "Dự án", icon: <FolderKanban className="w-3.5 h-3.5" />, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { to: "/admin/users", label: "Users", icon: <Users className="w-3.5 h-3.5" />, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { to: "/admin/system", label: "Hệ thống", icon: <Settings className="w-3.5 h-3.5" />, color: "text-slate-600 bg-slate-100 border-slate-200" },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center hover:shadow-sm transition-all ${item.color}`}
              >
                {item.icon}
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              Danh sách tài khoản
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredUsers.length} / {users.length} tài khoản
              </span>
              <Link to="/admin/users" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
                Tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide pr-4">Tài khoản</th>
                  <th className="pb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide pr-4">Email</th>
                  <th className="pb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(searchQuery ? filteredUsers : users).slice(0, 6).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {(u.name || u.email || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-900 truncate max-w-[100px]">
                          {u.name || "Chưa đặt tên"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-slate-500 font-medium truncate block max-w-[140px]">{u.email}</span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        u.locked || u.isLocked
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {u.locked || u.isLocked
                          ? <><UserX className="w-2.5 h-2.5" /> Bị khóa</>
                          : <><CheckCircle2 className="w-2.5 h-2.5" /> Hoạt động</>
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(searchQuery ? filteredUsers : users).length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">Không tìm thấy tài khoản nào</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
