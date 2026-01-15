import { Home, FolderKanban, CheckSquare, Users, Settings, BarChart3, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "./ui/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Trang chủ", icon: Home },
    { id: "projects", label: "Dự án", icon: FolderKanban },
    { id: "tasks", label: "Nhiệm vụ", icon: CheckSquare },
    { id: "calendar", label: "Lịch", icon: CalendarIcon },
    { id: "team", label: "Nhóm", icon: Users },
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl text-blue-600">ProjectHub</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}