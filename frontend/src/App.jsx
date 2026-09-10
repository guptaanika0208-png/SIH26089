import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import WorkerDashboard from './pages/worker/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import BookService from './pages/customer/BookService';
import WorkerSignup from './pages/auth/WorkerSignup';
import CustomerSignup from './pages/auth/CustomerSignup';
import RequestContract from './pages/customer/RequestContract';

function App() {
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/worker" element={<WorkerSignup />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />

          <Route path="/worker/dashboard" element={
            <ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>
          } />

          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>
          } />

          <Route path="/customer/book" element={
            <ProtectedRoute allowedRole="customer"><BookService /></ProtectedRoute>
          } />

          <Route path="/customer/contract" element={
            <ProtectedRoute allowedRole="customer"><RequestContract /></ProtectedRoute>
          } />

          <Route path="/cooperative/dashboard" element={
            <ProtectedRoute allowedRole="cooperative"><AdminDashboard /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;