import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <h2 style={styles.logo}>InventorySys</h2>
        <NavLink to="/" style={styles.link} activeStyle={styles.active}>Home</NavLink>
        {user && (
          <>
            <NavLink to={`/${user.role}/dashboard`} style={styles.link} activeStyle={styles.active}>
              Dashboard
            </NavLink>
           
            {user.role === 'admin' && (
              <NavLink to="/admin/alerts" style={styles.link} activeStyle={styles.active}>
                Alerts
              </NavLink>
            )}
          </>
        )}
      </div>

      <div style={styles.right}>
        {user ? (
          <>
            <span style={styles.userText}>{user.role?.toUpperCase()}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={styles.authBtn}>Login</NavLink>
            <NavLink to="/register" style={styles.authBtnOutline}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#1f2937',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    marginRight: '24px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '8px',
  },
  active: {
    borderBottom: '2px solid white',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userText: {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  authBtn: {
    color: 'white',
    textDecoration: 'none',
    border: '1px solid white',
    padding: '6px 12px',
    borderRadius: '4px',
  },
  authBtnOutline: {
    color: '#1f2937',
    backgroundColor: 'white',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
};
