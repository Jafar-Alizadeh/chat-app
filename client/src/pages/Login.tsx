import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/chat');
    } catch (err) {
      alert('Fehler beim Login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        
        <input 
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input 
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        
        <button onClick={handleLogin} className="login-button">
          Einloggen
        </button>

        {/* Registrieren-Link als Text */}
        <p style={{ marginTop: '1rem' }}>
          Noch kein Konto?{' '}
          <Link to="/register" className="register-link">
            Hier registrieren
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
