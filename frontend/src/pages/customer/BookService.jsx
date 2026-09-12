import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking, autoAssignBooking } from '../../services/bookingService';
import { getServiceIcon } from '../../utils/serviceIcons';
import { getCurrentLocation } from '../../utils/geolocation';

const hourlyRates = {
  cleaning: 150,
  plumbing: 200,
  electrical: 250,
  'elder care': 200,
  gardening: 120
};

const EMERGENCY_MULTIPLIER = 1.5;
const allServices = Object.keys(hourlyRates);

function BookService() {
  const [selectedServices, setSelectedServices] = useState(['cleaning']);
  const [duration, setDuration] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState([77.209, 28.6139]); // fallback default
  const [locationStatus, setLocationStatus] = useState('');

  const customer = JSON.parse(localStorage.getItem('user'));
  const cooperativeId = '6aa1027310b84da7531d606c';

  useEffect(() => {
    if (isEmergency) {
      const today = new Date().toISOString().split('T')[0];
      setScheduledDate(today);
    }
  }, [isEmergency]);

  const today = new Date().toISOString().split('T')[0];

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const totalPrice = selectedServices.reduce((sum, s) => {
    const base = hourlyRates[s] * duration;
    return sum + (isEmergency ? Math.round(base * EMERGENCY_MULTIPLIER) : base);
  }, 0);

  // separate, standalone function — was accidentally nested inside handleSubmit before
  const handleUseLocation = async () => {
    setLocationStatus('Getting your location...');
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setCoordinates([longitude, latitude]); // MongoDB expects [lng, lat] order
      setLocationStatus('✓ Location captured');
    } catch (err) {
      setLocationStatus('Could not get location — using default (Delhi)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      setStatus('Please select at least one service.');
      return;
    }

    setStatus(`Creating ${selectedServices.length} booking(s)...`);
    setResults([]);

    const groupResults = [];

    for (const service of selectedServices) {
      try {
        const base = hourlyRates[service] * duration;
        const price = isEmergency ? Math.round(base * EMERGENCY_MULTIPLIER) : base;

        const bookingData = {
          customer: customer.id,
          cooperative: cooperativeId,
          serviceType: service,
          isEmergency,
          location: {
            city: 'Delhi',
            coordinates: { coordinates }
          },
          scheduledDate,
          scheduledTime,
          price
        };

        const created = await createBooking(bookingData);
        const assigned = await autoAssignBooking(created.booking._id);

        groupResults.push({
          service,
          workerName: assigned.matchDetails.workerName,
          distanceKm: assigned.matchDetails.distanceKm
        });
      } catch (err) {
        groupResults.push({ service, error: err.response?.data?.message || 'Failed to book' });
      }
    }

    setResults(groupResults);
    setStatus('Done!');
    setTimeout(() => navigate('/customer/dashboard'), 2500);
  };

  return (
    <div className="auth-page">
      {/* back button so users on mobile aren't stuck relying on the browser's own back gesture */}
      <button
        className="outline"
        style={{ width: 'auto', padding: '8px 14px', marginBottom: '15px' }}
        onClick={() => navigate('/customer/dashboard')}
      >
        ← Back
      </button>

      <h2>Book a Service</h2>
      <p className="muted" style={{ marginTop: '-8px' }}>Select one or more services — each gets matched to its own worker</p>

      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: 'left', marginBottom: '12px' }}>
          {allServices.map((service) => (
            <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
                style={{ width: 'auto', margin: 0 }}
              />
              {getServiceIcon(service)} {service.charAt(0).toUpperCase() + service.slice(1)} — ₹{hourlyRates[service]}/hr
            </label>
          ))}
        </div>

        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          <option value={1}>1 hour</option>
          <option value={2}>2 hours</option>
          <option value={3}>3 hours</option>
          <option value={4}>4 hours</option>
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

        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          min={today}
          max={isEmergency ? today : undefined}
          disabled={isEmergency}
          required
        />

        <input
          type="text"
          placeholder="Time (e.g. 10:00 AM)"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          required
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textAlign: 'left' }}>
          <input
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            style={{ width: 'auto', margin: 0 }}
          />
          🚨 This is an emergency (urgent, needs immediate attention)
        </label>

        {isEmergency && (
          <p className="muted" style={{ fontSize: '0.85em', marginTop: '-6px', marginBottom: '10px', textAlign: 'left' }}>
            Emergency requests are scheduled for today and matched to the nearest available worker. A +50% urgency surcharge applies.
          </p>
        )}

        <div className="card" style={{ padding: '12px', marginBottom: '12px', textAlign: 'left' }}>
          <strong>Total Estimated Price:</strong> ₹{totalPrice}
          <br />
          <span className="muted" style={{ fontSize: '0.85em' }}>
            {selectedServices.length} service(s) × {duration}hr{isEmergency ? ' × 1.5 emergency surcharge' : ''} — cooperative rate card
          </span>
        </div>

        <button type="submit" className="primary">
          {isEmergency ? '🚨 Request Emergency Services' : `Book ${selectedServices.length} Service(s)`}
        </button>
      </form>

      {status && <p style={{ marginTop: '15px' }}>{status}</p>}

      {results.length > 0 && (
        <div className="card">
          <h3>Booking Results</h3>
          {results.map((r, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < results.length - 1 ? '1px solid #eee' : 'none' }}>
              {r.error ? (
                <p style={{ color: '#b44835' }}>{getServiceIcon(r.service)} {r.service}: {r.error}</p>
              ) : (
                <p>{getServiceIcon(r.service)} {r.service}: matched with <strong>{r.workerName}</strong> ({r.distanceKm} km away)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookService;