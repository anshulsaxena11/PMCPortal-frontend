import axiosInstance from "../axiosconfig";

export const getTaskForceDetailsById = async (id) => await axiosInstance.get(`/user/taskForceMember/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
export const updateTaskForceMember = async (id, Payload) => await axiosInstance.put(`/user/taskForceMember/${id}`, Payload,{withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });
export const getEmpListSC = async()=> axiosInstance.get('/user/EmpListSc',{ withCredentials: true,})