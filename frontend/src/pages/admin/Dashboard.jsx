import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCooperativeBookings } from '../../services/bookingService';
import { getCooperativeWorkers } from '../../services/cooperativeService';
import LogoutButton from '../../components/LogoutButton';
import { getCooperativeSubscriptions } from '../../services/subscriptionService';
import { getDemandStats } from '../../services/bookingService';
import { getServiceIcon } from '../../utils/serviceIcons';

function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [cooperative, setCooperative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [demandByService, setDemandByService] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCooperative(storedUser);

    if (storedUser?.id) {
      Promise.all([
        getCooperativeBookings(storedUser.id),
        getCooperativeWorkers(storedUser.id),
        getCooperativeSubscriptions(storedUser.id),
        getDemandStats(storedUser.id)
      ])
        .then(([bookingData, workerData, subscriptionData, demandData]) => {
          setBookings(bookingData.bookings);
          setWorkers(workerData.workers);
          setSubscriptions(subscriptionData.subscriptions);
          setDemandByService(demandData.byService);
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
      <p className="muted" style={{ marginTop: '-8px', fontSize: '0.85em' }}>Click a worker to view their full profile</p>
      {workers.map((w) => (
        <div
          key={w._id}
          className="card list-item"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/cooperative/worker/${w._id}`)}
        >
          <div className="list-item-main">
            <b>{w.name}</b>
            <span>Skills: {w.skills.join(', ')} · Workload: {w.currentWorkload} · ⭐ {w.rating?.average ? w.rating.average.toFixed(1) : 'N/A'} ({w.rating?.count || 0})</span>
          </div>
          <div className="list-item-side">
            <span className={`badge ${w.availability === 'available' ? 'active' : 'pending'}`}>{w.availability}</span>
          </div>
        </div>
      ))}

      <h2>Demand Trends</h2>
      <div className="card">
        {demandByService.length === 0 && <p className="muted">Not enough booking data yet.</p>}
        {demandByService.map((d) => {
          const maxCount = Math.max(...demandByService.map(x => x.count));
          const widthPercent = (d.count / maxCount) * 100;
          return (
            <div key={d._id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{getServiceIcon(d._id)} {d._id}</span>
                <b>{d.count} booking{d.count !== 1 ? 's' : ''}</b>
              </div>
              <div style={{ height: '10px', background: '#e4eee9', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${widthPercent}%`, background: '#278464', borderRadius: '10px' }} />
              </div>
            </div>
          );
        })}
        <p className="muted" style={{ fontSize: '0.85em', marginTop: '10px' }}>
          Based on current booking history. Predictive forecasting will activate as more data accumulates.
        </p>
      </div>

      <h2>All Bookings</h2>
      {bookings.map((b) => (
        <div key={b._id} className="card list-item">
          <div className="list-item-main">
            <b>{getServiceIcon(b.serviceType)} {b.serviceType}</b>
            <span>Worker: {b.worker ? b.worker.name : 'Unassigned'}</span>
          </div>
          <div className="list-item-side">
            {b.isEmergency && (
              <span className="badge" style={{ background: '#fff0eb', color: '#b44835' }}>🚨 Urgent</span>
            )}
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