import axiosInstance from "../axiosconfig";

export const postProjectTypeList = async (payload) => {
    try {
      const response = await axiosInstance.post('/user/ProjectTypeList-Post', payload,{ withCredentials: true,});
      return response.data;
    } catch (err) {
      throw err.response?.data ?? { message: "An unexpected error occurred" };
    }
  };
export const getProjectTypeList = async (params = {}) => await axiosInstance.get('/user/ProjectTypeList',{ params }, {withCredentials: true}).then(response => response.data).catch(error => { console.error('Error fetching device list:', error); throw error; });