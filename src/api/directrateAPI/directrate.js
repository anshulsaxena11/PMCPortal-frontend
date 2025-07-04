import axiosInstance from "../axiosconfig";

export const postdirectrate = async(payload) => {
    const response=await axiosInstance.post('/user/directrate',payload);
    return response.data;
}
export const getdirectrate = async() => await axiosInstance.get('/user/directrate')
