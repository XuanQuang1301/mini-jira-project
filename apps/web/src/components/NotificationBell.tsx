import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Bell, CheckCheck, FolderKanban, CheckSquare, Sparkles, X, ExternalLink } from "lucide-react";

interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for real-time update
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (item: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item.isRead) {
      try {
        await api.patch(`/api/notifications/${item.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Mark read error:", err);
      }
    }
    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } catch {
      return "Gần đây";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case "PROJECT_INVITED":
        return <FolderKanban className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return "bg-blue-50 border-blue-100";
      case "PROJECT_INVITED":
        return "bg-emerald-50 border-emerald-100";
      default:
        return "bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-xs relative active:scale-95"
        title="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-100">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-100">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-bold text-slate-700">Chưa có thông báo nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Khi bạn được gán task hoặc mời vào dự án, thông báo sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group hover:bg-slate-50/80 ${
                    !item.isRead ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${getIconBg(
                      item.type
                    )}`}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          !item.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                Tự động cập nhật thông báo thời gian thực
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
