import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCooperativeBookings, getDemandStats } from '../../services/bookingService';
import { getCooperativeWorkers } from '../../services/cooperativeService';
import LogoutButton from '../../components/LogoutButton';
import { getServiceIcon } from '../../utils/serviceIcons';
import { getCooperativeSubscriptions, updateSubscriptionStatus, assignWorkerToSubscription } from '../../services/subscriptionService';
import BottomNav from '../../components/BottomNav';

const TABS = ['Overview', 'Workers', 'Bookings', 'Contracts'];

function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [cooperative, setCooperative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [demandByService, setDemandByService] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');

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

  const handleSubscriptionStatusChange = async (subscriptionId, newStatus) => {
    try {
      await updateSubscriptionStatus(subscriptionId, newStatus);
      const updated = await getCooperativeSubscriptions(cooperative.id);
      setSubscriptions(updated.subscriptions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignWorkerToSub = async (subscriptionId, workerId) => {
    if (!workerId) return;
    try {
      await assignWorkerToSubscription(subscriptionId, workerId);
      const updated = await getCooperativeSubscriptions(cooperative.id);
      setSubscriptions(updated.subscriptions);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  const activeContracts = bookings.filter(b => b.status === 'assigned' || b.status === 'in-progress').length;
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <div className="brand">GharGo</div>
          <div className="muted" style={{ fontSize: '13px' }}>{cooperative?.name} — Admin Dashboard</div>
        </div>
        <LogoutButton />
      </div>

      {/* tab bar to avoid one giant scrolling page */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '14px 20px 4px' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'primary' : 'outline'}
            style={{ width: 'auto', padding: '8px 16px', whiteSpace: 'nowrap' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="stats-row">
            <div className="stat"><b>{workers.length}</b><small>Total Workers</small></div>
            <div className="stat"><b>{activeContracts}</b><small>Active Jobs</small></div>
            <div className="stat"><b>{pendingJobs}</b><small>Pending Jobs</small></div>
            <div className="stat"><b>{bookings.length}</b><small>Total Bookings</small></div>
            <div className="stat"><b>{subscriptions.filter(s => s.status === 'active').length}</b><small>Active Contracts</small></div>
          </div>

          <h2>Demand trends</h2>
          <p className="muted" style={{ marginTop: '-15px', marginLeft: '20px', marginRight: '20px', fontSize: '0.85em' }}>
            Which services your cooperative's customers need most right now
          </p>
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
        </>
      )}

      {activeTab === 'Workers' && (
        <>
          <h2>Worker roster</h2>
          <p className="muted" style={{ marginTop: '-15px', marginLeft: '20px', marginRight: '20px', fontSize: '0.85em' }}>
            {workers.length} verified members in your cooperative — tap anyone to view their full profile
          </p>
          {workers.map((w) => (
            <div key={w._id} className="card list-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/cooperative/worker/${w._id}`)}>
              <div className="list-item-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar">{w.name[0]}</div>
                  <div>
                    <b>{w.name}</b>
                    <div>
                      <span style={{ fontSize: '13px', color: '#7c8798' }}>
                        {w.skills.join(', ')} · Workload {w.currentWorkload} · ⭐ {w.rating?.average ? w.rating.average.toFixed(1) : 'N/A'} ({w.rating?.count || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="list-item-side">
                <span className={`badge ${w.availability === 'available' ? 'active' : 'pending'}`}>{w.availability}</span>
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === 'Bookings' && (
        <>
          <h2>All bookings</h2>
          <p className="muted" style={{ marginTop: '-15px', marginLeft: '20px', marginRight: '20px', fontSize: '0.85em' }}>
            Every one-time service request routed through your cooperative
          </p>
          {bookings.map((b) => (
            <div key={b._id} className="card list-item">
              <div className="list-item-main">
                <b>{getServiceIcon(b.serviceType)} {b.serviceType}</b>
                <span>Worker: {b.worker ? b.worker.name : 'Unassigned'}</span>
              </div>
              <div className="list-item-side">
                {b.isEmergency && <span className="badge" style={{ background: '#fff0eb', color: '#b44835' }}>🚨 Urgent</span>}
                <span className={`badge ${b.status === 'pending' ? 'pending' : 'assigned'}`}>{b.status}</span>
                <span className={`badge ${b.paymentStatus === 'paid' ? 'active' : 'pending'}`}>{b.paymentStatus}</span>
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === 'Contracts' && (
        <>
          <h2>Subscriptions &amp; contracts</h2>
          <p className="muted" style={{ marginTop: '-15px', marginLeft: '20px', marginRight: '20px', fontSize: '0.85em' }}>
            Long-term and institutional workforce agreements
          </p>
          {subscriptions.map((s) => {
            const activeAssignment = s.assignedWorkers?.find((a) => a.isActive);
            const eligibleWorkers = workers.filter((w) => w.skills.includes(s.serviceType));
            return (
              <div key={s._id} className="card list-item">
                <div className="list-item-main">
                  <b>{s.serviceType} — {s.contractType} ({s.frequency})</b>
                  <span>Customer: {s.customer?.name || s.customer?.organizationName} · Workers Needed: {s.workersRequired}</span>
                  <span className="muted" style={{ fontSize: '0.85em' }}>
                    Assigned worker: {activeAssignment ? activeAssignment.worker?.name : 'Unassigned'}
                  </span>
                </div>
                <div className="list-item-side">
                  <span className={`badge ${s.status === 'active' ? 'active' : 'pending'}`}>{s.status}</span>
                  <select value={s.status} onChange={(e) => handleSubscriptionStatusChange(s._id, e.target.value)} style={{ width: 'auto', padding: '6px' }}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select defaultValue="" onChange={(e) => handleAssignWorkerToSub(s._id, e.target.value)} style={{ width: 'auto', padding: '6px' }}>
                    <option value="" disabled>{activeAssignment ? 'Replace worker...' : 'Assign worker...'}</option>
                    {eligibleWorkers.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* <BottomNav items={[{ path: '/cooperative/dashboard', icon: '📊', label: 'Dashboard' }]} /> */}
    </div>
  );
}

export default AdminDashboard;