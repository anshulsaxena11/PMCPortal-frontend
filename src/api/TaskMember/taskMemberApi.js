import axiosInstance from '../axiosconfig'

export const postTaskManagerUpdate = async(payload)=> axiosInstance.put('/admin/taskMember',payload)
