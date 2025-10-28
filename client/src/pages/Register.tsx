import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      // multipart/form-data erstellen
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      // Anfrage an Backend
      await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/login');
    } catch (err) {
      alert('Fehler bei der Registrierung');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registrieren</h2>
        
        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="register-input"
        />
        
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
        
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />

        {/* Datei-Upload-Bereich */}
        <div className="file-upload-wrapper">
          <label htmlFor="avatar" className="custom-file-label">
            {/* Falls schon eine Datei ausgewählt ist, zeige den Dateinamen an */}
            {avatar ? avatar.name : 'Datei auswählen...'}
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="register-input-file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setAvatar(e.target.files[0]);
              }
            }}
          />
        </div>

        <button onClick={handleRegister} className="register-button">
          Registrieren
        </button>
      </div>
    </div>
  );
};

export default Register;
