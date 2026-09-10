import { useEffect, useState } from 'react';
import { getWorkerBookings } from '../../services/bookingService';
import LogoutButton from '../../components/LogoutButton';

function WorkerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setWorker(storedUser);

    if (storedUser?.id) {
      getWorkerBookings(storedUser.id)
        .then((data) => setBookings(data.bookings))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px' }}>
      <h2>Welcome, {worker?.name}</h2>
      <LogoutButton />
      <p>Total Jobs: {bookings.length}</p>

      <h3>Your Jobs</h3>
      {bookings.length === 0 && <p>No jobs assigned yet.</p>}
      {bookings.map((booking) => (
        <div
          key={booking._id}
          style={{
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px'
          }}
        >
          <p><strong>Service:</strong> {booking.serviceType}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Scheduled:</strong> {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</p>
          <p><strong>Price:</strong> ₹{booking.price}</p>
        </div>
      ))}
    </div>
  );
}

export default WorkerDashboard;