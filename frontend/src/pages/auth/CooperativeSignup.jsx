import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

function CooperativeSignup() {
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        name,
        registrationNumber,
        adminEmail,
        password,
        contactPhone,
        location: {
          city: 'Delhi',
          coordinates: { coordinates: [77.209, 28.6139] } // hardcoded for now
        }
      };

      await registerUser('cooperative', data);
      setSuccess('Cooperative registered! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <h2>Cooperative Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Cooperative Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Registration Number" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required />
        <input type="email" placeholder="Admin Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />

        <button type="submit" className="primary">Sign Up</button>
      </form>

      {error && <p style={{ color: '#d65348', marginTop: '10px' }}>{error}</p>}
      {success && <p style={{ color: '#177453', marginTop: '10px' }}>{success}</p>}

      <div className="link-row">
        Already have an account? <a href="/login">Login</a>
      </div>
    </div>
  );
}

export default CooperativeSignup;