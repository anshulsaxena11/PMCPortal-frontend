import axiosInstance from '../axiosconfig'

export const getProjectDetailsTimelineById = async (id) => await axiosInstance.get(`/user/timeline/${id}`,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });
export const putProjectDetailsTimelineById = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/user/timeline/${id}`, payload, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data", // important for file uploads
      },
    });
    return response.data;
  } catch (error) {
    // Throw either backend error response or generic error
    throw error.response?.data || error;
  }
};