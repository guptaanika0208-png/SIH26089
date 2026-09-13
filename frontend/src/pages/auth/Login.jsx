import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [role, setRole] = useState('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const emailField = role === 'cooperative' ? 'adminEmail' : 'email';
      const credentials = { [emailField]: email, password };

      const data = await loginUser(role, credentials);
      const userData = data[role] || data.worker || data.customer || data.cooperative;

      login(userData, role, data.token);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="brand" style={{ textAlign: 'center', marginBottom: '4px' }}>GharGo</div>
      <p className="muted" style={{ marginTop: 0, marginBottom: '15px' }}>Fast, trusted, cooperative-owned home services</p>
      <h2>Login</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="worker">Worker</option>
        <option value="customer">Customer</option>
        <option value="cooperative">Cooperative Admin</option>
      </select>

      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="primary">Login</button>
      </form>

      {error && <p style={{ color: '#d65348', marginTop: '10px' }}>{error}</p>}

      <div className="card" style={{ textAlign: 'left', marginTop: '20px', background: '#fff3e8', border: '1px solid #f5d9bd' }}>
        <p style={{ fontWeight: 800, marginBottom: '8px' }}>Demo accounts for judges</p>
        <p className="ts" style={{ margin: '4px 0' }}><strong>Worker:</strong> worker1@eg.com / worker1</p>
        <p className="ts" style={{ margin: '4px 0' }}><strong>Customer:</strong> customer1@eg.com / customer1</p>
        <p className="ts" style={{ margin: '4px 0' }}><strong>Cooperative Admin:</strong> admin@eg.com / admin1</p>
      </div>

      <div className="link-row">New worker? <a href="/signup/worker">Sign up here</a></div>
      <div className="link-row">New customer? <a href="/signup/customer">Sign up here</a></div>
      <div className="link-row">New cooperative? <a href="/signup/cooperative">Sign up here</a></div>
    </div>
  );
}

export default Login;