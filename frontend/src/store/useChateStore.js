import toast from "react-hot-toast";
import { create } from "zustand";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "./useAuthStore";

export const useChateStore = create((set, get) => {
  const bumpChatToTop = (partnerId, payload = {}) => {
    let updated = false;
    set((state) => {
      const existingChats = state.chats || [];
      const index = existingChats.findIndex((chat) => chat._id === partnerId);
      if (index === -1) return {};

      updated = true;
      const targetChat = existingChats[index];
      const updatedChat = {
        ...targetChat,
        lastMessage:
          payload.text !== undefined ? payload.text : targetChat.lastMessage,
        lastMessageImage:
          payload.image !== undefined
            ? payload.image
            : targetChat.lastMessageImage,
        lastMessageAt:
          payload.createdAt !== undefined
            ? payload.createdAt
            : targetChat.lastMessageAt,
        lastMessageSenderId:
          payload.senderId !== undefined
            ? payload.senderId
            : targetChat.lastMessageSenderId,
      };
      const remaining = [
        ...existingChats.slice(0, index),
        ...existingChats.slice(index + 1),
      ];
      const reordered = [updatedChat, ...remaining].sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );
      return { chats: reordered };
    });

    if (!updated) {
      const refreshChats = get().getMyChatPartners;
      refreshChats?.({ showLoader: false });
    }
  };

  return {
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

    toggleSound: () => {
      localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
      set({ isSoundEnabled: !get().isSoundEnabled });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    getAllContacts: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await apiClient.get("/messages/contacts");
        set({ allContacts: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load contacts");
      } finally {
        set({ isUsersLoading: false });
      }
    },
    getMyChatPartners: async ({ showLoader = true } = {}) => {
      if (showLoader) set({ isUsersLoading: true });
      try {
        const res = await apiClient.get("/messages/chats");
        set({ chats: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load chats");
      } finally {
        if (showLoader) set({ isUsersLoading: false });
      }
    },

    getMessagesByUserId: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const res = await apiClient.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } finally {
        set({ isMessagesLoading: false });
      }
    },

    sendMessage: async (messageData) => {
      const { selectedUser, messages } = get();
      const { authUser } = useAuthStore.getState();

      const tempId = `temp-${Date.now()}`;

      const optimisticMessage = {
        _id: tempId,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: messageData.text,
        image: messageData.image,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };
      set({ messages: [...messages, optimisticMessage] });

      try {
        const res = await apiClient.post(
          `/messages/send/${selectedUser._id}`,
          messageData
        );
        set({ messages: messages.concat(res.data) });
        bumpChatToTop(selectedUser._id, {
          text: res.data.text,
          image: res.data.image,
          createdAt: res.data.createdAt,
          senderId: res.data.senderId,
        });
      } catch (error) {
        set({ messages });
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    },
    updateMessage: async (messageId, updatedData) => {
      const { messages } = get();
      try {
        const res = await apiClient.put(
          `/messages/update/${messageId}`,
          updatedData
        );
        const updatedMessages = messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        );
        set({ messages: updatedMessages });
        toast.success("Message updated successfully");
        if (res.data.receiverId) {
          const partnerId =
            res.data.senderId === useAuthStore.getState().authUser?._id
              ? res.data.receiverId
              : res.data.senderId;
          bumpChatToTop(partnerId, {
            text: res.data.text,
            image: res.data.image,
            createdAt: res.data.updatedAt || res.data.createdAt,
            senderId: res.data.senderId,
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update message"
        );
      }
    },
    deleteMessage: async (messageId) => {
      const { messages } = get();
      try {
        await apiClient.delete(`/messages/delete/${messageId}`);
        const updatedMessages = messages.filter((msg) => msg._id !== messageId);
        set({ messages: updatedMessages });
        toast.success("Message deleted successfully");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete message"
        );
      }
    },

    subscribeToMessages: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;

      socket.on("newMessage", (newMessage) => {
        const { selectedUser, isSoundEnabled } = get();
        if (selectedUser && newMessage.senderId === selectedUser._id) {
          set((state) => ({ messages: [...state.messages, newMessage] }));

          if (isSoundEnabled) {
            const notificationSound = new Audio("/sounds/notification.mp3");
            notificationSound.currentTime = 0;
            notificationSound
              .play()
              .catch((e) => console.log("Audio play failed:", e));
          }
        }

        bumpChatToTop(newMessage.senderId, {
          text: newMessage.text,
          image: newMessage.image,
          createdAt: newMessage.createdAt,
          senderId: newMessage.senderId,
        });
      });

      socket.on("messageDeleted", (messageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      });

      socket.on("messageUpdated", (updatedMessage) => {
        const authUserId = useAuthStore.getState().authUser?._id;
        if (!authUserId) return;

        const { selectedUser } = get();
        const isRelevant =
          (selectedUser &&
            updatedMessage.senderId === selectedUser._id &&
            updatedMessage.receiverId === authUserId) ||
          (selectedUser &&
            updatedMessage.receiverId === selectedUser._id &&
            updatedMessage.senderId === authUserId);

        if (isRelevant) {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === updatedMessage._id ? updatedMessage : msg
            ),
          }));
        }

        const partnerId =
          updatedMessage.senderId === authUserId
            ? updatedMessage.receiverId
            : updatedMessage.senderId;
        bumpChatToTop(partnerId, {
          text: updatedMessage.text,
          image: updatedMessage.image,
          createdAt: updatedMessage.updatedAt || updatedMessage.createdAt,
          senderId: updatedMessage.senderId,
        });
      });
    },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket?.off("newMessage");
      socket?.off("messageUpdated");
      socket?.off("messageDeleted");
    },
  };
});