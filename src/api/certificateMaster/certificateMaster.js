import axiosInstance from "../axiosconfig";

export const getCertificateMasterList = async ({ page = "", limit = "", search = "",certificateType =""}) => await axiosInstance.get('/user/certificate-Master',{params: { page, limit, search,certificateType },withCredentials: true,}).then(response => response.data).catch(error => { console.error('Error fetching Certificate list:', error); throw error; });
export const getCertificateMasterById = async (id) => await axiosInstance.get(`/user/certificate-Master/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
export const postCertificateMaster = async(payload) => await axiosInstance.post('/user/certificate-Master',payload,  {withCredentials: true})
export const updateCertificate = async (id, Payload) => await axiosInstance.put(`/user/certificate-Master/${id}`, Payload, {withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });