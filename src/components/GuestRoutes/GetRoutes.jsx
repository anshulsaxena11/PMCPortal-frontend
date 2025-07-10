import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { validateToken } from '../../api/loginApi/loginApi';

const GuestRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default GuestRoute;