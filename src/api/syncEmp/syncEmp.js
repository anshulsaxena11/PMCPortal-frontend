import axiosInstance from '../axiosconfig'

export const syncEmpData = async() => axiosInstance.post('/admin/syncEmp')
export const empList = async ({ page = 1, limit = 10, search =" " ,centre="",StatusNoida="",etpe=" ",dir=" "} = {}) => axiosInstance.get("/admin/empList", { params: { page, limit, search,centre,StatusNoida,etpe,dir } }).then(response => response.data);
export const updateEmpStatus = async(payload) => axiosInstance.put('/admin/empList',payload)
export const centreList = async() => axiosInstance.get('/admin/stpiCentre')
export const srpiEmpTypeList = async() => axiosInstance.get('/admin/srpiEmpType')
export const srpiEmpTypeListActive = async({ page, limit, search =" " ,centre="",etpe=" ",dir="",projectId=""} = {}) => axiosInstance.get('/user/stpiEmp', { params: { page, limit, search,centre,etpe,projectId,dir } }).then(response => response.data);
export const resourseMapping = async(payload) => axiosInstance.post('/user/project-mapping', payload)
export const directoratesList = async() => axiosInstance.get('/admin/stpiDirectorates')
export const skillsMapping = async(payload) => axiosInstance.post('/user/skills', payload)
