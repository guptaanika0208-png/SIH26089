import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../../components/LogoutButton';
import { getCustomerSubscriptions } from '../../services/subscriptionService';
import { getServiceIcon } from '../../utils/serviceIcons';
import { getCustomerBookings, rateBooking } from '../../services/bookingService';

function CustomerDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCustomer(storedUser);

    if (storedUser?.id) {
      getCustomerBookings(storedUser.id)
        .then((data) => setBookings(data.bookings))
        .catch((err) => console.error(err));

      getCustomerSubscriptions(storedUser.id)
        .then((data) => setSubscriptions(data.subscriptions))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  const [ratingInputs, setRatingInputs] = useState({});

  const handleRatingChange = (bookingId, value) => {
    setRatingInputs({ ...ratingInputs, [bookingId]: value });
  };

  const submitRating = async (bookingId) => {
    const score = ratingInputs[bookingId];
    if (!score) return;
    try {
      await rateBooking(bookingId, Number(score));
      const updated = await getCustomerBookings(customer.id);
      setBookings(updated.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">Welcome, {customer?.name || customer?.organizationName || customer?.email}</div>
        <LogoutButton />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button onClick={() => navigate('/customer/book')} className="primary" style={{ width: 'auto', flex: 1 }}>
          Book a One-Time Service
        </button>
        <button onClick={() => navigate('/customer/contract')} className="outline" style={{ width: 'auto', flex: 1 }}>
          {customer?.type === 'institutional' ? 'Request Workforce Contract' : 'Subscribe to a Service'}
        </button>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat">
          <b>{bookings.length}</b>
          <small>Total Bookings</small>
        </div>
        <div className="stat">
          <b>{subscriptions.length}</b>
          <small>Total Subscriptions</small>
        </div>
      </div>

      <h2>Your Bookings</h2>
      {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
      {bookings.map((booking) => (
        <div key={booking._id} className="card list-item">
          <div className="list-item-main">
            <b>{getServiceIcon(booking.serviceType)} {booking.serviceType}</b>
            <span>
              Worker: {booking.worker ? booking.worker.name : 'Not assigned yet'} ·{' '}
              {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime} · ₹{booking.price}
            </span>
            {booking.status === 'completed' && booking.rating?.score == null && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select onChange={(e) => handleRatingChange(booking._id, e.target.value)} style={{ width: 'auto' }}>
                  <option value="">Rate...</option>
                  <option value="1">⭐ 1</option>
                  <option value="2">⭐⭐ 2</option>
                  <option value="3">⭐⭐⭐ 3</option>
                  <option value="4">⭐⭐⭐⭐ 4</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5</option>
                </select>
                <button className="outline" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => submitRating(booking._id)}>
                  Submit
                </button>
              </div>
            )}
            {booking.rating?.score != null && (
              <span className="muted">Your rating: {'⭐'.repeat(booking.rating.score)}</span>
            )}
          </div>
          <div className="list-item-side">
            <span className={`badge ${booking.status === 'pending' ? 'pending' : booking.status === 'completed' ? 'active' : 'assigned'}`}>
              {booking.status}
            </span>
          </div>
        </div>
      ))}

      <h2>Your Subscriptions / Contracts</h2>
      {subscriptions.length === 0 && <p className="muted">No active contracts.</p>}
      {subscriptions.map((sub) => (
        <div key={sub._id} className="card list-item">
          <div className="list-item-main">
            <b>{getServiceIcon(sub.serviceType)} {sub.serviceType} — {sub.contractType} ({sub.frequency})</b>
            <span>
              Workers Required: {sub.workersRequired} · Start: {new Date(sub.startDate).toLocaleDateString()} · ₹{sub.price?.amount}/mo
            </span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${sub.status === 'active' ? 'active' : 'pending'}`}>{sub.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CustomerDashboard;