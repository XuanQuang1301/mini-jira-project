import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    FolderKanban, CheckCircle2, Clock, AlertTriangle, TrendingUp, 
    Sparkles, ArrowRight, Layers, Plus, Calendar, CheckSquare 
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
}

export default function Dashboard() {
    const [totalProjects, setTotalProjects] = useState(0);
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [inProgressTasks, setInProgressTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    
    const [barData, setBarData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [projectsRes, tasksRes] = await Promise.all([
                    api.get('/api/project/my').catch(() => ({ data: [] })),
                    api.get('/api/project/tasks/my-tasks').catch(() => ({ data: [] }))
                ]);

                const projects: Project[] = projectsRes.data || [];
                const myTasks: Task[] = tasksRes.data || [];

                setTotalProjects(projects.length);
                setRecentProjects(projects.slice(0, 4));

                const currentYear = new Date().getFullYear();
                const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
                    name: `T${i + 1}`,
                    project: 0
                }));

                projects.forEach(p => {
                    const date = p.createdAt ? new Date(p.createdAt) : new Date();
                    if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
                        const monthIndex = date.getMonth(); 
                        monthlyStats[monthIndex].project += 1;
                    }
                });
                setBarData(monthlyStats);

                const completed = myTasks.filter(task => task.status === 'DONE').length;
                setCompletedTasks(completed);

                const inProgress = myTasks.filter(task => task.status === 'IN_PROGRESS' || task.status === 'REVIEW').length;
                setInProgressTasks(inProgress);

                const now = new Date();
                const overdue = myTasks.filter(task => {
                    if (task.status === 'DONE' || !task.dueDate) return false;
                    const deadline = new Date(task.dueDate);
                    return deadline < now;
                }).length;
                setOverdueTasks(overdue);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600 font-semibold gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-xs">Đang tổng hợp dữ liệu hệ thống...</span>
            </div>
        );
    }

    const pieData = [
        { name: 'Hoàn thành', value: completedTasks, color: '#10B981' }, 
        { name: 'Đang xử lý', value: inProgressTasks, color: '#F59E0B' }, 
        { name: 'Quá hạn', value: overdueTasks, color: '#EF4444' },      
    ];
    
    const activePieData = pieData.filter(item => item.value > 0);
    const totalTasksForPie = completedTasks + inProgressTasks + overdueTasks;
    let formattedPieData = [...activePieData];
    if (totalTasksForPie > 0) {
        let percentData = formattedPieData.map(item => {
            const exact = (item.value / totalTasksForPie) * 100;
            return {
                ...item,
                intPart: Math.floor(exact),
                remainder: exact - Math.floor(exact)
            };
        });
        let currentSum = percentData.reduce((sum, item) => sum + item.intPart, 0);
        let diff = 100 - currentSum; 

        percentData.sort((a, b) => b.remainder - a.remainder);
        for (let i = 0; i < diff; i++) {
            percentData[i].intPart += 1;
        }
        formattedPieData = formattedPieData.map(item => {
            const matched = percentData.find(p => p.name === item.name);
            return {
                ...item,
                displayPercent: matched ? matched.intPart : 0
            };
        });
    }

    return (
        <div className="h-full flex flex-col pb-10 space-y-6 animate-fade-in font-sans antialiased text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Tổng Quan Hệ Thống</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Báo cáo chi tiết về dự án và tiến độ công việc cá nhân</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-700">Thời gian thực</span>
                    </div>
                    <Link
                        to="/projects"
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Xem dự án</span>
                    </Link>
                </div>
            </div>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Projects */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex justify-between items-center group">
                    <div>
                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Dự án đang tham gia</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalProjects}</h3>
                        <p className="text-[11px] text-blue-600 mt-1 font-semibold flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5" /> Tổng số dự án
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center transition-transform group-hover:scale-105">
                        <FolderKanban className="w-6 h-6" />
                    </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex justify-between items-center group">
                    <div>
                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Công việc hoàn thành</p>
                        <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{completedTasks}</h3>
                        <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xong hoàn toàn
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center transition-transform group-hover:scale-105">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex justify-between items-center group">
                    <div>
                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Đang thực hiện</p>
                        <h3 className="text-3xl font-extrabold text-amber-600 tracking-tight">{inProgressTasks}</h3>
                        <p className="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Đang triển khai
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* Overdue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex justify-between items-center group">
                    <div>
                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Công việc quá hạn</p>
                        <h3 className="text-3xl font-extrabold text-rose-600 tracking-tight">{overdueTasks}</h3>
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Cần xử lý gấp
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center transition-transform group-hover:scale-105">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Projects Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Thống kê dự án mới</h3>
                            <p className="text-xs text-slate-400 font-medium">Số lượng dự án được tạo theo từng tháng trong năm {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{fill: '#F8FAFC'}}
                                    contentStyle={{borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'}}
                                    formatter={(value) => [`${value} dự án`, 'Số lượng']}
                                />
                                <Bar dataKey="project" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={26} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart Task Status */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs lg:col-span-1 flex flex-col">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Phân bổ trạng thái</h3>
                        <p className="text-xs text-slate-400 font-medium">Tỷ lệ hoàn thành công việc cá nhân</p>
                    </div>
                    
                    {totalTasksForPie === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 text-xs font-medium">
                            <Sparkles className="w-8 h-8 text-slate-300 mb-2 opacity-50" />
                            <span>Chưa có công việc nào được tạo</span>
                        </div>
                    ) : (
                        <div className="h-[280px] w-full relative mt-2">
                            <div className="absolute top-[46%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-10">
                                <span className="text-3xl font-black text-slate-900 leading-none">{totalTasksForPie}</span>
                                <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Công việc</span>
                            </div>

                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                                    <Pie
                                        data={formattedPieData} 
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75} 
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        label={({ payload }: any) => `${payload.displayPercent}%`}
                                        labelLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                                        style={{ fontSize: '11px', fontWeight: '600' }}
                                    >
                                        {formattedPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'}}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Projects Access Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-slate-900" />
                        <h3 className="text-sm font-bold text-slate-900">Dự án của bạn gần đây</h3>
                    </div>
                    <Link to="/projects" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
                        <span>Tất cả dự án ({totalProjects})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentProjects.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                        Bạn chưa tham gia dự án nào. Hãy tạo hoặc tham gia dự án mới.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {recentProjects.map((p) => (
                            <Link
                                key={p.id}
                                to={`/projects/${p.id}`}
                                className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 p-3.5 rounded-xl transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                                            {p.key || `PRJ-${p.id}`}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {p.name}
                                    </h4>
                                    {p.description && (
                                        <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">
                                            {p.description}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                    <span>Vào Kanban</span>
                                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
