import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Standard-Weiterleitung zur Register-Seite */}
          <Route path="/" element={<Navigate to="/register" />} />

          {/* Login-Route */}
          <Route path="/login" element={<Login />} />

          {/* Register-Route */}
          <Route path="/register" element={<Register />} />

          {/* Geschützter Chat */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
