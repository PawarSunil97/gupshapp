import React, { useEffect, useRef, useState } from 'react'
import ChatHeader from './ChatHeader'
import { useChateStore } from '../store/useChateStore';
import { useAuthStore } from '../store/useAuthStore';
import { Pencil, Trash2 } from 'lucide-react';

import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import MessagesLoadingSkeleton from './MessageLoadingSkeleton';
import MessageInput from './MessageInput';


const ChatContainer = () => {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    deleteMessage,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChateStore();
  
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    messageId: null,
  });
  const [editingMessage, setEditingMessage] = useState(null);
  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

 const handleDelete = () => {
    deleteMessage(confirmDelete.messageId);
    setConfirmDelete({ open: false, messageId: null });
  }

  useEffect(() => {
    setEditingMessage(null);
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!editingMessage) return;
    const latest = messages.find((msg) => msg._id === editingMessage._id);
    if (!latest) {
      setEditingMessage(null);
      return;
    }
    if (latest.text !== editingMessage.text) {
      setEditingMessage(latest);
    }
  }, [messages, editingMessage]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isMine = msg.senderId === authUser._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isMine ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble relative group ${
                      isMine
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg h-48 object-cover"
                      />
                    )}

                    {msg.text && <p className="mt-2">{msg.text}</p>}

                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* DELETE BUTTON – only for sender */}
                    {isMine && (
                      <div className="absolute -top-3 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setEditingMessage(msg)}
                          className="bg-slate-700 text-white text-xs px-2 py-1 rounded-md shadow-lg hover:bg-slate-600 flex items-center justify-center"
                          title="Edit message"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({ open: true, messageId: msg._id })
                          }
                          className="bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-lg hover:bg-red-500 flex items-center justify-center"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold text-white">
              Delete this message?
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() =>
                  setConfirmDelete({ open: false, messageId: null })
                }
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContainer;