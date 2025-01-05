import { useQuery } from "react-query";
import axios from "axios";

export const fetchUserProfile = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem("user"))._id;

    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/user/${userId}`
    );

    // Destructure data to extract user and posts
    const { user, posts } = response.data;
    return { user, posts };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error; // Propagate the error to React Query
  }
};

export const useUserProfile = () => {
  return useQuery(["userProfile"], fetchUserProfile, {
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch when the window regains focus
    refetchOnMount: false, // Prevent refetch on component remount
    //refetchOnReconnect: false, // Prevent refetch on network reconnect
  });
};
