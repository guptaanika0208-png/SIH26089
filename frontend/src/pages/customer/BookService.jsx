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

function BookService() {
  const [serviceType, setServiceType] = useState('cleaning');
  const [duration, setDuration] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [price, setPrice] = useState(hourlyRates['cleaning'] * 1);
  const [status, setStatus] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem('user'));
  const cooperativeId = '6aa1027310b84da7531d606c'; // hardcoded for now — only one cooperative exists

  // recalculate price whenever service type or duration changes
  useEffect(() => {
    setPrice(hourlyRates[serviceType] * duration);
  }, [serviceType, duration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Creating booking...');
    setMatchInfo(null);

    try {
      const bookingData = {
        customer: customer.id,
        cooperative: cooperativeId,
        serviceType,
        isEmergency: false,
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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Book a Service</h2>

      <form onSubmit={handleSubmit}>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        >
          <option value="cleaning">Cleaning</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="elder care">Elder Care</option>
          <option value="gardening">Gardening</option>
        </select>

        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        >
          <option value={1}>1 hour</option>
          <option value={2}>2 hours</option>
          <option value={3}>3 hours</option>
          <option value={4}>4 hours</option>
        </select>

        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />

        <input
          type="text"
          placeholder="Time (e.g. 10:00 AM)"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />

        <div style={{ padding: '10px', marginBottom: '10px', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>Price:</strong> ₹{price}{' '}
          <span style={{ color: '#888', fontSize: '0.85em' }}>
            (₹{hourlyRates[serviceType]}/hr × {duration}hr — cooperative rate card)
          </span>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Book Now
        </button>
      </form>

      {status && <p style={{ marginTop: '15px' }}>{status}</p>}

      {matchInfo && (
        <div style={{ border: '1px solid #4caf50', borderRadius: '8px', padding: '10px', marginTop: '10px' }}>
          <p><strong>Matched Worker:</strong> {matchInfo.workerName}</p>
          <p><strong>Distance:</strong> {matchInfo.distanceKm} km</p>
          <p><strong>Match Score:</strong> {matchInfo.matchScore}</p>
        </div>
      )}
    </div>
  );
}

export default BookService;