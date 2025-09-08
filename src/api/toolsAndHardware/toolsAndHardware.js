import axiosInstance from '../axiosconfig'

export const postToolsAndHardwareMappping = async(payload) => axiosInstance.post('/user/toolsandHardwareMaster', payload,{ withCredentials: true,})
export const getToolsAndHardwareMappping = async ({ page = "", limit = "", search =" " ,toolsAndHardwareType=""} = {}) => axiosInstance.get("/user/toolsandHardwareMaster", { params: { page, limit, search,toolsAndHardwareType }, withCredentials: true, }).then(response => response.data);
export const editToolsAndHardware  = async (id, Payload) =>  axiosInstance.put(`/user/toolsandHardwareMaster/${id}`, Payload,{ withCredentials: true,});
export const postToolsAndHardware = async(payload) => axiosInstance.post('/user/toolsAndHardware', payload,{ withCredentials: true,})
export const getToolsAndHardware = async ({ page = "", limit = "", search =" " ,directorates=""} = {}) => axiosInstance.get("/user/toolsAndHardware", { params: { page, limit, search,directorates }, withCredentials: true, }).then(response => response.data);
export const putToolsAndHardware  = async (id, Payload) =>  axiosInstance.put(`/user/toolsAndHardware/${id}`, Payload, {withCredentials: true,});
export const deleteToolsAndHardwareMaster = async(id) => await axiosInstance.put(`/user/toolsAndHardwareMasterDelete/${id}`,{withCredentials: true}).catch(err=>err.response ||  { status: 500, data: { message: err.message } });
export const deleteToolsAndHardware = async(id) => await axiosInstance.put(`/user/toolsAndHardwareDelete/${id}`,{withCredentials: true}).catch(err=>err.response ||  { status: 500, data: { message: err.message } });
