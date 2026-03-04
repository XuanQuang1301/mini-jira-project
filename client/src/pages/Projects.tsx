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

    //Các STATE dành cho MODAL (bảng tạo dự án)
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [newName, setNewName] = useState(''); 
    const [newKey, setNewKey] = useState(''); 
    const [newDesc, setNewDesc] = useState(''); 
    const [isCreating, setIsCreating] = useState(false); 
    const navigate = useNavigate(); 
    //Hàm lấy danh sách dự án (Tách ra để tái sử dụng)
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

    //Hàm xử lý khi bấm nút tạo dự án trong modal 

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();  //Ngan chan load laji trang 
        setIsCreating(true);
        try{
            const token = localStorage.getItem('token'); 

            await axios.post('http://localhost:5000/api/projects', {
                name: newName, 
                key: newKey, 
                description: newDesc
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
    return (
        <div> 
            {/* Phần Header của trang  */}
            <div className="flex justify-between items-center mb-8"> 
                <div>
                    <h1 className='text-3xl font-bold text-white mb-2'> Dự án của tôi </h1>
                    <p className='text-gray-400 text-sm'>Quản lý các dự án bạn đang làm</p>
                </div>
                <button 
                onClick={()=> setIsModalOpen(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-lg items-center gap-2'> 
                    <span className='text-xl leading-none'> + </span>
                </button>
            </div>
            {/* Hiển thị Loading hoặc Lỗi nếu có */}
            {isLoading && <p className="text-blue-400">Đang tải dữ liệu dự án...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* Nếu không có lỗi và đã tải xong, nhưng mảng rỗng */}
            {!isLoading && !error && projects.length === 0 && (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <p className="text-gray-400 mb-4">Bạn chưa tham gia dự án nào.</p>
                </div>
            )}
            {/* Lưới dang sách các dự án  */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {projects.map((project) => (
                    <div
                    onClick={() => navigate(`${project.id}`)}
                    key = {project.id}
                    className='relative bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500 transition cursor-pointer group'
                    >
                        <div className='flex justify-between items-start mb-4'>
                            <h3 className='text-xl font-bold text-blue-400 group-hover:text-blue-300 transition'>{project.name}</h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold 
                                ${project.role === 'MENTOR' || project.role === 'OWNER'
                                ? 'bg-purple-900/50 text-purple-400 border border-purple-700/50' 
                                : 'bg-gray-700 text-gray-300 border border-gray-600'
                                }`}
                            > 
                                {project.role}
                            </span>
                        </div>
                        <p className='text-gray-400 text-sm mb-6 line-clamp-2'>{project.description || "Chưa có mô tả cho dự án này"}</p>
                        <div className='flex justify-between items-center border-gray-700 pt-4'>
                            <div className='text-xc text-gray-500'>
                                Cập nhật 2 giờ trước 
                            </div>
                            <button className='text-sm text-blue-400 hover:text-blue-400 font-medium transition'>
                                Vào dự án &rarr;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Modal, bảng nổi lên để tạo dự án  */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">Tạo dự án mới</h2>

                        <form onSubmit={handleCreateProject}
                        className='space-y-4'
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Tên dự án<span className="text-red-500">*</span> </label>
                                <input 
                                type="text"
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)} 
                                placeholder='VD: Hệ thống CRM...'
                                className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Mã dự án (Key) <span className="text-red-500">*</span></label>
                                <input 
                                type="text" 
                                required
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                                placeholder="Vd: CRM, JIRA..." 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả ngắn</label>
                                <textarea 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Mục tiêu của dự án này là gì?" 
                                rows={3}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 py-2.5 rounded-lg font-semibold transition"
                                >
                                Hủy bỏ
                                </button>
                                <button 
                                type="submit" 
                                disabled={isCreating}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
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