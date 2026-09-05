import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NotificationBell from '../components/NotificationBell';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    FolderKanban, CheckCircle2, Clock, AlertTriangle,
    ArrowRight, Plus, Search, Shield, ArrowUpRight, ArrowDownRight,
    User, CalendarRange, CheckSquare
} from 'lucide-react';

interface Project {
    id: number;
    name?: string;
    key?: string;
    description?: string;
    createdAt?: string | Date | null;
}

interface Task {
    id: number;
    title?: string;
    status: string;
    dueDate: string | null;
    createdAt?: string | null;
    priority?: string;
}

interface UserProfile {
    id: number;
    name?: string;
    email?: string;
    avatarUrl?: string | null;
}

interface JwtPayload {
    userId: number;
    email: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    DONE:        { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
    IN_PROGRESS: { label: 'Đang làm',   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       icon: <Clock className="w-3 h-3" /> },
    REVIEW:      { label: 'Review',     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     icon: <Clock className="w-3 h-3" /> },
    TODO:        { label: 'Chờ làm',    color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',     icon: <CheckSquare className="w-3 h-3" /> },
};

function MiniSparkBar({ value, max, color }: { value: number; max: number; color: string }) {
    const heights = [0.4, 0.6, 0.8, 0.55, 0.9, 0.7, 1.0];
    return (
        <div className="flex items-end gap-0.5 h-8">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className="w-1.5 rounded-sm opacity-80"
                    style={{
                        height: `${Math.round(h * (value > 0 ? Math.min(value / (max || 1), 1) * 32 + 6 : 8))}px`,
                        backgroundColor: color,
                    }}
                />
            ))}
        </div>
    );
}

function CustomDonutTooltip({ active, payload, total }: any) {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        if (!data) return null;
        if (data.key === 'empty') {
            return (
                <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl font-medium border border-slate-700">
                    Chưa có công việc nào
                </div>
            );
        }
        const pct = total > 0 ? Math.round((data.value / total) * 100) : 0;
        return (
            <div className="bg-slate-900/95 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/80 min-w-[155px]">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                    <span className="font-bold text-slate-100">{data.name}</span>
                </div>
                <div className="text-slate-300 font-medium text-[11px] flex items-center justify-between gap-3 border-t border-slate-800 pt-1.5">
                    <span>Số lượng: <strong className="text-white font-bold">{data.value}</strong> task</span>
                    <span className="text-blue-400 font-bold">({pct}%)</span>
                </div>
            </div>
        );
    }
    return null;
}

export default function Dashboard() {
    const [totalProjects, setTotalProjects] = useState(0);
    const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [inProgressTasks, setInProgressTasks] = useState(0);
    const [todoTasks, setTodoTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [totalTaskCount, setTotalTaskCount] = useState(0);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [areaData, setAreaData] = useState<any[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Decode username from JWT
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                const name = decoded.email?.split('@')[0] || 'bạn';
                setUserName(name.charAt(0).toUpperCase() + name.slice(1));
            } catch { /* ignore */ }
        }

        const fetchData = async () => {
            try {
                const [projectsRes, tasksRes, profileRes] = await Promise.all([
                    api.get('/api/project/my').catch(() => ({ data: [] })),
                    api.get('/api/project/tasks/my-tasks').catch(() => ({ data: [] })),
                    api.get('/api/users/profile').catch(() => ({ data: null })),
                ]);

                const projects: Project[] = projectsRes.data || [];
                const tasks: Task[] = tasksRes.data || [];
                const userProfile: UserProfile = profileRes.data;

                setProfile(userProfile);
                setTotalProjects(projects.length);
                setFeaturedProject(projects[0] || null);

                // Task stats: 3 core categories
                const done = tasks.filter(t => t.status === 'DONE').length;
                const inProg = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;
                const todo = tasks.filter(t => t.status === 'TODO' || !t.status).length;
                const now = new Date();
                const overdue = tasks.filter(t => {
                    if (t.status === 'DONE' || !t.dueDate) return false;
                    return new Date(t.dueDate) < now;
                }).length;

                setCompletedTasks(done);
                setInProgressTasks(inProg);
                setTodoTasks(todo);
                setOverdueTasks(overdue);
                setTotalTaskCount(tasks.length);

                // Recent tasks (last 4, excluding done)
                const activeTasks = tasks
                    .filter(t => t.status !== 'DONE')
                    .slice(0, 4);
                setRecentTasks(activeTasks.length > 0 ? activeTasks : tasks.slice(0, 4));

                // Area chart: tasks completed per month
                const currentYear = new Date().getFullYear();
                const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
                    name: `T${i + 1}`,
                    hoàn_thành: 0,
                    đang_làm: 0,
                }));
                tasks.forEach(t => {
                    const date = t.createdAt ? new Date(t.createdAt) : null;
                    if (date && !isNaN(date.getTime()) && date.getFullYear() === currentYear) {
                        const idx = date.getMonth();
                        if (t.status === 'DONE') monthlyStats[idx].hoàn_thành += 1;
                        else monthlyStats[idx].đang_làm += 1;
                    }
                });
                setAreaData(monthlyStats);

            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-xs font-medium text-slate-500">Đang tải dữ liệu...</span>
            </div>
        );
    }

    const totalTasks = totalTaskCount || (completedTasks + inProgressTasks + todoTasks);
    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Donut data with all 3 parts (Hoàn thành, Đang làm, Cần làm)
    const donutData = totalTasks > 0 ? [
        { name: 'Hoàn thành', value: completedTasks, color: '#10B981', key: 'done' },
        { name: 'Đang làm', value: inProgressTasks, color: '#F59E0B', key: 'in_progress' },
        { name: 'Cần làm', value: todoTasks, color: '#F43F5E', key: 'todo' },
    ].filter(item => item.value > 0) : [
        { name: 'Chưa có công việc', value: 1, color: '#E2E8F0', key: 'empty' }
    ];

    const displayName = profile?.name || userName || 'bạn';
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <div className="h-full flex flex-col pb-10 space-y-5 animate-fade-in font-sans antialiased text-slate-800">

            {/* ────────────────────────────────────────────
                ROW 1 — Greeting + Search
            ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Xin chào, <span className="text-blue-600">{displayName}!</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5 font-medium">
                        Khám phá thông tin và tiến độ công việc của bạn
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search bar */}
                    <div className="relative hidden md:flex items-center">
                        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all w-52"
                        />
                    </div>
                    {/* Notification Bell */}
                    <NotificationBell />
                    {/* Avatar */}
                    <Link to="/profile" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
                        {avatarInitial}
                    </Link>
                </div>
            </div>

            {/* ────────────────────────────────────────────
                ROW 2 — 4 Stat Cards
            ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Projects */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Dự án</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{totalProjects}</h3>
                            <p className="text-[11px] text-blue-600 mt-1.5 font-semibold flex items-center gap-1">
                                <FolderKanban className="w-3 h-3" /> Đang tham gia
                            </p>
                        </div>
                        <MiniSparkBar value={totalProjects} max={10} color="#2563EB" />
                    </div>
                </div>

                {/* Completed */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hoàn thành</p>
                            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 tracking-tight">{completedTasks}</h3>
                            <p className="text-[11px] text-emerald-600 mt-1.5 font-semibold flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> Công việc xong
                            </p>
                        </div>
                        <MiniSparkBar value={completedTasks} max={20} color="#10B981" />
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đang làm</p>
                            <h3 className="text-3xl font-extrabold text-amber-600 mt-1 tracking-tight">{inProgressTasks}</h3>
                            <p className="text-[11px] text-amber-600 mt-1.5 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Đang triển khai
                            </p>
                        </div>
                        <MiniSparkBar value={inProgressTasks} max={20} color="#F59E0B" />
                    </div>
                </div>

                {/* Overdue */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quá hạn</p>
                            <h3 className="text-3xl font-extrabold text-rose-600 mt-1 tracking-tight">{overdueTasks}</h3>
                            <p className="text-[11px] text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                <ArrowDownRight className="w-3 h-3" /> Cần xử lý gấp
                            </p>
                        </div>
                        <MiniSparkBar value={overdueTasks} max={10} color="#EF4444" />
                    </div>
                </div>
            </div>

            {/* ────────────────────────────────────────────
                ROW 3 — Area Chart (2/3) + Gauge (1/3)
            ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Area Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Tiến độ công việc</h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Theo dõi task theo từng tháng — {new Date().getFullYear()}</p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                            <span className="flex items-center gap-1.5 text-blue-600">
                                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Hoàn thành
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-600">
                                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Đang làm
                            </span>
                        </div>
                    </div>
                    <div className="h-[220px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInProg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '12px' }}
                                    formatter={(value: any, name: any) => [value, name === 'hoàn_thành' ? 'Hoàn thành' : 'Đang làm']}
                                />
                                <Area type="monotone" dataKey="hoàn_thành" stroke="#2563EB" strokeWidth={2} fill="url(#colorDone)" dot={false} activeDot={{ r: 5, fill: '#2563EB' }} />
                                <Area type="monotone" dataKey="đang_làm" stroke="#F59E0B" strokeWidth={2} fill="url(#colorInProg)" dot={false} activeDot={{ r: 5, fill: '#F59E0B' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gauge / Donut — Task Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-between">
                    <div className="w-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900">Tỉ lệ hoàn thành</h3>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                {completionPct}% đạt
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Tổng tiến độ công việc cá nhân</p>
                        <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Hoàn thành {completedTasks}/{totalTasks} công việc</span>
                        </p>
                    </div>

                    {/* Donut Chart with 3 Colored Slices & Custom Tooltip */}
                    <div className="relative w-44 h-44 my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip content={<CustomDonutTooltip total={totalTasks} />} />
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    startAngle={220}
                                    endAngle={-40}
                                    innerRadius={52}
                                    outerRadius={68}
                                    dataKey="value"
                                    stroke="#ffffff"
                                    strokeWidth={totalTasks > 0 ? 2 : 0}
                                    paddingAngle={totalTasks > 0 ? 3 : 0}
                                >
                                    {donutData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-900 leading-none">{completionPct}%</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                {totalTasks > 0 ? 'HOÀN THÀNH' : 'CHƯA CÓ TASK'}
                            </span>
                        </div>
                    </div>

                    {/* 3 Legend Cards with clear labels */}
                    <div className="w-full grid grid-cols-3 gap-2 mt-1">
                        {[
                            { label: 'Hoàn thành', short: 'Hoàn thành', value: completedTasks, color: 'bg-emerald-500', text: 'text-emerald-600' },
                            { label: 'Đang làm', short: 'Đang làm', value: inProgressTasks, color: 'bg-amber-500', text: 'text-amber-600' },
                            { label: 'Cần làm', short: 'Cần làm', value: todoTasks, color: 'bg-rose-500', text: 'text-rose-600' },
                        ].map(item => (
                            <div key={item.label} className="flex flex-col items-center bg-slate-50 rounded-xl p-2.5 border border-slate-100 transition-all hover:bg-slate-100/80">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <span className="text-base font-extrabold text-slate-900 leading-tight">{item.value}</span>
                                </div>
                                <span className="text-[11px] text-slate-600 font-semibold">{item.short}</span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                    {totalTasks > 0 ? `${Math.round((item.value / totalTasks) * 100)}%` : '0%'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ────────────────────────────────────────────
                ROW 4 — Profile Card | Recent Tasks | Quick Nav
            ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Profile Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center gap-3">
                    {/* Avatar */}
                    <div className="relative mt-1">
                        {profile?.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt="avatar"
                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 shadow-md"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-500/20">
                                {avatarInitial}
                            </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900">{profile?.name || displayName}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{profile?.email || ''}</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                            <span className="text-xl font-extrabold text-slate-900">{totalProjects}</span>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dự án</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                            <span className="text-xl font-extrabold text-slate-900">{totalTasks}</span>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Công việc</p>
                        </div>
                    </div>

                    <Link
                        to="/profile"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                    >
                        <User className="w-3.5 h-3.5" />
                        Xem hồ sơ
                    </Link>
                </div>

                {/* Recent Tasks */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Công việc gần đây</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Tasks đang chờ xử lý</p>
                        </div>
                        <Link to="/tasks" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
                            Tất cả <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentTasks.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium py-8">
                            Chưa có công việc nào
                        </div>
                    ) : (
                        <div className="space-y-2.5 flex-1">
                            {recentTasks.map((task) => {
                                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG['TODO'];
                                const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/40 hover:border-blue-100 transition-all"
                                    >
                                        {/* Left accent */}
                                        <div className={`w-1 h-10 rounded-full shrink-0 ${
                                            isOverdue ? 'bg-rose-400' :
                                            task.status === 'DONE' ? 'bg-emerald-400' :
                                            task.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-slate-300'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-800 truncate">{task.title || `Task #${task.id}`}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                                {isOverdue && (
                                                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                                                        <AlertTriangle className="w-2.5 h-2.5" /> Quá hạn
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {task.dueDate && (
                                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                                {new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right column: Featured Project + Quick Nav */}
                <div className="flex flex-col gap-4">
                    {/* Featured Project */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex-1 flex flex-col justify-between relative overflow-hidden">
                        {/* BG decor */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <FolderKanban className="w-4 h-4 text-blue-400" />
                                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Dự án nổi bật</span>
                            </div>
                            {featuredProject ? (
                                <>
                                    <span className="font-mono text-[10px] bg-white/10 border border-white/20 px-2 py-0.5 rounded text-slate-300">
                                        {featuredProject.key || `PRJ-${featuredProject.id}`}
                                    </span>
                                    <h3 className="text-base font-bold mt-2 leading-snug line-clamp-2">{featuredProject.name || "Dự án chưa đặt tên"}</h3>
                                    {featuredProject.description && (
                                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{featuredProject.description}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-slate-400 mt-2">Chưa có dự án nào</p>
                            )}
                        </div>

                        {featuredProject && (
                            <Link
                                to={`/projects/${featuredProject.id}`}
                                className="relative z-10 mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors w-fit shadow-lg shadow-blue-900/30"
                            >
                                <Plus className="w-3.5 h-3.5" /> Vào Kanban
                            </Link>
                        )}
                        {!featuredProject && (
                            <Link
                                to="/projects"
                                className="relative z-10 mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors w-fit"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tạo dự án
                            </Link>
                        )}
                    </div>

                    {/* Quick Navigation */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <h3 className="text-xs font-bold text-slate-900">Điều hướng nhanh</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { to: '/tasks', label: 'Công việc', icon: <CheckSquare className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                { to: '/timeline', label: 'Timeline', icon: <CalendarRange className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                                { to: '/projects', label: 'Dự án', icon: <FolderKanban className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                                { to: '/profile', label: 'Hồ sơ', icon: <User className="w-4 h-4" />, color: 'text-slate-600 bg-slate-50 border-slate-200' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center hover:shadow-sm transition-all ${item.color}`}
                                >
                                    {item.icon}
                                    <span className="text-[10px] font-bold">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
