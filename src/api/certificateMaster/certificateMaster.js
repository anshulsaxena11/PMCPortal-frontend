import axiosInstance from "../axiosconfig";

export const getCertificateMasterList = async () => await axiosInstance.get('/user/certificate-Master',{withCredentials: true}).then(response => response.data).catch(error => { console.error('Error fetching Certificate list:', error); throw error; });