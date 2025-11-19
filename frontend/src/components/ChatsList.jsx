import { useEffect } from "react";

import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

import { useAuthStore } from "../store/useAuthStore";

import { useChateStore } from "../store/useChateStore";
import NoChatsFound from "./NoChatFound";

const ChatsList = () => {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChateStore();
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  const sortedChats = [...chats].sort(
    (a, b) =>
      new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
  );

  return (
    <>
      {sortedChats.map((chat) => {
        const lastMessagePrefix =
          chat.lastMessageSenderId === authUser?._id ? "You: " : "";
        const lastMessageText = chat.lastMessage
          ? chat.lastMessage
          : chat.lastMessageImage
          ? "Photo"
          : "No messages yet";
        const lastMessageTime = chat.lastMessageAt
          ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null;

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`avatar ${
                  onlineUsers.includes(chat._id) ? "online" : "offline"
                }`}
              >
                <div className="size-12 rounded-full">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullName}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-slate-200 font-medium truncate">
                    {chat.fullName}
                  </h4>
                  {lastMessageTime && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {lastMessageTime}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {lastMessagePrefix}
                  {lastMessageText}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
export default ChatsList;