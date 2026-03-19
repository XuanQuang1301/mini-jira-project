import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Projects from './pages/Projects'; 
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import Profile from './pages/Profile';
function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route element ={<Layout />}>
        <Route path="/" element = {<Dashboard /> } />
        <Route path ="/projects" element = {<Projects />} /> 
        <Route path = "/projects/:id" element={<ProjectDetail /> } /> 
        <Route path ="/tasks" element={<MyTasks /> } /> 
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;