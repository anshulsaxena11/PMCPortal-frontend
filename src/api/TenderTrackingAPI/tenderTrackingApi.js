import axiosInstance from "../axiosconfig";

export const postTenderTrackingData = async (payload) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
     if (key !== 'tenderDocument') {
      if (key === 'taskForce' && typeof payload[key] === 'object') {
        formData.append(key, JSON.stringify(payload[key]));
      } else {
        formData.append(key, payload[key]);
      }
    }
  });


  formData.append('tenderDocument', payload.tenderDocument);

  try {
    const response = await axiosInstance.post('/user/checkTenderName', formData, {
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

export const getTenderDetailsList = async ({ page = 1, limit = 10, search = "",isDeleted = "" }) => {
  try {
    const response = await axiosInstance.get("/user/Tender", {
      params: { page, limit, search, isDeleted:isDeleted.toString() }, withCredentials: true,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching tender details list:", error);
    return {
      data: [],
      total: 0,
      totalPages: 1,
      message: "Failed to fetch data.",
    };
  }
};

export const getAllTenderList = async ({ isDeleted = false} = {}) => {
  try {
    const response = await axiosInstance.get("/user/Alltender", {
      params: { isDeleted: isDeleted },
    });

    // Optional: Check if data exists before returning
    if (response?.data) {
      return response.data;
    } else {
      throw new Error("No data returned from server.");
    }
  } catch (error) {
    console.error("Error fetching tender details list:", error);
    return {
      message: "Failed to fetch data.",
      error: error.message || error,
    };
  }
};



export const deleteTenderById = async (id) => {
    return await axiosInstance.put(`/user/soft-delete/${id}`,{},{
        headers: {
            "Content-Type": "application/json"
        }, withCredentials: true,
    });
}
export const getEmpList = async()=> axiosInstance.get('/user/EmpListTF',{ withCredentials: true,})

export const getTrackingById = async(id) => axiosInstance.get(`/user/tenderTracking/${id}`,{ withCredentials: true,}).then(response => response.data).catch(error => { throw error });

 export const updateTenderById = async (id, Payload, file) => {
    return await axiosInstance.put(`/user/tenderTracking/${id}`, Payload, {
        headers: {
            "Content-Type": "multipart/form-data"
        }, withCredentials: true,
    });
};
export const updatetendermessage = async (id, message, messageStatus = 'Lost') => {
  return await axiosInstance.put(
    `/user/tenderTracking/${id}`,
    { message, messageStatus }, // ✅ send both fields in body
    {
      headers: {
        "Content-Type": "application/json"
      }, withCredentials: true,
    }
  );
};


