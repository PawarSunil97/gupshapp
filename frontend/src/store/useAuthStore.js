import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: { name: "Sunil", _id: "12345", age: 25 },
  isLoading: false,

  login: () => {
    console.log("Login function called");
  },
}));
