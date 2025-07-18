import axiosInstance from "../axiosconfig";

export const postPerseonlData = async (payload) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    if (key !== 'workOrder') {
      formData.append(key, payload[key]);
    }
  });


  formData.append('file', payload.workOrder);

  try {
    const response = await axiosInstance.post('/user/perseonalDetails', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error in submitting personal data:', error);
    if (error.response) {
      return error.response.data;
    } else {
      return {
        statusCode: 500,
        message: 'An error occurred while submitting the data.',
      };
    }
  }
};

export const deleteProjectsById = async (id) => {
    return await axiosInstance.put(`/user/projects-soft-delete/${id}`,{
        headers: {
            "Content-Type": "application/json"
        }, withCredentials: true,
    });
}
  export const getAllProjectDetails = async (id) => await axiosInstance.get(`/user/AllprojectDetails/`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
  export const getProjectNameList = async () => await axiosInstance.get('/user/projectName',{withCredentials: true }).then(response => response.data).catch(error => { console.error('Error fetching device list:', error); throw error; });
  export const getProjectTypeList = async (id) => await axiosInstance.get(`/user/project/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
  export const getProjectDetailsList = async ({ page = 1, limit = 10, search = "", isDeleted = false}) => axiosInstance.get("/user/projectDetails", { params: { page, limit, search, isDeleted }, withCredentials: true }).then(response => response.data);
  export const getProjectDetailsById = async (id) => await axiosInstance.get(`/user/projectDetails/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
  export const editProjectDetails = async (id, Payload, file) => {
    return await axiosInstance.put(`/user/projectDetails/${id}`, Payload, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        withCredentials: true 
    });
};



