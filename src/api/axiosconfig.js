import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: process.env.TIMEOUT,
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
      },
    });

export default axiosInstance;
