import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking, autoAssignBooking } from '../../services/bookingService';

const hourlyRates = {
  cleaning: 150,
  plumbing: 200,
  electrical: 250,
  'elder care': 200,
  gardening: 120
};

const EMERGENCY_MULTIPLIER = 1.5;

function BookService() {
  const [serviceType, setServiceType] = useState('cleaning');
  const [duration, setDuration] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [price, setPrice] = useState(hourlyRates['cleaning'] * 1);
  const [status, setStatus] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem('user'));
  const cooperativeId = '6aa1027310b84da7531d606c'; // hardcoded — only one cooperative exists right now

  // recalculate price whenever service type, duration, or emergency flag changes
  useEffect(() => {
    const base = hourlyRates[serviceType] * duration;
    setPrice(isEmergency ? Math.round(base * EMERGENCY_MULTIPLIER) : base);
  }, [serviceType, duration, isEmergency]);

  // when emergency is checked, force scheduledDate to today (no advance scheduling for emergencies)
  useEffect(() => {
    if (isEmergency) {
      const today = new Date().toISOString().split('T')[0];
      setScheduledDate(today);
    }
  }, [isEmergency]);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Creating booking...');
    setMatchInfo(null);

    try {
      const bookingData = {
        customer: customer.id,
        cooperative: cooperativeId,
        serviceType,
        isEmergency,
        location: {
          city: 'Delhi',
          coordinates: { coordinates: [77.209, 28.6139] } // hardcoded for now
        },
        scheduledDate,
        scheduledTime,
        price
      };

      const created = await createBooking(bookingData);
      setStatus('Booking created. Finding best worker...');

      const assigned = await autoAssignBooking(created.booking._id);
      setStatus('Worker matched successfully!');
      setMatchInfo(assigned.matchDetails);

      setTimeout(() => navigate('/customer/dashboard'), 2000);
    } catch (err) {
      setStatus('Something went wrong: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="auth-page">
      <h2>Book a Service</h2>

      <form onSubmit={handleSubmit}>
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
          <option value="cleaning">🧹 Cleaning</option>
          <option value="plumbing">🔧 Plumbing</option>
          <option value="electrical">⚡ Electrical</option>
          <option value="elder care">👵 Elder Care</option>
          <option value="gardening">🌱 Gardening</option>
        </select>

        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          <option value={1}>1 hour</option>
          <option value={2}>2 hours</option>
          <option value={3}>3 hours</option>
          <option value={4}>4 hours</option>
        </select>

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
          <strong>Price:</strong> ₹{price}{' '}
          <span className="muted" style={{ fontSize: '0.85em' }}>
            (₹{hourlyRates[serviceType]}/hr × {duration}hr{isEmergency ? ' × 1.5 emergency surcharge' : ''} — cooperative rate card)
          </span>
        </div>

        <button type="submit" className="primary">
          {isEmergency ? '🚨 Request Emergency Service' : 'Book Now'}
        </button>
      </form>

      {status && <p style={{ marginTop: '15px' }}>{status}</p>}

      {matchInfo && (
        <div className="card" style={{ borderColor: '#8bc8ad' }}>
          <p><strong>Matched Worker:</strong> {matchInfo.workerName}</p>
          <p><strong>Distance:</strong> {matchInfo.distanceKm} km</p>
          <p><strong>Match Score:</strong> {matchInfo.matchScore}</p>
        </div>
      )}
    </div>
  );
}

export default BookService;