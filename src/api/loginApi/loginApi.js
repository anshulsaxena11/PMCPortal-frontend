import axiosInstance from '../axiosconfig'

export const postRegister = async (payload) => axiosInstance.post('/admin/register', payload).catch(err => { throw err; });
export const postLogin = async (payload) => axiosInstance.post('/admin/login', payload).catch(err => {throw err});
export const validateToken = async() => axiosInstance.get('/admin/validate',{ withCredentials: true })
export const logoutUser = async() => axiosInstance.post('/admin/logout',{ withCredentials: true })
export const postForgetPassword = async (payload) => axiosInstance.post('/admin/forget-Password', payload).catch(err => {throw err});
export const getLoginList = async({ page, limit, role = "",dir="",centre="",etype="",taskForceMember="",StatusNoida="",search="" }) => await axiosInstance.get("/admin/user",{params:{page,limit,role,dir,centre,etype,taskForceMember,StatusNoida,search}, withCredentials: true })
export const getUserDetailsById = async(id) => axiosInstance.get(`/admin/register/${id}`,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });
export const updateUserRegistration = async (id,payload) => axiosInstance.put(`/admin/register/${id}`,payload,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });
export const checkEmail = async(payload) => axiosInstance.post('/admin/check-email',payload).catch(err => {throw err});
export const paswordChangeRequest = async(payload) => axiosInstance.post('/admin/password-Change',payload).then(response => response.data).catch(error => { throw error });
export const resetPassword = async(token) => axiosInstance.post('/admin/reset-password',{ token }).then(response => response.data).catch(error => { throw error });