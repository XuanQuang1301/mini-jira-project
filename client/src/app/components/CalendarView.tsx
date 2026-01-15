import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "./ui/utils";

interface Event {
  id: number;
  title: string;
  type: "project" | "task" | "meeting";
  date: Date;
  time?: string;
  priority?: "high" | "medium" | "low";
  project: string;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 10)); // January 10, 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 0, 10));

  const events: Event[] = [
    {
      id: 1,
      title: "Dashboard Analytics - Deadline",
      type: "project",
      date: new Date(2026, 0, 12),
      priority: "high",
      project: "Dashboard Analytics",
    },
    {
      id: 2,
      title: "Thiết kế giao diện trang chủ",
      type: "task",
      date: new Date(2026, 0, 12),
      time: "09:00",
      priority: "high",
      project: "Website Marketing",
    },
    {
      id: 3,
      title: "Viết API đăng nhập",
      type: "task",
      date: new Date(2026, 0, 13),
      time: "10:30",
      priority: "high",
      project: "Mobile App v2.0",
    },
    {
      id: 4,
      title: "Test chức năng thanh toán",
      type: "task",
      date: new Date(2026, 0, 14),
      time: "14:00",
      priority: "medium",
      project: "E-commerce Platform",
    },
    {
      id: 5,
      title: "Website Marketing - Deadline",
      type: "project",
      date: new Date(2026, 0, 15),
      priority: "high",
      project: "Website Marketing",
    },
    {
      id: 6,
      title: "Tối ưu hiệu suất database",
      type: "task",
      date: new Date(2026, 0, 15),
      time: "11:00",
      priority: "high",
      project: "Dashboard Analytics",
    },
    {
      id: 7,
      title: "Họp đánh giá Sprint",
      type: "meeting",
      date: new Date(2026, 0, 16),
      time: "15:00",
      project: "Team Meeting",
    },
    {
      id: 8,
      title: "Mobile App v2.0 - Deadline",
      type: "project",
      date: new Date(2026, 0, 20),
      priority: "high",
      project: "Mobile App v2.0",
    },
    {
      id: 9,
      title: "CRM System - Deadline",
      type: "project",
      date: new Date(2026, 0, 25),
      priority: "medium",
      project: "CRM System",
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date(2026, 0, 10); // Current date in the app
    return isSameDay(date, today);
  };

  const getEventTypeColor = (type: Event["type"]) => {
    const colors = {
      project: "bg-purple-100 text-purple-700 border-l-4 border-purple-500",
      task: "bg-blue-100 text-blue-700 border-l-4 border-blue-500",
      meeting: "bg-green-100 text-green-700 border-l-4 border-green-500",
    };
    return colors[type];
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Lịch</h2>
        <p className="text-gray-600">Theo dõi deadline và sự kiện</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft size={20} />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = getEventsForDate(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "aspect-square p-2 rounded-lg border transition-all hover:border-blue-300",
                    isSelected && "border-blue-500 bg-blue-50",
                    isTodayDate && "border-blue-400 bg-blue-50",
                    !isSelected && !isTodayDate && "border-gray-200"
                  )}
                >
                  <div className="text-sm mb-1">{day}</div>
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "h-1 rounded-full",
                          event.type === "project" && "bg-purple-500",
                          event.type === "task" && "bg-blue-500",
                          event.type === "meeting" && "bg-green-500"
                        )}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm text-gray-600">Dự án</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Nhiệm vụ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Họp</span>
            </div>
          </div>
        </Card>

        {/* Event list for selected date */}
        <Card className="p-6">
          <h3 className="text-lg mb-4">
            {selectedDate
              ? `Sự kiện - ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`
              : "Chọn ngày"}
          </h3>
          
          <div className="space-y-3">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div key={event.id} className={cn("p-3 rounded-lg", getEventTypeColor(event.type))}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm flex-1 pr-2">{event.title}</h4>
                    {event.priority && (
                      <Badge
                        className={cn(
                          "text-xs",
                          event.priority === "high" && "bg-red-500 text-white",
                          event.priority === "medium" && "bg-orange-500 text-white",
                          event.priority === "low" && "bg-blue-500 text-white"
                        )}
                      >
                        {event.priority === "high" ? "Cao" : event.priority === "medium" ? "TB" : "Thấp"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-75 mb-2">{event.project}</p>
                  {event.time && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock size={12} />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Không có sự kiện nào
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming events */}
      <Card className="p-6">
        <h3 className="text-lg mb-4">Sự kiện sắp tới</h3>
        <div className="space-y-3">
          {events
            .filter((event) => event.date >= new Date(2026, 0, 10))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-center min-w-[60px]">
                  <div className="text-2xl">{event.date.getDate()}</div>
                  <div className="text-sm text-gray-600">
                    Tháng {event.date.getMonth() + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs",
                        event.type === "project" && "bg-purple-100 text-purple-700",
                        event.type === "task" && "bg-blue-100 text-blue-700",
                        event.type === "meeting" && "bg-green-100 text-green-700"
                      )}
                    >
                      {event.type === "project" ? "Dự án" : event.type === "task" ? "Nhiệm vụ" : "Họp"}
                    </Badge>
                    <span className="text-xs text-gray-600">{event.project}</span>
                  </div>
                </div>
                {event.time && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{event.time}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
