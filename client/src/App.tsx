import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Projects from './pages/Projects'; 
import ProjectDetail from './pages/ProjectDetail';
function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route element ={<Layout />}>
        <Route path="/" element = {<Dashboard /> } />

        <Route path ="/projects" element = {<Projects />} /> 
        <Route path = "/projects/:id" element={<ProjectDetail /> } /> 
      </Route>
    </Routes>
  );
}

export default App;