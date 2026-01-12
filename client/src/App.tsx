import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Loginpage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Mặc định chuyển về trang login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Dashboard sẽ làm sau */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;