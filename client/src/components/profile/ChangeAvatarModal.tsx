import { useState } from 'react';
import api from '../../services/api';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

export default function ChangeAvatarModal({ currentAvatar, onClose, onUpdate }: any) {
    const [preview, setPreview] = useState(currentAvatar || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null); 
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!selectedFile) {
            alert("Vui lòng chọn ảnh!");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile); 

            const res = await api.post('/api/users/profile/avatar', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            
            onUpdate(res.data.avatarUrl); 
            onClose();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi tải ảnh lên!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200/80 animate-fade-in">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cập nhật ảnh đại diện</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                    <div className="w-36 h-36 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                        {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <ImageIcon className="w-8 h-8 mb-1 opacity-60" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Chưa chọn ảnh</span>
                            </div>
                        )}
                    </div>

                    <label className="cursor-pointer bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium text-xs hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-xs flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Chọn tệp từ máy tính</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="flex justify-end gap-2.5 mt-8 pt-4 border-t border-slate-100">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 font-medium text-xs text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !selectedFile}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium text-xs shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isSaving ? 'Đang tải lên...' : 'Tải ảnh lên'}
                    </button>
                </div>
            </div>
        </div>
    );
}
