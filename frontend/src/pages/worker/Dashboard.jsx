import { useEffect, useState } from 'react';
import { getWorkerBookings } from '../../services/bookingService';
import LogoutButton from '../../components/LogoutButton';
import { getServiceIcon } from '../../utils/serviceIcons';

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
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">Welcome, {worker?.name}</div>
        <LogoutButton />
      </div>

      <div className="stats-row">
        <div className="stat">
          <b>{bookings.length}</b>
          <small>Total Jobs</small>
        </div>
        <div className="stat">
          <b>{bookings.filter(b => b.status === 'assigned').length}</b>
          <small>Active Jobs</small>
        </div>
      </div>

      <h2>Your Jobs</h2>
      {bookings.length === 0 && <p className="muted">No jobs assigned yet.</p>}
      {bookings.map((booking) => (
        <div key={booking._id} className="card list-item">
          <div className="list-item-main">
            <b>{getServiceIcon(booking.serviceType)} {booking.serviceType}</b>
            <span>
              {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime} · ₹{booking.price}
            </span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${booking.status === 'pending' ? 'pending' : 'assigned'}`}>{booking.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WorkerDashboard;