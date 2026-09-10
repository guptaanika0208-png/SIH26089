import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import WorkerDashboard from './pages/worker/Dashboard';

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;