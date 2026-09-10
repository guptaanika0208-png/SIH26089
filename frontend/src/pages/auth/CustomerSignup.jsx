import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

function CustomerSignup() {
  const [type, setType] = useState('individual');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        type,
        email,
        password,
        phone,
        location: {
          city: 'Delhi',
          coordinates: { coordinates: [77.209, 28.6139] } // hardcoded for now
        },
        ...(type === 'individual'
          ? { name }
          : { organizationName, contactPerson, registrationNumber })
      };

      await registerUser('customer', data);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Customer Sign Up</h2>

      <select value={type} onChange={(e) => setType(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
        <option value="individual">Individual / Household</option>
        <option value="institutional">Institution (School, Hospital, Office, etc.)</option>
      </select>

      <form onSubmit={handleSubmit}>
        {type === 'individual' ? (
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        ) : (
          <>
            <input type="text" placeholder="Organization Name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
            <input type="text" placeholder="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
            <input type="text" placeholder="Registration Number (GST/etc.)" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          </>
        )}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required
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

export default CustomerSignup;