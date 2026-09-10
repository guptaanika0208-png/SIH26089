import { useEffect, useState } from 'react';
import { getCustomerBookings } from '../../services/bookingService';

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCustomer(storedUser);

    if (storedUser?.id) {
      getCustomerBookings(storedUser.id)
        .then((data) => setBookings(data.bookings))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px' }}>
      <h2>Welcome, {customer?.name || customer?.organizationName || customer?.email}</h2>
      <p>Total Bookings: {bookings.length}</p>

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
    </div>
  );
}

export default CustomerDashboard;