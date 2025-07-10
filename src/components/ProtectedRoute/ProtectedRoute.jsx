import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateToken } from '../../api/loginApi/loginApi';

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const localAuth = localStorage.getItem('isAuthenticated') === 'true';

    if (localAuth) {
      setIsAuthenticated(true);
      setAuthChecked(true);
    } else {
      const verify = async () => {
        try {
          const response = await validateToken();
          if (response?.status === 200) {
            localStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        } finally {
          setAuthChecked(true);
        }
      };
      verify();
    }
  }, []);

  if (!authChecked) return null;

  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
