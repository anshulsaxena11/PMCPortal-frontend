import axiosInstance from '../axiosconfig'

export const getProjectDetailsTimelineById = async (id) => await axiosInstance.get(`/user/timeline/${id}`).then(response => response.data).catch(error => { throw error });
export const putProjectDetailsTimelineById = async (id,payload) => await axiosInstance.put(`/user/timeline/${id}`,payload).then(response => response.data).catch(error => { throw error });