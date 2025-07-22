import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateToken } from '../../api/loginApi/loginApi';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await validateToken();
        if (response?.status === 200) {
          localStorage.setItem('isAuthenticated', 'true');
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('isAuthenticated');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
       if (error?.response?.status === 401) {
          Swal.fire({
            icon: 'info',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } finally {
        setAuthChecked(true);
      }
    };

    verify(); // Always validate with server
  }, [location.pathname]);

  if (!authChecked) return null; // You can show a loader instead

  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
