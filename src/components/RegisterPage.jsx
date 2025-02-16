import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    axios.post('http://localhost:5000/register', { username, password })
      .then(response => {
        alert('Registration successful');
        navigate('/login');
      })
      .catch(error => {
        alert('Registration failed');
        console.error(error);
      });
  };

  return (
    <div className='Register-page'>
      <div className='register-box'>
        <h1 className='front'>Register</h1>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default RegisterPage;
