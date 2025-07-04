import axiosInstance from '../axiosconfig'

export const getTypeOfWork = async() => axiosInstance.get('/user/Type-Of-Work')