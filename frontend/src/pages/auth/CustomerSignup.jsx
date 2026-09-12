import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { getCurrentLocation } from '../../utils/geolocation';

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
  const [coordinates, setCoordinates] = useState([77.209, 28.6139]);
  const [locationStatus, setLocationStatus] = useState('');

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
          coordinates: { coordinates }
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

  const handleUseLocation = async () => {
    setLocationStatus('Getting your location...');
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setCoordinates([longitude, latitude]);
      setLocationStatus('✓ Location captured');
    } catch (err) {
      setLocationStatus('Could not get location — using default (Delhi)');
    }
  };

  return (
    <div className="auth-page">
      <h2>Customer Sign Up</h2>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="individual">Individual / Household</option>
        <option value="institutional">Institution (School, Hospital, Office, etc.)</option>
      </select>

      <form onSubmit={handleSubmit}>
        {type === 'individual' ? (
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        ) : (
          <>
            <input type="text" placeholder="Organization Name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
            <input type="text" placeholder="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
            <input type="text" placeholder="Registration Number (GST/etc.)" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required />
          </>
        )}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />

        <button type="button" className="outline" style={{ marginBottom: '10px' }} onClick={handleUseLocation}>
          📍 Use My Current Location
        </button>
        {locationStatus && <p className="muted" style={{ fontSize: '0.85em', marginTop: '-6px', marginBottom: '10px' }}>{locationStatus}</p>}

        {locationStatus.includes('captured') && (
          <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #dce7e2' }}>
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}&output=embed`}
            />
          </div>
        )}

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

export default CustomerSignup;