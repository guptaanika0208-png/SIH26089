import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav({ items }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      margin: '0 auto',
      width: 'min(100%, 720px)',
      background: '#fff',
      borderTop: '1px solid #eceff3',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      zIndex: 10,
      boxSizing: 'border-box'
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
            <span style={{ fontSize: '20px', lineHeight: 1, display: 'block' }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;