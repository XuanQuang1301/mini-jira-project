import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { Calendar, Clock, AlertTriangle, CheckCircle2, TrendingUp, Layers, Hash } from "lucide-react";

type ViewMode = "day" | "month" | "year";
type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  createdAt?: string | null;
  dueDate: string | null;
  projectId: number;
  assigneeId: number | null;
}

interface ProjectInfo {
  name: string;
  role: string;
}

interface UserInfo {
  id: number;
  name?: string;
  email?: string;
}

interface TimelineTask extends Task {
  projectName: string;
  assigneeName: string;
  startDate: string;
  endDate: string;
}

const monthLabels = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear + index);

const statusTheme: Record<TaskStatus, { color: string; soft: string; label: string }> = {
  TODO: {
    color: "#94A3B8",
    soft: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Cần làm",
  },
  IN_PROGRESS: {
    color: "#3B82F6",
    soft: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Đang làm",
  },
  REVIEW: {
    color: "#A855F7",
    soft: "bg-purple-50 text-purple-700 border-purple-200",
    label: "Chờ duyệt",
  },
  DONE: {
    color: "#10B981",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Đã xong",
  },
};

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "Chưa có hạn";
  return new Date(dateValue).toLocaleDateString("vi-VN");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function dayDiff(from: Date, to: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

function isCurrentColumn(
  viewMode: ViewMode,
  selectedYear: number,
  selectedMonth: number,
  label: string,
) {
  const now = new Date();
  if (viewMode === "day") {
    return (
      now.getFullYear() === selectedYear &&
      now.getMonth() === selectedMonth &&
      String(now.getDate()) === label
    );
  }
  if (viewMode === "month") {
    return (
      now.getFullYear() === selectedYear &&
      (now.getMonth() + 1) === Number(label.replace('T', ''))
    );
  }
  return String(now.getFullYear()) === label;
}

function statusLabel(status: string) {
  if (status === "TODO") return "Cần làm";
  if (status === "IN_PROGRESS") return "Đang làm";
  if (status === "REVIEW") return "Chờ duyệt";
  if (status === "DONE") return "Đã xong";
  return status;
}

function getBarTone(task: TimelineTask) {
  const isOverdue = Boolean(
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE",
  );

  if (isOverdue) {
    return { strong: "bg-rose-500", soft: "bg-rose-100", text: "text-rose-700" };
  }
  if (task.status === "TODO") {
    return { strong: "bg-slate-400", soft: "bg-slate-100", text: "text-slate-700" };
  }
  if (task.status === "IN_PROGRESS") {
    return { strong: "bg-blue-600", soft: "bg-blue-100", text: "text-blue-700" };
  }
  if (task.status === "REVIEW") {
    return { strong: "bg-purple-600", soft: "bg-purple-100", text: "text-purple-700" };
  }
  return { strong: "bg-emerald-500", soft: "bg-emerald-100", text: "text-emerald-700" };
}

function getCurrentUserDisplayName(users: UserInfo[], userId: number | null) {
  const currentUser = users.find((user) => user.id === userId);
  return currentUser?.name || currentUser?.email?.split("@")[0] || "Thành viên";
}

function buildProjectsMap(projects: any[]) {
  const projectsMap: Record<number, ProjectInfo> = {};
  projects.forEach((project) => {
    projectsMap[project.id] = { name: project.name, role: project.role };
  });
  return projectsMap;
}

export default function Timeline() {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const storedId = localStorage.getItem("userId");
        const myId = storedId ? Number(storedId) : null;

        const [tasksRes, projectsRes, usersRes] = await Promise.all([
          api.get("/api/project/tasks/my-tasks"),
          api.get("/api/project/my"),
          api.get("/api/users"),
        ]);

        const users: UserInfo[] = usersRes.data || [];
        const me: UserInfo = {
          id: -1,
          name: getCurrentUserDisplayName(users, myId),
        };
        const displayName = me?.name || me?.email?.split("@")[0] || "Thành viên";
        const projectsMap = buildProjectsMap(projectsRes.data || []);

        const mappedTasks: TimelineTask[] = (tasksRes.data || []).map((task: Task) => {
          const createdAt = task.createdAt ? new Date(task.createdAt) : null;
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const fallbackStart = createdAt || dueDate || new Date();
          const fallbackEnd = dueDate || createdAt || new Date();

          const assignee = users.find((user: any) => user.id === task.assigneeId);
          return {
            ...task,
            status: task.status || "TODO",
            projectName: projectsMap[task.projectId]?.name || `Dự án #${task.projectId}`,
            assigneeName: assignee?.name || displayName,
            startDate: fallbackStart.toISOString(),
            endDate: fallbackEnd.toISOString(),
          };
        });

        setTasks(mappedTasks);

        // Tự động chuyển đến Tháng/Năm có task nếu tháng hiện tại không có task nào
        if (mappedTasks.length > 0) {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const hasTaskInCurrentMonth = mappedTasks.some((t) => {
            const d = new Date(t.endDate);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          });

          if (!hasTaskInCurrentMonth) {
            const firstDate = new Date(mappedTasks[0].endDate);
            if (!isNaN(firstDate.getTime())) {
              setSelectedYear(firstDate.getFullYear());
              setSelectedMonth(firstDate.getMonth());
            }
          }
        }
      } catch (error) {
        console.error("Lỗi tại timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  const timelineColumns = useMemo(() => {
    if (viewMode === "day") {
      return Array.from(
        { length: getDaysInMonth(selectedYear, selectedMonth) },
        (_, index) => ({ key: `day-${index + 1}`, label: `${index + 1}` })
      );
    }
    if (viewMode === "year") {
      return yearOptions.map((year) => ({ key: `year-${year}`, label: `${year}` }));
    }
    return monthLabels.map((month, index) => ({ key: `month-${index}`, label: `T${index + 1}` }));
  }, [selectedMonth, selectedYear, viewMode]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "DONE").length;
    const overdue = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
    ).length;
    const active = tasks.filter(
      (task) => task.status === "IN_PROGRESS" || task.status === "REVIEW"
    ).length;
    const avgProgress = total
      ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / total)
      : 0;

    const statusSummary = (Object.keys(statusTheme) as TaskStatus[]).map((status) => {
      const count = tasks.filter((task) => task.status === status).length;
      return { status, count, percent: total ? (count / total) * 100 : 0 };
    });

    return { total, completed, overdue, active, avgProgress, statusSummary };
  }, [tasks]);

  const donutBackground = useMemo(() => {
    if (summary.total === 0) {
      return `conic-gradient(#e2e8f0 0% 100%)`;
    }
    let cursor = 0;
    const segments = summary.statusSummary.map((item) => {
      const start = cursor;
      const end = cursor + item.percent;
      cursor = end;
      return `${statusTheme[item.status].color} ${start}% ${end}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [summary.statusSummary, summary.total]);

  const positionedTasks = useMemo(() => {
    const totalColumns = timelineColumns.length;
    const periodStart =
      viewMode === "day"
        ? startOfDay(new Date(selectedYear, selectedMonth, 1))
        : viewMode === "month"
          ? startOfDay(new Date(selectedYear, 0, 1))
          : startOfDay(new Date(yearOptions[0], 0, 1));
    const periodEnd =
      viewMode === "day"
        ? endOfDay(new Date(selectedYear, selectedMonth, getDaysInMonth(selectedYear, selectedMonth)))
        : viewMode === "month"
          ? endOfDay(new Date(selectedYear, 11, 31))
          : endOfDay(new Date(yearOptions[yearOptions.length - 1], 11, 31));

    return tasks
      .map((task) => {
        const rawStart = new Date(task.startDate);
        const rawEnd = new Date(task.endDate);
        const taskStart = startOfDay(rawStart <= rawEnd ? rawStart : rawEnd);
        const taskEnd = endOfDay(rawStart <= rawEnd ? rawEnd : rawStart);
        const isVisible = taskStart <= periodEnd && taskEnd >= periodStart;

        if (!isVisible) return { ...task, isVisible, left: 0, width: 0 };

        const clippedStart = taskStart > periodStart ? taskStart : periodStart;
        const clippedEnd = taskEnd < periodEnd ? taskEnd : periodEnd;

        let startIndex = 0;
        let endIndex = totalColumns - 1;

        if (viewMode === "day") {
          startIndex = dayDiff(periodStart, clippedStart);
          endIndex = dayDiff(periodStart, clippedEnd);
        } else if (viewMode === "month") {
          startIndex = clippedStart.getMonth();
          endIndex = clippedEnd.getMonth();
        } else {
          startIndex = clippedStart.getFullYear() - yearOptions[0];
          endIndex = clippedEnd.getFullYear() - yearOptions[0];
        }

        const safeStart = clamp(startIndex, 0, totalColumns - 1);
        const safeEnd = clamp(endIndex, safeStart, totalColumns - 1);
        const left = (safeStart / totalColumns) * 100;
        const width = ((safeEnd - safeStart + 1) / totalColumns) * 100;

        return { ...task, isVisible, left, width };
      })
      .filter((task) => task.isVisible)
      .sort((a, b) => {
        const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (startDiff !== 0) return startDiff;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      });
  }, [selectedMonth, selectedYear, tasks, timelineColumns.length, viewMode]);

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, typeof positionedTasks>();
    positionedTasks.forEach((task) => {
      const current = groups.get(task.projectName) || [];
      current.push(task);
      groups.set(task.projectName, current);
    });
    return Array.from(groups.entries()).map(([projectName, items]) => ({ projectName, items }));
  }, [positionedTasks]);

  const urgentTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== "DONE")
      .sort((a, b) => {
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return timeA - timeB;
      })
      .slice(0, 5);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-600 text-xs font-semibold gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span>Đang tải lộ trình...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-4 pb-12 animate-fade-in font-sans antialiased">
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dòng Thời Gian</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Bản đồ tiến độ và lộ trình triển khai các công việc</p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Tổng công việc</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{summary.total}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Đang xử lý</p>
            <h3 className="text-xl font-extrabold text-blue-600 mt-0.5">{summary.active}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Hoàn thành</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">{summary.completed}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Trễ hạn / Quá hạn</p>
            <h3 className="text-xl font-extrabold text-rose-600 mt-0.5">{summary.overdue}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Insights Row (Phân bố công việc & Gần đến deadline) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Donut Distribution Card */}
        <div className="rounded-2xl bg-white p-4 shadow-2xs border border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Phân bố công việc</h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Tỷ lệ theo trạng thái thực hiện</p>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="relative h-32 w-32 rounded-full shrink-0" style={{ background: donutBackground }}>
              <div className="absolute inset-[24%] rounded-full bg-white shadow-inner" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {summary.total}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  CÔNG VIỆC
                </span>
              </div>
            </div>

            <div className="space-y-1.5 w-full max-w-[200px]">
              {summary.statusSummary.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusTheme[item.status].color }} />
                    <span className="text-slate-700">{statusLabel(item.status)}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.count} công việc</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deadline Warnings Card */}
        <div className="rounded-2xl bg-white p-4 shadow-2xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Gần đến deadline</h3>
              <p className="text-xs text-slate-400 font-medium">Công việc cần ưu tiên xử lý trước</p>
            </div>
            <span className="bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-200">
              {urgentTasks.length} công việc
            </span>
          </div>

          <div className="space-y-2">
            {urgentTasks.length > 0 ? (
              urgentTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900 line-clamp-1">{task.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusTheme[task.status as TaskStatus]?.soft}`}>
                      {statusLabel(task.status)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Hạn: {formatDate(task.dueDate)}</span>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                Không có công việc nào cần cảnh báo deadline.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Gantt Timeline Block - FILTER CONTROLS NOW LOCATED DIRECTLY ABOVE CHART */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Biểu đồ Lộ trình</h3>
            <span className="text-xs text-slate-400 font-medium ml-2">
              ({viewMode === 'day' ? `${monthLabels[selectedMonth]} ${selectedYear}` : `${selectedYear}`})
            </span>
          </div>

          {/* Filter Controls moved directly above Roadmap Chart */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex gap-1 shadow-2xs">
              {(["day", "month", "year"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === mode ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {mode === "day" ? "Ngày" : mode === "month" ? "Tháng" : "Năm"}
                </button>
              ))}
            </div>

            {viewMode === "day" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none shadow-2xs"
              >
                {monthLabels.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none shadow-2xs"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Grid Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[900px]">
            {/* Header Columns */}
            <div className="grid grid-cols-[240px_minmax(660px,1fr)] border-b border-slate-200 bg-slate-50/80 text-slate-700 text-xs font-bold">
              <div className="p-3 border-r border-slate-200 flex items-center">Tên công việc</div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(0, 1fr))` }}>
                {timelineColumns.map((col) => (
                  <div
                    key={col.key}
                    className={`border-l border-slate-200 py-2.5 text-center text-[11px] ${
                      isCurrentColumn(viewMode, selectedYear, selectedMonth, col.label)
                        ? "bg-blue-100/80 text-blue-700 font-extrabold"
                        : "text-slate-500"
                    }`}
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows Grouped by Project */}
            {groupedTasks.length > 0 ? (
              <div>
                {groupedTasks.map((group) => (
                  <div key={group.projectName} className="border-b border-slate-200 last:border-b-0">
                    <div className="bg-slate-100/60 px-4 py-2 text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-slate-200 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      <span>{group.projectName}</span>
                    </div>

                    <div className="grid grid-cols-[240px_minmax(660px,1fr)]">
                      {group.items.map((task) => {
                        const tone = getBarTone(task);
                        const progressWidth = `${task.status === "DONE" ? 100 : clamp(task.progress || 0, 0, 100)}%`;

                        return (
                          <div key={task.id} className="contents">
                            <div className="border-r border-b border-slate-100 p-3 flex flex-col justify-center text-xs bg-white">
                              <p className="font-bold text-slate-800 line-clamp-1">{task.title}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                                <span>Hạn: {formatDate(task.endDate)}</span>
                                <span>{task.progress}%</span>
                              </div>
                            </div>

                            <div className="relative border-b border-slate-100 min-h-[52px] bg-white">
                              <div
                                className="absolute top-1/2 -translate-y-1/2"
                                style={{ left: `${task.left}%`, width: `${task.width}%` }}
                              >
                                <div className={`h-5 rounded-full overflow-hidden relative shadow-2xs ${tone.soft}`}>
                                  <div className={`h-full rounded-full ${tone.strong}`} style={{ width: progressWidth }} />
                                  <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${tone.text}`}>
                                    {task.progress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs font-medium text-slate-400">
                Không có công việc nào trong mốc thời gian đã chọn.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
