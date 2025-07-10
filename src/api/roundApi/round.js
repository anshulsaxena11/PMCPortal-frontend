import axiosInstance from '../axiosconfig'

export const getRoundList = async (projectName, projectType, devices) => {
    return axiosInstance.get(`/user/round`, {
        params: { projectName, projectType, devices }, withCredentials: true,
    });
};

export const getAllRound = async () => await axiosInstance.get('/user/roundList',{ withCredentials: true,})
export const postAddRound = async() => await axiosInstance.post('/user/roundList',{ withCredentials: true,})
