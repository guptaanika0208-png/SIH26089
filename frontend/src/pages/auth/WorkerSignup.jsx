import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

function WorkerSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const cooperativeId = '6aa1027310b84da7531d606c'; // hardcoded — only one cooperative exists right now

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);

      const data = {
        name,
        email,
        password,
        phone,
        cooperative: cooperativeId,
        skills: skillsArray,
        location: {
          city: 'Delhi',
          coordinates: { coordinates: [77.209, 28.6139] } // hardcoded for now
        }
      };

      await registerUser('worker', data);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Worker Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="text" placeholder="Skills (comma separated, e.g. cleaning, plumbing)" value={skills} onChange={(e) => setSkills(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

        <button type="submit" style={{ width: '100%', padding: '10px' }}>Sign Up</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: '#4caf50' }}>{success}</p>}

      <p style={{ marginTop: '15px' }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default WorkerSignup;