import React, { useState } from 'react';
import { post } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    // Dynamically chooses the API path based on whether the user is registering or logging in
    const path = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const data = await post(path, body);
      
      if (data.token) {
        // Success: Store token and change view
        onLogin(data.token);
      } else {
        // Failed due to incorrect credentials or email already taken
        setMessage(data.message || 'Login/Registration failed.');
      }
    } catch (err) {
      // Failed due to network error (backend might be down)
      setMessage('Network error: Is the backend server running?');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>{isRegister ? 'New User Registration' : 'User Login'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
        {isRegister && (
          <input type="text" placeholder="Full Name (Optional)" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px' }} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isRegister ? 'Register & Log In' : 'Log In'}
        </button>
      </form>
      <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{message}</p>
      <button 
        onClick={() => setIsRegister(!isRegister)}
        style={{ width: '100%', marginTop: '15px', padding: '8px', background: 'none', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}
      >
        {isRegister ? 'Already have an account? Log In' : 'Need an account? Register'}
      </button>
    </div>
  );
}