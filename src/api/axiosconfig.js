import axios from 'axios';
import Swal from 'sweetalert2';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: process.env.TIMEOUT,
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
      },
    });

    axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const isOnLoginPage = window.location.pathname === '/login';

      if (error?.response?.status === 401 && !isOnLoginPage) {
        // Prevent infinite loop: show alert only once
        if (!window.__hasShownSessionExpiredAlert) {
          window.__hasShownSessionExpiredAlert = true;

          Swal.fire({
            icon: 'info',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            willClose: () => {
              localStorage.removeItem("isAuthenticated");
              window.location.href = "/login";

              // Reset flag after redirect (just in case)
              setTimeout(() => {
                window.__hasShownSessionExpiredAlert = false;
              }, 3000);
            }
          });
        }
      }

      return Promise.reject(error);
    }
  );


export default axiosInstance;
