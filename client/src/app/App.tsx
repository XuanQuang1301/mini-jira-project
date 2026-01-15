import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Projects } from "./components/Projects";
import { Tasks } from "./components/Tasks";
import { Team } from "./components/Team";
import { CalendarView } from "./components/CalendarView";
import { Reports } from "./components/Reports";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <Projects />;
      case "tasks":
        return <Tasks />;
      case "calendar":
        return <CalendarView />;
      case "team":
        return <Team />;
      case "reports":
        return <Reports />;
      case "settings":
        return (
          <div className="text-center py-12 text-gray-500">
            <h2 className="text-2xl mb-2">Cài đặt</h2>
            <p>Chức năng đang được phát triển</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="size-full flex bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}