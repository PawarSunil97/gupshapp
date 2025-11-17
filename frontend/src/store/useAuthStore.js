import { create } from "zustand";
import apiClient from "../lib/apiClient";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: false,
    isSigningUp: false,
    isLoggingIn: false,
    checkAuth: async () => {
        set({ isCheckingAuth: true });
       try {
           const res = await apiClient.get("/auth/check-auth");
           set({ authUser: res.data?.user || null });
           
       } catch (error) {
          toast.error("Authentication check failed",error.response.data.message);
           set({ authUser: null });
       } finally {
           set({ isCheckingAuth: false });
        }
    },

   signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await apiClient.post("/auth/signup", data);
      set({ authUser: res.data?.user || null });

      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
    login: async (data) => {
         set({ isLoggingIn: true });
         try {
             const res = await apiClient.post("/auth/login", data);
             set({ authUser: res.data?.user || null });
             toast.success("Login successful!");
         } catch (error) {
             toast.error(error.response?.data?.message || "Login failed");
         } finally {
             set({ isLoggingIn: false });
         }
     },
logout: async () => {
    try {
        await apiClient.post("/auth/logout");
        set({ authUser: null });
        toast.success("Logged out successfully!");
    } catch (error) {
        toast.error(error.response?.data?.message || "Logout failed");
    }
    },
updateProfile: async (updatedData) => {
    try {
        const res = await apiClient.put("/auth/update-profile", updatedData);
        set({ authUser: res.data?.user || null });
        toast.success("Profile updated successfully!");
    } catch (error) {
        toast.error(error.response?.data?.message || "Profile update failed");
    }
}


}));
