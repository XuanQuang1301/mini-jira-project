

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tổng quan hệ thống</h1>
      
      {/* 3 Thẻ thống kê (Card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 font-medium mb-2">Tổng số Dự án</h3>
          <p className="text-4xl font-bold text-blue-400">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 font-medium mb-2">Task đang làm</h3>
          <p className="text-4xl font-bold text-yellow-400">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 font-medium mb-2">Task trễ hạn</h3>
          <p className="text-4xl font-bold text-red-400">0</p>
        </div>
      </div>
    </div>
  );
}