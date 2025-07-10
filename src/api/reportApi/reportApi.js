import axiosInstance from '../axiosconfig'

export const postReport = async (payload) => {
    const formData = new FormData();

    // Append non-file fields
    Object.keys(payload).forEach((key) => {
        if (key !== "proof") {
            const value = typeof payload[key] === "object" ? JSON.stringify(payload[key]) : payload[key];
            formData.append(key, value);
        }
    });

    // Append files one by one
    payload.proof.forEach((file, index) => { 
        if (file) {
            formData.append(`proof[${index}]`, file);
        }
    });

    // Send request with multipart/form-data
    return await axiosInstance.post("/user/report", formData, {
        headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
    });
};

export const getReportList = async ({ page = 1, limit = 10, search = "", round="", devices="",projectType="",projectName="" }) => axiosInstance.get("/user/report", { params: { page, limit, search, round, devices, projectType, projectName }, withCredentials: true, }).then(response => response.data);
export const getAllReportList = async () => 
  axiosInstance.get("/user/allreport", {
    params: {
      isDeleted: false
    }, withCredentials: true,
  }).then(response => response.data);

export const getReportById = async (id) => await axiosInstance.get(`/user/report/${id}`,{ withCredentials: true,})
export const updateReport = async (id, formData) => {
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };
    
    return await axiosInstance.put(`/user/report/${id}`, formData, config, {withCredentials: true,});
};

export const getFullReport = async(projectName, projectType, round, devices) =>await axiosInstance.get('/user/fullreport',{
    params:{projectName, projectType, round, devices}, withCredentials: true,
})

export const editupdateReport = async (id) => {
    
    return await axiosInstance.get(`/user/report/${id}`,{ withCredentials: true,});
};

export const getVulListSpecific = async ({ projectName, projectType, round, devices, Name, ipAddress }) =>
  (await axiosInstance.get('/user/VulnerabilityListSpecific', {
    params: { projectName, projectType, round, devices, Name, ipAddress }, withCredentials: true,
  })).data;

  export const deleteReportBYId = async(id)=>await axiosInstance.put(`/user/reportDeleted/${id}`,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });