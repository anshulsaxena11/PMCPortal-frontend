import axiosInstance from '../axiosconfig'

export const getTypeOfWork = ({page, limit, search}) => axiosInstance.get(`/user/Type-Of-Work`, { params: { page, limit, search }, withCredentials: true });
export const getTypesOfWorkId  = async (id) =>  axiosInstance.get(`/user/typeOfWork/${id}`,{ withCredentials: true,});
export const editTypeOfWork = async (id, Payload) => await axiosInstance.put(`/user/typeOfWork/${id}`, Payload, {withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });
export const postTypeOfWork = async(payload) => await axiosInstance.post('/user/typeOfWork',payload,{withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });
export const deleteTypeOfWork = async(id) => await axiosInstance.put(`/user/typeOfWorkDelete/${id}`,{withCredentials: true}).catch(err=>err.response ||  { status: 500, data: { message: err.message } });