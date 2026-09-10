import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import WorkerDashboard from './pages/worker/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import BookService from './pages/customer/BookService';

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/cooperative/dashboard" element={<AdminDashboard />} />
        <Route path="/customer/book" element={<BookService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;