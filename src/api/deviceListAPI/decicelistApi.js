import axiosInstance from "../axiosconfig";

export const postDeviceList = async(payload)=> await axiosInstance.post('/user/deviceList-Post',payload)
export const getDeviceList = async () => await axiosInstance.get('/user/deviceList').then(response => response.data).catch(error => { console.error('Error fetching device list:', error); throw error; });
export const getDeviceReportList = async (projectName, projectType) => await axiosInstance.get(`/user/devices-list`, {params: { projectName, projectType },});