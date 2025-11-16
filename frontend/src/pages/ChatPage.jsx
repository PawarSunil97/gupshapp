import React from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router';

const ChatPage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center flex-col bg-transparent">
      <h1>ChatPage</h1>
      <button className="btn btn-outline" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default ChatPage