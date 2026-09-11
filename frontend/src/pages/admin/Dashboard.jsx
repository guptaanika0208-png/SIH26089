import { useEffect, useState } from 'react';
import { getCooperativeBookings } from '../../services/bookingService';
import { getCooperativeWorkers } from '../../services/cooperativeService';
import LogoutButton from '../../components/LogoutButton';
import { getCooperativeSubscriptions } from '../../services/subscriptionService';
import { getServiceIcon } from '../../utils/serviceIcons';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [cooperative, setCooperative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCooperative(storedUser);

    if (storedUser?.id) {
      Promise.all([
        getCooperativeBookings(storedUser.id),
        getCooperativeWorkers(storedUser.id),
        getCooperativeSubscriptions(storedUser.id)
      ])
        .then(([bookingData, workerData, subscriptionData]) => {
          setBookings(bookingData.bookings);
          setWorkers(workerData.workers);
          setSubscriptions(subscriptionData.subscriptions);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  const activeContracts = bookings.filter(b => b.status === 'assigned' || b.status === 'in-progress').length;
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">{cooperative?.name} — Admin Dashboard</div>
        <LogoutButton />
      </div>

      <div className="stats-row">
        <div className="stat">
          <b>{workers.length}</b>
          <small>Total Workers</small>
        </div>
        <div className="stat">
          <b>{activeContracts}</b>
          <small>Active Jobs</small>
        </div>
        <div className="stat">
          <b>{pendingJobs}</b>
          <small>Pending Jobs</small>
        </div>
        <div className="stat">
          <b>{bookings.length}</b>
          <small>Total Bookings</small>
        </div>
        <div className="stat">
          <b>{subscriptions.filter(s => s.status === 'active').length}</b>
          <small>Active Contracts</small>
        </div>
      </div>

      <h2>Worker Roster</h2>
      {workers.map((w) => (
        <div key={w._id} className="card list-item">
          <div className="list-item-main">
            <b>{w.name}</b>
            <span>Skills: {w.skills.join(', ')} · Workload: {w.currentWorkload}</span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${w.availability === 'available' ? 'active' : 'pending'}`}>{w.availability}</span>
          </div>
        </div>
      ))}

      <h2>All Bookings</h2>
      {bookings.map((b) => (
        <div key={b._id} className="card list-item">
          <div className="list-item-main">
            <strong>Service:</strong> {getServiceIcon(b.serviceType)} {b.serviceType}
            <span>Worker: {b.worker ? b.worker.name : 'Unassigned'}</span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${b.status === 'pending' ? 'pending' : 'assigned'}`}>{b.status}</span>
          </div>
        </div>
      ))}

      <h2>Subscriptions / Contracts</h2>
      {subscriptions.map((s) => (
        <div key={s._id} className="card list-item">
          <div className="list-item-main">
            <b>{s.serviceType} — {s.contractType} ({s.frequency})</b>
            <span>Customer: {s.customer?.name || s.customer?.organizationName} · Workers Needed: {s.workersRequired}</span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${s.status === 'active' ? 'active' : 'pending'}`}>{s.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;