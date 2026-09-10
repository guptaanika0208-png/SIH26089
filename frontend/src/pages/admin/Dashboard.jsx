import { useEffect, useState } from 'react';
import { getCooperativeBookings } from '../../services/bookingService';
import { getCooperativeWorkers } from '../../services/cooperativeService';
import LogoutButton from '../../components/LogoutButton';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [cooperative, setCooperative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCooperative(storedUser);

    if (storedUser?.id) {
      Promise.all([
        getCooperativeBookings(storedUser.id),
        getCooperativeWorkers(storedUser.id)
      ])
        .then(([bookingData, workerData]) => {
          setBookings(bookingData.bookings);
          setWorkers(workerData.workers);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  const activeContracts = bookings.filter(b => b.status === 'assigned' || b.status === 'in-progress').length;
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h2>{cooperative?.name} — Admin Dashboard</h2>
      <LogoutButton />

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', flex: 1 }}>
          <p>Total Workers</p>
          <h3>{workers.length}</h3>
        </div>
        <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', flex: 1 }}>
          <p>Active Jobs</p>
          <h3>{activeContracts}</h3>
        </div>
        <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', flex: 1 }}>
          <p>Pending Jobs</p>
          <h3>{pendingJobs}</h3>
        </div>
        <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', flex: 1 }}>
          <p>Total Bookings</p>
          <h3>{bookings.length}</h3>
        </div>
      </div>

      <h3>Worker Roster</h3>
      {workers.map((w) => (
        <div key={w._id} style={{ border: '1px solid #444', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
          <p><strong>{w.name}</strong> — Skills: {w.skills.join(', ')} — Workload: {w.currentWorkload} — Status: {w.availability}</p>
        </div>
      ))}

      <h3>All Bookings</h3>
      {bookings.map((b) => (
        <div key={b._id} style={{ border: '1px solid #444', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
          <p><strong>Service:</strong> {b.serviceType} — <strong>Status:</strong> {b.status} — <strong>Worker:</strong> {b.worker ? b.worker.name : 'Unassigned'}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;