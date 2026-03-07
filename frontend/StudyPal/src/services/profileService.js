import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getProfileAnalytics = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.PROFILE.GET_ANALYTICS);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch profile analytics" };
    }
};

const profileService = {
    getProfileAnalytics
};

export default profileService;
