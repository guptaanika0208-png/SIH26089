import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { listCooperatives } from '../../services/cooperativeService';
import { getCurrentLocation } from '../../utils/geolocation';

function WorkerSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [cooperatives, setCooperatives] = useState([]);
  const [selectedCooperative, setSelectedCooperative] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState([77.209, 28.6139]);
  const [locationStatus, setLocationStatus] = useState('');

  // fetch the list of cooperatives to choose from at signup
  useEffect(() => {
    listCooperatives()
      .then((data) => {
        setCooperatives(data.cooperatives);
        if (data.cooperatives.length > 0) {
          setSelectedCooperative(data.cooperatives[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCooperative) {
      setError('Please select a cooperative to join.');
      return;
    }

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);

      const data = {
        name,
        email,
        password,
        phone,
        cooperative: selectedCooperative,
        skills: skillsArray,
        location: {
          city: 'Delhi',
          coordinates: { coordinates }
        }
      };

      await registerUser('worker', data);
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
      <h2>Worker Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="text" placeholder="Skills (comma separated, e.g. cleaning, plumbing)" value={skills} onChange={(e) => setSkills(e.target.value)} required />

        <select value={selectedCooperative} onChange={(e) => setSelectedCooperative(e.target.value)} required>
          {cooperatives.length === 0 && <option value="">No cooperatives available</option>}
          {cooperatives.map((coop) => (
            <option key={coop._id} value={coop._id}>{coop.name}</option>
          ))}
        </select>

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

export default WorkerSignup;