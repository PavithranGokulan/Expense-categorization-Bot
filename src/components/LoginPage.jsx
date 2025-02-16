import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.removeItem('expenses')

    axios.post('http://localhost:5000/login', { username, password })
      .then(response => {
        localStorage.setItem('token', response.data.access_token);
      })
      .catch(error => {
        alert('Login failed');
        console.error(error);
      });
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/delete_all', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        })
        .then(response => {
            console.log("deleted all");
            navigate('/HomePage');
        })
        .catch(error =>{
            console.error(error,"unable to delete all");
        })
  };

  return (
    <div className='Login-page'>
      <div className='register-box'>
        <h1 className='front'>Login</h1>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default LoginPage;
