// axiosInstance.js
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
      if (!window.__hasShownSessionExpiredAlert) {
        window.__hasShownSessionExpiredAlert = true;

        // (Optional) Save form data here if needed
        // Example:
        // const formData = getCurrentFormStateSomehow();
        // localStorage.setItem("savedFormData", JSON.stringify(formData));

        Swal.fire({
          icon: 'info',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // Clear stored data
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to login
            window.location.href = "/login";

            // Reset alert flag after short delay (just in case)
            setTimeout(() => {
              window.__hasShownSessionExpiredAlert = false;
            }, 3000);
          }
        });

        // Fallback redirect in case SweetAlert fails (just in case)
        setTimeout(() => {
          if (!window.location.pathname.includes('/login')) {
            window.location.href = "/login";
          }
        }, 5000);
      }
    }

    return Promise.reject(error);
  }
);

// Reset alert flag if user reloads or navigates away
window.addEventListener("beforeunload", () => {
  window.__hasShownSessionExpiredAlert = false;
});

export default axiosInstance;
