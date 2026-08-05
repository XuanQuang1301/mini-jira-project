import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { 
  FolderKanban, 
  Search, 
  ListTodo, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  RefreshCw,
  Hash
} from "lucide-react";

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchProject, setSearchProject] = useState("");

  // Selected project modal state
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/project/all").catch(() => api.get("/api/project/my"));
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects for admin:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = async (project: any) => {
    setSelectedProject(project);
    setIsLoadingTasks(true);
    try {
      const res = await api.get(`/api/project/${project.id}/tasks`);
      setProjectTasks(res.data || []);
    } catch (err) {
      console.error("Error fetching project tasks:", err);
      setProjectTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchProject.toLowerCase()) ||
      p.key?.toLowerCase().includes(searchProject.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(searchProject.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 animate-spin" /> Đang làm
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Đang xem xét
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Cần làm (TODO)
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-700 text-xs font-semibold gap-3 animate-pulse">
        <div className="w-7 h-7 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        <span>Đang nạp danh sách dự án...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans antialiased text-slate-800">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Quản Lý Dự Án Hệ Thống</span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-slate-200">
              {projects.length} dự án
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Giám sát danh sách các dự án và tiến độ công việc toàn hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-2xs active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">Danh Sách Dự Án</h3>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm mã, tên dự án hoặc người tạo..."
              value={searchProject}
              onChange={(e) => setSearchProject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Mã Dự Án (Key)</th>
                <th className="py-3 px-3">Tên Dự Án</th>
                <th className="py-3 px-3">Người Tạo / Chủ Sở Hữu</th>
                <th className="py-3 px-3">Mô tả</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy dự án nào khớp từ khóa.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = selectedProject?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/90 transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-50/50 font-medium" : ""
                      }`}
                      onClick={() => handleSelectProject(p)}
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md uppercase">
                          <Hash className="w-3 h-3" />
                          {p.key || `PRJ-${p.id}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 text-sm">{p.name}</td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {p.ownerName ? (
                          <div>
                            <span className="font-bold text-slate-900">{p.ownerName}</span>
                            {p.ownerEmail && (
                              <span className="block text-[10px] text-slate-400 font-medium">{p.ownerEmail}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Thành viên #{p.ownerId || "N/A"}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                        {p.description || <span className="text-slate-300 italic">Chưa có mô tả</span>}
                      </td>
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectProject(p)}
                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-2xs active:scale-95"
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>Xem Task</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Light Minimalist Task Modal (Rendered at Root Body Portal) */}
      {selectedProject &&
        createPortal(
          <TaskDetailModal
            selectedProject={selectedProject}
            projectTasks={projectTasks}
            isLoadingTasks={isLoadingTasks}
            onClose={() => setSelectedProject(null)}
            getStatusBadge={getStatusBadge}
          />,
          document.body
        )}
    </div>
  );
}

// Minimalist, Clean Light Modal Component
function TaskDetailModal({
  selectedProject,
  projectTasks,
  isLoadingTasks,
  onClose,
  getStatusBadge
}: {
  selectedProject: any;
  projectTasks: any[];
  isLoadingTasks: boolean;
  onClose: () => void;
  getStatusBadge: (status: string) => any;
}) {
  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const completedCount = projectTasks.filter((t) => t.status === "DONE").length;
  const inProgressCount = projectTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoCount = projectTasks.filter((t) => t.status === "TODO" || !t.status).length;
  const totalCount = projectTasks.length;

  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.id?.toString().includes(taskSearch);

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "DONE") return matchesSearch && task.status === "DONE";
    if (statusFilter === "IN_PROGRESS") return matchesSearch && task.status === "IN_PROGRESS";
    if (statusFilter === "TODO") return matchesSearch && (task.status === "TODO" || !task.status);
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[82vh] my-auto flex flex-col overflow-hidden animate-scale-up shrink-0">
        {/* Clean Light Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs shrink-0">
              {selectedProject.key || "PRJ"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedProject.name}
                </h2>
                <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100">
                  {totalCount} công việc
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Chủ dự án: <span className="font-bold text-slate-700">{selectedProject.ownerName || `#${selectedProject.ownerId}`}</span> | Mã: <span className="font-mono text-slate-700">{selectedProject.key}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${selectedProject.id}`}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
              target="_blank"
            >
              <span>Xem Kanban</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Summary Bar */}
        <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0 text-xs">
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Task</p>
            <p className="text-sm font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Hoàn thành</p>
            <p className="text-sm font-black text-emerald-600 mt-0.5">{completedCount}</p>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Đang làm</p>
            <p className="text-sm font-black text-blue-600 mt-0.5">{inProgressCount}</p>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cần làm</p>
            <p className="text-sm font-black text-slate-700 mt-0.5">{todoCount}</p>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiến độ</p>
              <span className="font-mono text-[10px] font-black text-slate-900">{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("DONE")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                statusFilter === "DONE"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Hoàn thành ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Đang làm ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter("TODO")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                statusFilter === "TODO"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Cần làm ({todoCount})
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên task..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            />
          </div>
        </div>

        {/* Modal Body: Task List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1 min-h-0 bg-white">
          {isLoadingTasks ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold">Đang tải danh sách công việc...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-300" />
              <span className="text-xs font-bold text-slate-600">Không tìm thấy công việc nào</span>
              <p className="text-[11px] text-slate-400">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Mã Task</th>
                    <th className="py-2.5 px-3">Tên Công Việc</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Độ Ưu Tiên</th>
                    <th className="py-2.5 px-3 text-right">Tiến độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        #{task.id}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div>
                          <span>{task.title}</span>
                          {task.description && (
                            <p className="text-[11px] font-normal text-slate-400 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{getStatusBadge(task.status)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            task.priority === "HIGH" || task.priority === "URGENT"
                              ? "bg-rose-100 text-rose-700"
                              : task.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-slate-900 h-full rounded-full transition-all"
                              style={{ width: `${task.progress || (task.status === "DONE" ? 100 : 0)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600">
                            {task.progress || (task.status === "DONE" ? 100 : 0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Clean Sticky Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Hiển thị {filteredTasks.length} / {totalCount} task trong dự án <strong className="text-slate-900">{selectedProject.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition shadow-xs active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
