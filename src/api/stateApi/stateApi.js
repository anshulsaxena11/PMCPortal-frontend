import axiosInstance from '../axiosconfig'

export const getStateList = async ({ page = "", limit = "", search = ""}) =>
  axiosInstance.get("/user/state", {
    params: { page, limit, search },
    withCredentials: true,
  }).then(response => response.data);