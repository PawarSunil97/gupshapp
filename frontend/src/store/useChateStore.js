import toast from "react-hot-toast";
import { create } from "zustand";
import apiClient from "../lib/apiClient";

export const useChateStore = create((set,get) => ({
allContacts: [],
    chats: [],
    messages:[],
    activeTab: "chats",
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === true,
    toggleSound: () => {
        const current = get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", !current);
        set({ isSoundEnabled: !current });
    },
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUseruser) => set({ selectedUseruser }),
    getAllContacts: async () => {
        set({ isUserLoading: true });
        try {
            const res = await apiClient.get("/message/contacts");
            const data = res.data;
            set({ allContacts: data });
        } catch (error) {
            console.error("Failed to fetch contacts", error);
            toast.error("Failed to fetch contacts",error.response?.data?.message);
        } finally {
            set({ isUserLoading: false });
        }
    },
    getMyChatPatners: async () => {
        set({ isUserLoading: true });
        try {
            const res = await apiClient.get("/message/chats");
            const data = res.data;
            set({ chats: data });
        } catch (error) {
            console.error("Failed to fetch chats", error);
            toast.error("Failed to fetch chats",error.response?.data?.message);
        } finally {
            set({ isUserLoading: false });
        }
    },
    getMessagesByChatId: async (chatId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await apiClient.get(`/messages/${chatId}`);
            const data = res.data;
            set({ messages: data });
        } catch (error) {
            console.error("Failed to fetch messages", error);
            toast.error("Failed to fetch messages",error.response?.data?.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },
}))