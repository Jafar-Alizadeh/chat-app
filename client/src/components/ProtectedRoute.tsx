// ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingAuth } = useAuth();

  // Solange wir noch laden, zeige einen kleinen Ladeindikator o. Ä.
  if (loadingAuth) {
    return <div>Lade Authentifizierung...</div>;
  }

  // Wenn loadingAuth fertig ist und kein User da -> Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Andernfalls zeige die geschützte Seite
  return <>{children}</>;
};

export default ProtectedRoute;
