import React, { useState } from 'react';
import api from '../Api';

const Login = () =>{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    api.post('/login/', { username, password })
      .then(response => {
        console.log('Logged in successfully', response.data);
      })
      .catch(error => {
        console.error('Error logging in:', error);
        setError('Invalid credentials');
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
