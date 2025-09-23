import axiosInstance from '../axiosconfig'

export const getStateList = async ({ page = 1, limit = 10, search = ""}) =>
  axiosInstance.get("/user/state", {
    params: { page, limit, search },
    withCredentials: true,
  }).then(response => response.data);