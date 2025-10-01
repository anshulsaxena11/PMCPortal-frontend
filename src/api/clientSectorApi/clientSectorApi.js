import axiosInstance from "../axiosconfig";

export const getType = async () => await axiosInstance.get('/user/types',{ withCredentials: true,})
export const postDomainSector = async(payload) => await axiosInstance.post('/user/domainSector',payload,  {withCredentials: true})
export const getDomain = async ({ page = "", limit = "", search = "",type=""}) => axiosInstance.get("/user/domain-Sector", {params: { page, limit, search,type },withCredentials: true,}).then(response => response.data);
export const getDomainById = async (id) => await axiosInstance.get(`/user/domain-Sector/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
export const updateDomain = async (id, Payload) => await axiosInstance.put(`/user/domain-Sector/${id}`, Payload, {withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });