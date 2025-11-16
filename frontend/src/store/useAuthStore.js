import { create } from "zustand";
import apiClient from "../lib/apiClient";
import { toast } from "react-hot-toast";
export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: false,
    isSigningUp: false,
    checkAuth: async () => {
       try {
           const res = await apiClient.get("/auth/check-auth");
           set({ authUser: res.data });
           
       } catch (error) {
           console.error("Error checking auth:", error);
           set({ authUser: null });
       } finally {
           set({ isCheckingAuth: false });
        }
    },

    signup: async (formData) => {
        set({ isSigningUp: true });
        try {
            const res = await apiClient.post("/auth/signup", formData);
            set({ authUser: res.data.user, isSigningUp: true });
            toast.success("Signup successful!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },


}));
