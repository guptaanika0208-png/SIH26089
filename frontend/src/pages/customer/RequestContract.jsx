import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const bulkHourlyRates = {
  cleaning: 100,      // discounted vs 150 for individual
  plumbing: 150,      // vs 200
  electrical: 180,    // vs 250
  'elder care': 150,  // vs 200
  gardening: 90        // vs 120
};

function RequestContract() {
  const [serviceType, setServiceType] = useState('cleaning');
  const [workersRequired, setWorkersRequired] = useState(1);
  const [frequency, setFrequency] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem('user'));
  const cooperativeId = '6aa1027310b84da7531d606c';

  const monthlyEstimate = bulkHourlyRates[serviceType] * 4 * workersRequired * 4; 
  // rough estimate: rate × 4hrs/visit × 4 visits/month × number of workers

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting contract request...');

    try {
      const subscriptionData = {
        customer: customer.id,
        cooperative: cooperativeId,
        serviceType,
        contractType: 'fixed-term',
        frequency,
        workersRequired,
        startDate,
        endDate,
        location: {
          city: 'Delhi',
          coordinates: { coordinates: [77.209, 28.6139] }
        },
        price: {
          amount: monthlyEstimate,
          billingCycle: 'monthly'
        }
      };

      await api.post('/subscriptions/create', subscriptionData);
      setStatus('Contract request submitted successfully!');
      setTimeout(() => navigate('/customer/dashboard'), 1500);
    } catch (err) {
      setStatus('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '20px' }}>
      <h2>Request Workforce Contract</h2>
      <p style={{ color: '#888', fontSize: '0.9em' }}>Bulk institutional rates apply</p>

      <form onSubmit={handleSubmit}>
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
          <option value="cleaning">Cleaning</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="elder care">Elder Care</option>
          <option value="gardening">Gardening</option>
        </select>

        <label style={{ display: 'block', marginBottom: '5px' }}>Workers Required</label>
        <input type="number" min="1" value={workersRequired} onChange={(e) => setWorkersRequired(Number(e.target.value))} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

        <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="one-time-term">Fixed Term (e.g. 6 months)</option>
        </select>

        <label style={{ display: 'block', marginBottom: '5px' }}>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

        <label style={{ display: 'block', marginBottom: '5px' }}>End Date (optional)</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

        <div style={{ padding: '10px', marginBottom: '10px', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>Estimated Monthly Cost:</strong> ₹{monthlyEstimate}
          <br />
          <span style={{ color: '#888', fontSize: '0.85em' }}>
            (₹{bulkHourlyRates[serviceType]}/hr bulk rate × {workersRequired} worker(s))
          </span>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px' }}>Submit Request</button>
      </form>

      {status && <p style={{ marginTop: '15px' }}>{status}</p>}
    </div>
  );
}

export default RequestContract;