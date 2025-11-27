import axiosInstance from "../axiosconfig";

export const postCertificateTypeMaster = async(payload) => await axiosInstance.post('/user/certificate-Type-Master',payload,  {withCredentials: true})
export const getCertificateTypeMasterList = async ({ page = "", limit = "", search = ""}) => await axiosInstance.get('/user/certificate-Type-Master',{params: { page, limit, search },withCredentials: true,}).then(response => response.data).catch(error => { console.error('Error fetching Certificate list:', error); throw error; });