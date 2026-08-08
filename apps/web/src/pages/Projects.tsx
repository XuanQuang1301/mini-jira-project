import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { Plus, Search, X, FolderKanban, Hash, ArrowRight, UserPlus, FolderPlus } from 'lucide-react';

interface Project {
    id: number; 
    name: string; 
    key: string;
    description: string; 
    projectCode: string;
    role?: string;
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null); 
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [newName, setNewName] = useState(''); 
    const [newKey, setNewKey] = useState(''); 
    const [newDesc, setNewDesc] = useState(''); 
    const [isCreating, setIsCreating] = useState(false); 
    const navigate = useNavigate(); 

    const [joinCode, setJoinCode] = useState('');

    const filteredProjects = projects.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            p.name.toLowerCase().includes(q) ||
            (p.key && p.key.toLowerCase().includes(q))
        );
    });

    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/project/my'); 
            setProjects(response.data || []); 
        } catch (err) {
            console.error("Lỗi khi tải dự án:", err); 
            setError('Không thể tải danh sách dự án'); 
        } finally {
            setIsLoading(false); 
        }
    };

    useEffect(() => {
        fetchProjects(); 
    }, []); 

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();  
        setIsCreating(true);
        try {
            const storedUserId = localStorage.getItem('userId');
            const ownerId = storedUserId ? Number(storedUserId) : null;
            await api.post('/api/project/create', {
                name: newName.trim(), 
                key: newKey.trim().toUpperCase(), 
                description: newDesc.trim(), 
                ownerId: ownerId
            }); 
            setIsModalOpen(false); 
            setNewName(''); 
            setNewKey(''); 
            setNewDesc(''); 
            await fetchProjects(); 
        } catch (err: any) {
            console.error("Lỗi tạo dự án", err); 
            alert(err.response?.data?.error || "Có lỗi xảy ra khi tạo dự án mới");
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinProject = async () => {
        if (!joinCode.trim()) return;
        try {
            const res = await api.post('/api/project/join', { projectCode: joinCode.trim() });
            alert(res.data.message);
            setJoinCode('');
            await fetchProjects();
        } catch (error: any) {
            alert(error.response?.data?.error || "Mã không chính xác");
        }
    };

    return (
        <div className="h-full flex flex-col space-y-5 animate-fade-in pb-10 font-sans antialiased text-slate-800"> 
            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4"> 
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Dự án của tôi</span>
                        <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {projects.length}
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Danh sách và thông tin các dự án bạn đang tham gia</p>
                </div>

                {/* Actions Group: Compact Join Box + Create Button */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Compact Join Project Box */}
                    <div className="flex items-center gap-1.5 bg-white p-1 pl-3 rounded-xl border border-slate-200 shadow-2xs">
                        <UserPlus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <input 
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Mã dự án (Key)..." 
                            className="bg-transparent text-xs text-slate-800 outline-none w-32 md:w-36 placeholder:text-slate-400 font-medium"
                        />
                        <button 
                            onClick={handleJoinProject}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition active:scale-95 shrink-0"
                        >
                            Tham gia
                        </button>
                    </div>

                    {/* Create Project Button */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    > 
                        <Plus className="w-4 h-4" />
                        <span>Tạo dự án mới</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm dự án theo tên hoặc mã (Key)..."
                    className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-2xs font-medium"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-12 text-blue-600 text-xs font-semibold gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách dự án...</span>
                </div>
            )}
            
            {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

            {!isLoading && !error && projects.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 border-dashed shadow-2xs flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-3">
                        <FolderPlus className="w-6 h-6" />
                    </div>
                    <p className="text-slate-700 font-semibold text-sm mb-1">Bạn chưa tham gia dự án nào</p>
                    <p className="text-slate-400 text-xs">Hãy nhấn "Tạo dự án mới" hoặc nhập mã ở góc trên để bắt đầu!</p>
                </div>
            )}

            {!isLoading && !error && projects.length > 0 && filteredProjects.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 border-dashed shadow-2xs">
                    <p className="text-slate-700 font-semibold text-sm mb-1">Không tìm thấy dự án phù hợp</p>
                    <p className="text-slate-400 text-xs">Thử lại với từ khóa tìm kiếm khác</p>
                </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                    <div
                        onClick={() => navigate(`${project.id}`)}
                        key={project.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {project.name}
                                </h3>
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-extrabold shrink-0 border ${
                                    project.role === 'MENTOR' || project.role === 'OWNER'
                                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : project.role === 'MANAGER'
                                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}> 
                                    {project.role}
                                </span>
                            </div>

                            {project.key && (
                                <div className="mb-3">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        <Hash className="w-3 h-3" />
                                        {project.key}
                                    </span>
                                </div>
                            )}
                            
                            <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed">
                                {project.description || "Chưa có mô tả chi tiết cho dự án này."}
                            </p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-auto">
                            <span className="text-[11px] font-medium text-slate-400">Xem chi tiết</span>
                            <div className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <span>Vào bảng</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Create Project */}
            {isModalOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-fade-in"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
                    >
                        <div
                            className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-up"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
                            }}
                        >
                            {/* ── Header ── */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
                                        <FolderKanban className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">Tạo dự án mới</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">Khởi tạo workspace cho nhóm của bạn</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── Form Body ── */}
                            <form onSubmit={handleCreateProject} className="p-6 space-y-4 bg-white">
                                {/* Tên dự án */}
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Tên dự án <span className="text-rose-500 normal-case">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="VD: Quản lý Kho hàng CRM"
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                {/* Mã dự án */}
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Mã dự án (Key) <span className="text-rose-500 normal-case">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                                        placeholder="VD: CRM"
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold uppercase tracking-wider placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">Viết tắt ngắn gọn · ví dụ: CRM, HRM, PRJ</p>
                                </div>

                                {/* Mô tả ngắn */}
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Mô tả ngắn
                                    </label>
                                    <textarea
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder="Mục tiêu và thông tin dự án..."
                                        rows={3}
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                                    />
                                </div>

                                {/* ── Actions ── */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        Hủy bỏ
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Đang tạo...
                                            </span>
                                        ) : 'Tạo dự án'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
