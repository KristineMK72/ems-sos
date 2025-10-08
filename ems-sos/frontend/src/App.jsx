import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import SOS from './pages/SOS';
import Dashboard from './pages/Dashboard';

function App() {
  // Simple routing based on URL hash (e.g., #sos, #dashboard)
  const [route, setRoute] = useState(window.location.hash.substring(1) || 'login');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.substring(1) || 'login');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    window.location.hash = 'sos';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.hash = 'login';
  };

  let content;
  if (!token) {
    content = <Login onLogin={handleLogin} />;
  } else if (route === 'sos') {
    content = <SOS token={token} />;
  } else if (route === 'dashboard') {
    content = <Dashboard token={token} />;
  } else {
    content = <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <header style={{ padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
        <nav>
          {token && <a href="#sos" style={{ marginRight: '25px', textDecoration: 'none', color: '#007bff' }}>SOS (User)</a>}
          {token && <a href="#dashboard" style={{ textDecoration: 'none', color: '#28a745' }}>EMS Dashboard</a>}
        </nav>
        {token && <button onClick={handleLogout} style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>}
      </header>
      <main style={{ padding: '20px' }}>
        {content}
      </main>
    </>
  );
}

export default App;