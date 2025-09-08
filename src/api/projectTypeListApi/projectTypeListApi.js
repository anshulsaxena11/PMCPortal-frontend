import axiosInstance from "../axiosconfig";

export const postProjectTypeList = async (payload) => {
    try {
      const response = await axiosInstance.post('/user/ProjectTypeList-Post', payload,{ withCredentials: true,});
      return response.data;
    } catch (err) {
      throw err.response?.data ?? { message: "An unexpected error occurred" };
    }
  };
export const getProjectTypeList = async (params = {},search='',category="") => await axiosInstance.get('/user/ProjectTypeList',{ params,search,category }, {withCredentials: true}).then(response => response.data).catch(error => { console.error('Error fetching device list:', error); throw error; });
export const deleteScopeOfWork = async(id) => await axiosInstance.put(`/user/ScopeOfWork/${id}`,{withCredentials: true}).catch(err=>err.response ||  { status: 500, data: { message: err.message } });
export const getScopeOfWorkId  = async (id) =>  axiosInstance.get(`/user/scopeOfWork/${id}`,{ withCredentials: true,});
export const editScopeOfWork = async (id, Payload) => await axiosInstance.put(`/user/ScopeOfWorkedit/${id}`, Payload, {withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });;