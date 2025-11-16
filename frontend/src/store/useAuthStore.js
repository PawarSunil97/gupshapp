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
           set({ authUser: res.data });
           
       } catch (error) {
          toast.error("Authentication check failed",error);
           set({ authUser: null });
       } finally {
           set({ isCheckingAuth: false });
        }
    },

   signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await apiClient.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
    login: async (formData) => {
         set({ isLoggingIn: true });
         try {
             const res = await apiClient.post("/auth/login", formData);
             set({ authUser: res.data });
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

}));
