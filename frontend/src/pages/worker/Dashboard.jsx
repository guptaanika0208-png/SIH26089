import { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';
import { getServiceIcon } from '../../utils/serviceIcons';
import { getWorkerBookings, completeBooking } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';

function WorkerDashboard() {
  const navigate = useNavigate();
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

  const handleComplete = async (bookingId) => {
    try {
      await completeBooking(bookingId);
      const updated = await getWorkerBookings(worker.id);
      setBookings(updated.bookings);
    } catch (err) {
      console.error(err);
    }
  };
  

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">Welcome, {worker?.name}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="outline" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => navigate(`/cooperative/worker/${worker.id}`)}>
            View My Profile
          </button>
          <LogoutButton />
        </div>
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
        <div className="stat">
          <b>{worker?.rating?.average ? worker.rating.average.toFixed(1) : 'N/A'} ⭐</b>
          <small>Rating ({worker?.rating?.count || 0} reviews)</small>
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
            <span className={`badge ${booking.status === 'pending' ? 'pending' : booking.status === 'completed' ? 'active' : 'assigned'}`}>
              {booking.status}
            </span>
            {booking.status === 'assigned' && (
              <button className="outline" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => handleComplete(booking._id)}>
                Mark Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default WorkerDashboard;