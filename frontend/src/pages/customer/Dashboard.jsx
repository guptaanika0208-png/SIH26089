import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../../components/LogoutButton';
import { getServiceIcon } from '../../utils/serviceIcons';
import { getCustomerBookings, rateBooking } from '../../services/bookingService';
import PaymentModal from '../../components/PaymentModal';
import { getCustomerSubscriptions, updateSubscriptionStatus } from '../../services/subscriptionService';
import BottomNav from '../../components/BottomNav';

function CustomerDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payingBooking, setPayingBooking] = useState(null);
  const [ratingInputs, setRatingInputs] = useState({});

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

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await updateSubscriptionStatus(subscriptionId, 'cancelled');
      const updated = await getCustomerSubscriptions(customer.id);
      setSubscriptions(updated.subscriptions);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshBookings = async () => {
    const updated = await getCustomerBookings(customer.id);
    setBookings(updated.bookings);
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <div className="brand">GharGo</div>
          <div className="muted" style={{ fontSize: '13px' }}>Welcome, {customer?.name || customer?.organizationName || customer?.email}</div>
        </div>
        <LogoutButton />
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <span className="chip">✓ Verified workers</span>
        <span className="chip">Fixed rates</span>
        <span className="chip">0% platform markup</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', margin: '14px 20px 10px', padding: 0 }}>
        <button onClick={() => navigate('/customer/book')} className="primary" style={{ width: 'auto', flex: 1 }}>
          Book a Service
        </button>
        <button onClick={() => navigate('/customer/contract')} className="outline" style={{ width: 'auto', flex: 1 }}>
          {customer?.type === 'institutional' ? 'Workforce Contract' : 'Subscribe'}
        </button>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat"><b>{bookings.length}</b><small>Total Bookings</small></div>
        <div className="stat"><b>{subscriptions.length}</b><small>Total Subscriptions</small></div>
      </div>

      <h2>Your bookings</h2>
      <p className="muted" style={{ marginTop: '-15px', marginLeft: '20px', marginRight: '20px', fontSize: '0.85em' }}>
        Direct connection with verified cooperative workers, no middleman
      </p>
      {bookings.length === 0 && <p className="muted" style={{ marginLeft: '20px' }}>No bookings yet — book your first service above.</p>}
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
                <button className="outline" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => submitRating(booking._id)}>Submit</button>
              </div>
            )}
            {booking.status === 'completed' && booking.earningsBreakdown && (
              <span className="muted" style={{ fontSize: '0.85em' }}>
                You paid ₹{booking.price} → Worker received ₹{booking.earningsBreakdown.workerEarning} · Platform fee ₹{booking.earningsBreakdown.platformFee}
              </span>
            )}
            {booking.rating?.score != null && <span className="muted">Your rating: {'⭐'.repeat(booking.rating.score)}</span>}
          </div>
          <div className="list-item-side">
            {booking.isEmergency && <span className="badge" style={{ background: '#fff0eb', color: '#b44835' }}>🚨 Urgent</span>}
            <span className={`badge ${booking.status === 'pending' ? 'pending' : booking.status === 'completed' ? 'active' : 'assigned'}`}>{booking.status}</span>
            {booking.status === 'completed' && booking.paymentStatus !== 'paid' && (
              <button className="primary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setPayingBooking(booking)}>Pay Now</button>
            )}
            {booking.paymentStatus === 'paid' && <span className="badge active">✓ Paid</span>}
          </div>
        </div>
      ))}

      <h2>Your subscriptions &amp; contracts</h2>
      <p className="muted" style={{ marginTop: '-15px', marginLeft: '20px', marginRight: '20px', fontSize: '0.85em' }}>
        Ongoing services managed by your cooperative
      </p>
      {subscriptions.length === 0 && <p className="muted" style={{ marginLeft: '20px' }}>No active contracts yet.</p>}
      {subscriptions.map((sub) => (
        <div key={sub._id} className="card list-item">
          <div className="list-item-main">
            <b>{getServiceIcon(sub.serviceType)} {sub.serviceType} — {sub.contractType} ({sub.frequency})</b>
            <span>Workers Required: {sub.workersRequired} · Start: {new Date(sub.startDate).toLocaleDateString()} · ₹{sub.price?.amount}/mo</span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${sub.status === 'active' ? 'active' : 'pending'}`}>{sub.status}</span>
            {sub.status === 'active' && (
              <button className="outline" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => handleCancelSubscription(sub._id)}>Cancel</button>
            )}
          </div>
        </div>
      ))}

      {payingBooking && <PaymentModal booking={payingBooking} onClose={() => setPayingBooking(null)} onSuccess={refreshBookings} />}

      <BottomNav items={[
        { path: '/customer/dashboard', icon: '🏠', label: 'Home' },
        { path: '/customer/book', icon: '🧰', label: 'Book' },
        { path: '/customer/contract', icon: '📋', label: 'Contracts' },
      ]} />
    </div>
  );
}

export default CustomerDashboard;