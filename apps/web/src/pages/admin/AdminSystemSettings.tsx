import { useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Save, 
  RefreshCw, 
  Check, 
  Server
} from "lucide-react";

export default function AdminSystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [maxUploadSize, setMaxUploadSize] = useState("10");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans antialiased text-slate-800 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="w-6 h-6 text-slate-900" />
            <span>Cấu Hình System Admin</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Quản lý các tham số hệ thống, bảo mật và tính năng mở rộng sau này
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Save className="w-4 h-4 text-white" />
          )}
          <span>{savedSuccess ? "Đã lưu cài đặt!" : "Lưu thay đổi"}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Access Toggle Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">Quyền Truy Cập & Bảo Mật</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Cho phép đăng ký tài khoản mới</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Người dùng tự do đăng ký trên trang Register</p>
              </div>
              <button
                onClick={() => setAllowRegistration(!allowRegistration)}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                  allowRegistration ? "bg-slate-900" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    allowRegistration ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="font-bold text-slate-900">Chế độ Bảo trì Hệ thống (Maintenance)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Chỉ tài khoản Admin mới có thể truy cập</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                  maintenanceMode ? "bg-rose-600" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="font-bold text-slate-900 block">Thời gian hết hạn JWT Session (Giờ)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">Cơ Sở Dữ Liệu & Lưu Trữ</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">ORM Engine:</span>
                <span className="text-slate-900 font-bold">Drizzle ORM (PostgreSQL)</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Drizzle Studio Port:</span>
                <span className="text-slate-900 font-bold">4984</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-900 block">Dung lượng tối đa đính kèm file (MB)</label>
              <input
                type="number"
                value={maxUploadSize}
                onChange={(e) => setMaxUploadSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900 font-medium"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-slate-900">
                <Server className="w-4 h-4 text-slate-900" /> Sẵn sàng mở rộng tương lai
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Các module Quản lý Audit Log, Tích hợp OAuth2, Microservices Sync có thể dễ dàng triển khai tại module trang Admin này.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
