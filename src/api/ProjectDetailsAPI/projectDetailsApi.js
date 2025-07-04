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
      headers: { 'Content-Type': 'multipart/form-data' },
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
  export const getAllProjectDetails = async (id) => await axiosInstance.get(`/user/AllprojectDetails/`).then(response => response.data).catch(error => { throw error });
  export const getProjectNameList = async () => await axiosInstance.get('/user/projectName').then(response => response.data).catch(error => { console.error('Error fetching device list:', error); throw error; });
  export const getProjectTypeList = async (id) => await axiosInstance.get(`/user/project/${id}`).then(response => response.data).catch(error => { throw error });
  export const getProjectDetailsList = async ({ page = 1, limit = 10, search = "" }) => axiosInstance.get("/user/projectDetails", { params: { page, limit, search } }).then(response => response.data);
  export const getProjectDetailsById = async (id) => await axiosInstance.get(`/user/projectDetails/${id}`).then(response => response.data).catch(error => { throw error });
  export const editProjectDetails = async (id, Payload, file) => {
    return await axiosInstance.put(`/user/projectDetails/${id}`, Payload, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};



