import axiosInstance from '../axiosconfig'

export const postRegister = async (payload) => axiosInstance.post('/admin/register', payload).catch(err => { throw err; });
export const postLogin = async (payload) => axiosInstance.post('/admin/login', payload).catch(err => {throw err});
export const validateToken = async() => axiosInstance.get('/admin/validate',{ withCredentials: true })
export const logoutUser = async() => axiosInstance.post('/admin/logout',{ withCredentials: true })
export const postForgetPassword = async (payload) => axiosInstance.post('/admin/forget-Password', payload).catch(err => {throw err});
export const getLoginList = async({ page, limit, role = "",dir="",centre="",etype="",taskForceMember="",StatusNoida="" }) => await axiosInstance.get("/admin/user",{params:{page,limit,role,dir,centre,etype,taskForceMember,StatusNoida}, withCredentials: true })