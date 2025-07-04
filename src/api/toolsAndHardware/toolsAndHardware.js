import axiosInstance from '../axiosconfig'

export const postToolsAndHardwareMappping = async(payload) => axiosInstance.post('/user/toolsandHardwareMaster', payload)
export const getToolsAndHardwareMappping = async ({ page = "", limit = "", search =" " ,toolsAndHardwareType=""} = {}) => axiosInstance.get("/user/toolsandHardwareMaster", { params: { page, limit, search,toolsAndHardwareType } }).then(response => response.data);
export const editToolsAndHardware  = async (id, Payload) =>  axiosInstance.put(`/user/toolsandHardwareMaster/${id}`, Payload);
export const postToolsAndHardware = async(payload) => axiosInstance.post('/user/toolsAndHardware', payload)
export const getToolsAndHardware = async ({ page = "", limit = "", search =" " ,directorates=""} = {}) => axiosInstance.get("/user/toolsAndHardware", { params: { page, limit, search,directorates } }).then(response => response.data);
export const putToolsAndHardware  = async (id, Payload) =>  axiosInstance.put(`/user/toolsAndHardware/${id}`, Payload);
