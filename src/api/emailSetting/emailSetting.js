import axiosInstance from "../axiosconfig";

export const postEmailSetting = async(payload) => await axiosInstance.post('/user/email-setting',payload,{withCredentials:true});
export const getEmailSetting = async() => await axiosInstance.get('/user/email-setting',{withCredentials:true})