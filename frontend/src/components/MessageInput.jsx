import React, { useEffect, useRef, useState } from 'react'
import useKeyboardSound from '../hooks/useKeyboardSound';
import toast from 'react-hot-toast';
import { useChateStore } from '../store/useChateStore';
import { ImageIcon, SendIcon, XIcon } from 'lucide-react';

const MessageInput = ({ editingMessage, onCancelEdit }) => {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { sendMessage, updateMessage, isSoundEnabled } = useChateStore();

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editingMessage]);

  const resetComposer = () => {
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancelEdit = () => {
    resetComposer();
    onCancelEdit?.();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (editingMessage) {
      if (!text.trim()) {
        toast.error("Message cannot be empty");
        return;
      }
      await updateMessage(editingMessage._id, { text: text.trim() });
      handleCancelEdit();
      return;
    }

    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    await sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    resetComposer();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      {editingMessage && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          <span>Editing message</span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-xs font-medium text-amber-200 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {imagePreview && !editingMessage && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex space-x-4"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          placeholder="Type your message..."
        />

        {!editingMessage && (
          <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${
                imagePreview ? "text-cyan-500" : ""
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          type="submit"
          disabled={
            editingMessage ? !text.trim() : !text.trim() && !imagePreview
          }
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingMessage ? (
            <span className="text-sm font-semibold">Save</span>
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;