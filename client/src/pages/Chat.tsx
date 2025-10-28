// Chat.tsx (optimierte Version mit Logout, größerem Username und Kalender)
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface IMessage {
  senderId: number;
  receiverId: number;
  text: string;
  createdAt?: string;
}

const socket = io('http://localhost:5000');

const ChatLayout: React.FC = () => {
  const { user, setUser } = useAuth(); // Damit wir den User ausloggen können
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kalender-State
  const [date, setDate] = useState<Date>(new Date());

  // Ref für Nachrichten-Container (für Auto-Scroll)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.io beitreten
  useEffect(() => {
    if (user?.id) {
      socket.emit('join', user.id);
    }
  }, [user]);

  // Benutzerliste laden
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users')
      .then((res) => {
        setUsers(res.data.filter((u: any) => u.id !== user?.id));
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Benutzer:', err);
      });
  }, [user]);

  // Socket.io: Neue Nachrichten empfangen
  useEffect(() => {
    socket.on('receiveMessage', (data: IMessage) => {
      if (
        (data.senderId === user?.id && data.receiverId === selectedUser?.id) ||
        (data.senderId === selectedUser?.id && data.receiverId === user?.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedUser, user]);

  // Nachrichtenverlauf laden
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/messages/${user?.id}/${selectedUser.id}`)
        .then((res) => {
          setMessages(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error('Fehler beim Laden der Nachrichten:', err);
          setError('Nachrichten konnten nicht geladen werden.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedUser, user?.id]);

  // Auto-Scroll wenn Nachrichten sich ändern
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Nachricht senden
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    const message: IMessage = {
      senderId: user?.id!,
      receiverId: selectedUser.id,
      text,
    };

    try {
      await axios.post('http://localhost:5000/api/messages', message);
      socket.emit('sendMessage', message);
      setMessages((prev) => [...prev, message]);
      setText('');
    } catch (err) {
      console.error('Fehler beim Senden der Nachricht:', err);
    }
  };

  // Logout-Funktion
  const handleLogout = () => {
    localStorage.removeItem('token'); // Token entfernen
    setUser(null);                   // User im Context leeren
    window.location.href = '/login'; // Auf Login-Seite weiterleiten
  };

  return (
    <div className="main-container">
      {/* Obere Leiste */}
      <header className="topbar">
        <div className="topbar-left">
          <h2>Meine Chat-App</h2>
        </div>
        <div className="topbar-right">
          {/* Größerer Username */}
          <span className="username">{user?.username}</span>
          {/* Logout-Button */}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Hauptbereich: 3 Spalten */}
      <div className="content-wrapper">
        {/* Linke Spalte (Sidebar) */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Chats</h3>
          </div>
          <div className="user-list-items">
            {users.map((u) => (
              <div
                key={u.id}
                className={`user-item ${u.id === selectedUser?.id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                {u.avatar ? (
                  <img
                    src={`http://localhost:5000/${u.avatar}`}
                    alt="Avatar"
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder" />
                )}
                <span className="user-name">{u.username}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Mittlere Spalte (Chat) */}
        <section className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h3>Chat mit {selectedUser.username}</h3>
              </div>
              <div className="messages">
                {loading ? (
                  <p>Lade Nachrichten...</p>
                ) : error ? (
                  <p className="error-message">{error}</p>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.senderId === user?.id;
                    return (
                      <div key={index} className={`message ${isSelf ? 'self' : 'other'}`}>
                        {msg.text}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input">
                <input
                  placeholder="Nachricht..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button onClick={sendMessage}>Senden</button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Wähle einen Benutzer aus, um zu chatten.</p>
            </div>
          )}
        </section>

        {/* Rechte Spalte: Agenda (mit Kalender) */}
        <aside className="right-panel">
          <h3>Meine Agenda</h3>
          <div className="agenda-items">
            {/* Größerer Kalender */}
            <div className="calendar-wrapper">
              <Calendar
                onChange={(value) => setDate(value as Date)}
                value={date}
                selectRange={false}
              />
            </div>
            <p style={{ marginTop: '2rem' }}>
              Ausgewähltes Datum: {date.toLocaleDateString()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatLayout;
