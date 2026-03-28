import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

interface Project{
    id: number; 
    name: string; 
    description: string; 
    role: string; 
}

export default function Projects (){
    const [projects, setProjects] = useState<Project[]> ([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(''); 

    // Các STATE dành cho MODAL (bảng tạo dự án)
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [newName, setNewName] = useState(''); 
    const [newKey, setNewKey] = useState(''); 
    const [newDesc, setNewDesc] = useState(''); 
    const [isCreating, setIsCreating] = useState(false); 
    const navigate = useNavigate(); 

    const [joinCode, setJoinCode] = useState('');

    // Hàm lấy danh sách dự án
    const fetchProjects = async()=> {
        try{
            const token = localStorage.getItem('token'); 
            const response = await axios.get('http://localhost:5000/api/projects', {
                headers: {Authorization: `Bearer ${token}`}
            }); 
            setProjects(response.data); 
        }catch (err) {
            console.error("Lỗi khi tải dự án:", err); 
            setError('Không thể tải danh sách dự án'); 
        }finally{
            setIsLoading(false); 
        }
    }

    useEffect(()=> {
        fetchProjects() 
    }, []); 

    // Hàm xử lý khi bấm nút tạo dự án trong modal 
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();  
        setIsCreating(true);
        try{
            const token = localStorage.getItem('token'); 
            const storedUserId = localStorage.getItem('userId');
            const ownerId = storedUserId ? Number(storedUserId) : null;
            await axios.post('http://localhost:5000/api/projects', {
                name: newName, 
                key: newKey, 
                description: newDesc, 
                ownerId: ownerId
            }, {
                headers: {Authorization: `Bearer ${token}`}
            }); 
            setIsModalOpen(false); 
            setNewName(''); 
            setNewKey(''); 
            setNewDesc(''); 
            fetchProjects(); 
        } catch (err: any) {
            console.error("Lỗi tạo dự án", err); 
            alert(err.response?.data?.error || "Có lỗi xảy ra khi tạo dự án mới ")
        }finally {
            setIsCreating(false)
        }
    }

    const handleDelete = async (id: number) => {
        if(window.confirm("Bạn có chắc muốn xóa dự án này không")){
            try{
                const token = localStorage.getItem('token'); 
                await axios.delete(`http://localhost:5000/api/projects/${id}`, {
                    headers: {Authorization: `Bearer ${token}`}
                }); 
                fetchProjects(); 
            }catch(err) {
                alert("Không thể xóa dự án"); 
            }
        }
    }

    const handleJoinProject = async () => {
        if (!joinCode.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/projects/join', 
                { projectCode: joinCode }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setJoinCode('');
            // Không cần load lại danh sách vì lúc này đang là PENDING (chưa hiện)
        } catch (error: any) {
            alert(error.response?.data?.error || "Mã không chính xác");
        }
    };
    return (
        <div className="h-full flex flex-col"> 
            {/* Phần Header của trang  */}
            <div className="flex justify-between items-center mb-8"> 
                <div>
                    <h1 className='text-3xl font-extrabold text-gray-900 mb-1'> Dự án của tôi </h1>
                    {/* <p className='text-gray-500 text-sm'>Quản lý các dự án bạn đang làm</p> */}
                </div>
                <button 
                    onClick={()=> setIsModalOpen(true)}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm hover:shadow-md flex items-center gap-2'> 
                    <span className='text-xl leading-none'>+</span> Thêm dự án
                </button>
            </div>

            {/* Hiển thị Loading hoặc Lỗi nếu có */}
            {isLoading && <p className="text-blue-600 font-medium">Đang tải dữ liệu dự án... ⏳</p>}
            {error && <p className="text-red-500 font-medium">{error}</p>}

            {/* Nếu không có lỗi và đã tải xong, nhưng mảng rỗng */}
            {!isLoading && !error && projects.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100 border-dashed shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <p className="text-gray-500 font-medium mb-1">Bạn chưa tham gia dự án nào.</p>
                    <p className="text-gray-400 text-sm">Hãy tạo một dự án mới để bắt đầu công việc!</p>
                </div>
            )}
            
            <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-black text-blue-900 uppercase">Gia nhập dự án mới</h3>
                    <p className="text-xs text-blue-600 font-medium">Nhập mã dự án (Key) để gửi yêu cầu tham gia cho Manager.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <input 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="Ví dụ: T001..." 
                        className="px-4 py-3 rounded-2xl border-none shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48"
                    />
                    <button 
                        onClick={handleJoinProject}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg transition active:scale-95 shrink-0"
                    >
                        THAM GIA
                    </button>
                </div>
            </div>

            {/* Lưới danh sách các dự án  */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8'>
                {projects.map((project) => (
                    <div
                        onClick={() => navigate(`${project.id}`)}
                        key={project.id}
                        className='relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col'
                    >
                        <div className='flex justify-between items-start mb-3'>
                            <h3 className='text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 pr-2'>
                                {project.name}
                            </h3>
                            {/* Đổi màu nhãn (Badge) sang tông sáng */}
                            <span className={`text-[10px] uppercase px-2.5 py-1 rounded-md font-bold shrink-0
                                ${project.role === 'MENTOR' || project.role === 'OWNER'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}
                            > 
                                {project.role}
                            </span>
                        </div>
                        
                        <p className='text-gray-500 text-sm mb-6 line-clamp-2 flex-1'>
                            {project.description || "Chưa có mô tả chi tiết cho dự án này."}
                        </p>
                        
                        <div className='flex justify-between items-center border-t border-gray-100 pt-4 mt-auto'>
                            <div className='text-xs font-medium text-gray-400'>
                                Nhấn để xem chi tiết
                            </div>
                            <button className='text-sm text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1'>
                                Vào dự án <span className="text-lg leading-none">&rarr;</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal, bảng nổi lên để tạo dự án  */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Tạo dự án mới</h2>

                        <form onSubmit={handleCreateProject} className='space-y-5'>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên dự án <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)} 
                                    placeholder='VD: Hệ thống CRM...'
                                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition'
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mã dự án (Key) <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                                    placeholder="Vd: CRM, JIRA..." 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mô tả ngắn</label>
                                <textarea 
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="Mục tiêu của dự án này là gì?" 
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isCreating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-sm hover:shadow disabled:opacity-50"
                                >
                                    {isCreating ? 'Đang tạo...' : 'Tạo dự án'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}