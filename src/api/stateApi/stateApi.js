import axiosInstance from '../axiosconfig'

export const getStateList = async()=> await axiosInstance.get('/user/state')