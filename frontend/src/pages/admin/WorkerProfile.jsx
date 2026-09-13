import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkerById, verifyWorker } from '../../services/cooperativeService';

function WorkerProfile() {
  const { workerId } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // figure out who's viewing this page — an admin (cooperative) or the worker themselves
  const role = localStorage.getItem('role');
  const isAdminView = role === 'cooperative';

  useEffect(() => {
    getWorkerById(workerId)
      .then((data) => setWorker(data.worker))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [workerId]);

  const handleVerify = async () => {
    try {
      const data = await verifyWorker(workerId);
      setWorker(data.worker);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  if (!worker) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Worker not found.</p>;

  return (
    <div className="app-shell">
      <div className="topbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <button
          className="outline"
          style={{ width: 'auto', padding: '6px 12px', background: 'transparent', border: '1.5px solid #ffffff55', color: '#fff' }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ background: '#ffffff22', color: '#fff' }}>{worker.name[0]}</div>
            <div className="brand">{worker.name}</div>
          </div>
          <span className={`badge ${worker.availability === 'available' ? 'active' : 'pending'}`}>{worker.availability}</span>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <span className="chip">✓ e-Shram Verified</span>
        <span className="chip">Cooperative Member</span>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '14px' }}>
        <div className="stat">
          <b>⭐ {worker.rating?.average ? worker.rating.average.toFixed(1) : 'N/A'}</b>
          <small>{worker.rating?.count || 0} reviews</small>
        </div>
        <div className="stat">
          <b>{worker.currentWorkload}</b>
          <small>Active Jobs</small>
        </div>
        <div className="stat">
          <b>{worker.isVerified ? '✓ Yes' : 'Pending'}</b>
          <small>Verified</small>
        </div>
        <div className="stat">
          <b>₹{worker.earnings?.total || 0}</b>
          <small>Total Earnings</small>
        </div>
      </div>

      {/* only cooperative admins can toggle verification — not the worker viewing their own profile */}
      {isAdminView && (
        <div style={{ padding: '0 20px' }}>
          <button className="outline" style={{ width: 'auto', padding: '10px 16px', marginBottom: '20px' }} onClick={handleVerify}>
            {worker.isVerified ? 'Unverify Worker' : '✓ Verify Worker'}
          </button>
        </div>
      )}

      <h2>Skills &amp; expertise</h2>
      <div className="card">
        {worker.skills.map((skill) => (
          <span key={skill} className="badge active" style={{ marginRight: '8px', marginBottom: '8px', display: 'inline-block' }}>
            {skill}
          </span>
        ))}
      </div>

      <h2>Contact &amp; cooperative</h2>
      <div className="card">
        <p><strong>Phone:</strong> {worker.phone}</p>
        <p><strong>Email:</strong> {worker.email}</p>
        <p><strong>Location:</strong> {worker.location?.city}</p>
        <p><strong>Cooperative:</strong> {worker.cooperative?.name || 'N/A'}</p>
      </div>

      <h2>Certifications</h2>
      <div className="card">
        {worker.certifications?.length === 0 && <p className="muted">No certifications added yet.</p>}
        {worker.certifications?.map((cert, i) => (
          <p key={i}>
            {cert.name} — {cert.issuedBy} {cert.verified ? '✓ Verified' : '(Pending)'}
          </p>
        ))}
      </div>
    </div>
  );
}

export default WorkerProfile;