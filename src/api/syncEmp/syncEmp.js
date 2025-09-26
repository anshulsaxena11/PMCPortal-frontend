import axiosInstance from '../axiosconfig'

export const syncEmpData = async() => axiosInstance.post('/admin/syncEmp',{ withCredentials: true,})
export const empList = async ({ page = "", limit = "", search =" " ,centre="",StatusNoida="",etpe=" ",dir=" ",taskForceMember=" ",StateCordinator=" "} = {}) => axiosInstance.get("/admin/empList", { params: { page, limit, search,centre,StatusNoida,etpe,dir,taskForceMember,StateCordinator }, withCredentials: true, }).then(response => response.data);
export const updateEmpStatus = async(payload) => axiosInstance.put('/admin/empList',payload, {withCredentials: true,})
export const centreList = async() => axiosInstance.get('/admin/stpiCentre',{ withCredentials: true,})
export const srpiEmpTypeList = async() => axiosInstance.get('/admin/srpiEmpType')
export const srpiEmpTypeListActive = async({ page, limit, search =" " ,centre="",etpe=" ",dir="",projectId=""} = {}) => axiosInstance.get('/user/stpiEmp', { params: { page, limit, search,centre,etpe,projectId,dir }, withCredentials: true, }).then(response => response.data);
export const resourseMapping = async(payload) => axiosInstance.post('/user/project-mapping', payload, {withCredentials: true,})
export const directoratesList = async() => axiosInstance.get('/admin/stpiDirectorates',{ withCredentials: true,})
export const skillsMapping = async(payload) => axiosInstance.post('/user/skills', payload,{ withCredentials: true,})
export const updateStateCordinator = async(payload) => axiosInstance.put('/admin/stateCoordinator',payload, {withCredentials: true,})
export const getEmpDataById = async(id) => axiosInstance.get(`/user/EmpData/${id}`,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });
export const getEmployeeProjects = async(id) => axiosInstance.get(`/user/EmployeeProjects/${id}`,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });

