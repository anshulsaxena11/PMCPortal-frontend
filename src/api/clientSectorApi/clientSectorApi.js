import axiosInstance from "../axiosconfig";

export const getType = async () => await axiosInstance.get('/user/types',{ withCredentials: true,})
export const postClientSector = async(payload) => await axiosInstance.post('/user/clientSector',payload,  {withCredentials: true})
export const getClientSector = async ({ page = "", limit = "", search = "",type=""}) => axiosInstance.get("/user/client-Sector", {params: { page, limit, search,type },withCredentials: true,}).then(response => response.data);
export const getClientSectorById = async (id) => await axiosInstance.get(`/user/client-Sector/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
export const updateType = async (id, Payload) => await axiosInstance.put(`/user/client-Sector/${id}`, Payload, {withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });