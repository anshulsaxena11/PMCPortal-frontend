import axiosInstance from "../axiosconfig";

export const getNotification = async () => await axiosInstance.get('/user/notification',{withCredentials: true }).then(response => response.data).catch(error => { console.error('Error fetching device list:', error); throw error; });