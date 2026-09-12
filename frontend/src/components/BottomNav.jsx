import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav({ items }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px', background: '#fff',
      borderTop: '1px solid #eceff3', display: 'flex', justifyContent: 'space-around',
      padding: '10px 0', zIndex: 10
    }}>
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: 'none', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '4px', color: active ? '#e8792e' : '#9aa4b2',
              fontSize: '11px', fontWeight: active ? 800 : 600
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;