import { useEffect, useState } from 'react';
import { getCustomerBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../../components/LogoutButton';
import { getCustomerSubscriptions } from '../../services/subscriptionService';

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

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px' }}>
      <h2>Welcome, {customer?.name || customer?.organizationName || customer?.email}</h2>
      <LogoutButton />
      <button onClick={() => navigate('/customer/book')} style={{ padding: '10px', marginRight: '10px', marginBottom: '20px' }}>
        Book a One-Time Service
      </button>
      <button onClick={() => navigate('/customer/contract')} style={{ padding: '10px', marginBottom: '20px' }}>
        {customer?.type === 'institutional' ? 'Request Workforce Contract' : 'Subscribe to a Service'}
      </button>

      <p>Total Bookings: {bookings.length} &nbsp;|&nbsp; Total Subscriptions: {subscriptions.length}</p>

      <h3>Your Bookings</h3>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      {bookings.map((booking) => (
        <div key={booking._id} style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
          <p><strong>Service:</strong> {booking.serviceType}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Worker:</strong> {booking.worker ? booking.worker.name : 'Not assigned yet'}</p>
          <p><strong>Scheduled:</strong> {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</p>
          <p><strong>Price:</strong> ₹{booking.price}</p>
        </div>
      ))}

      <h3>Your Subscriptions / Contracts</h3>
      {subscriptions.length === 0 && <p>No active contracts.</p>}
      {subscriptions.map((sub) => (
        <div key={sub._id} style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
          <p><strong>Service:</strong> {sub.serviceType}</p>
          <p><strong>Type:</strong> {sub.contractType} — {sub.frequency}</p>
          <p><strong>Workers Required:</strong> {sub.workersRequired}</p>
          <p><strong>Status:</strong> {sub.status}</p>
          <p><strong>Start:</strong> {new Date(sub.startDate).toLocaleDateString()}</p>
          <p><strong>Monthly Cost:</strong> ₹{sub.price?.amount}</p>
        </div>
      ))}
    </div>
  );
}

export default CustomerDashboard;