import axiosInstance from "../axiosconfig";

export const postCertificate = async (payload) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    if (key !== 'uploadeCertificate') {
      formData.append(key, payload[key]);
    }
  });


  formData.append('file', payload.uploadeCertificate);

  try {
    const response = await axiosInstance.post('/user/certificate', formData, {
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

export const getCertificateDetailsList = async ({ page = 1, limit = 10, search = ""}) => axiosInstance.get("/user/certificate", { params: { page, limit, search },withCredentials: true,}).then(response => response.data);
export const deleteCertificateById = async(id) => await axiosInstance.put(`/user/certificate-soft-delete/${id}`,{withCredentials: true}).catch(err=>err.response ||  { status: 500, data: { message: err.message } });
export const getCertificateDetailsById = async (id) => await axiosInstance.get(`/user/certificate/${id}`,{withCredentials: true }).then(response => response.data).catch(error => { throw error });
export const getCertificateByUserId = async (userid, params = {}) => await axiosInstance.get(`/user/usercertificate/${userid}`,{ params, withCredentials: true }).then(response => response.data).catch(error => { throw error });
export const updateCertificate = async (id, Payload, file) => await axiosInstance.put(`/user/certificate/${id}`, Payload, {headers: {"Content-Type": "multipart/form-data"},withCredentials: true }).catch(err => err.response || { status: 500, data: { message: err.message } });;