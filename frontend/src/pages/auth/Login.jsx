import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';

function Login() {
  const [role, setRole] = useState('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const emailField = role === 'cooperative' ? 'adminEmail' : 'email';
      const credentials = { [emailField]: email, password };

      const data = await loginUser(role, credentials);

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(data[role] || data.worker || data.customer || data.cooperative));

      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Login</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: '10px', width: '100%', padding: '8px' }}>
        <option value="worker">Worker</option>
        <option value="customer">Customer</option>
        <option value="cooperative">Cooperative Admin</option>
      </select>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Login
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;