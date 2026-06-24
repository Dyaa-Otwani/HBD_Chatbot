import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import CategoriesPage from './pages/CategoriesPage';
import Toast from './components/ui/Toast';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { api } from './services/api';

// ─── Global state that needs to persist across routes ─────
function AppShell() {
  useTheme(); // Applies theme on mount

  const { toasts, toast, dismiss } = useToast();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState({ type: 'GUEST', phone: null, email: null, businessId: null });

  // Chat session state (shared between Sidebar and ChatPage)
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);

  const getUserId = () => session.phone || session.email || null;

  // ── Chat session handlers ─────────────────────────────
  const handleNewChat = useCallback(async () => {
    const userId = getUserId();
    if (userId) {
      try {
        const res = await api.createChatSession(userId);
        if (res.success) setCurrentSessionId(res.session_id);
        const list = await api.listChatSessions(userId);
        setChatList(Array.isArray(list) ? list : []);
      } catch (e) { console.error('New chat session error:', e); }
    }
    setCurrentSessionId(null);
  }, [session]);

  const handleLoadSession = useCallback(async (sessionId) => {
    setCurrentSessionId(sessionId);
    // ChatArea handles loading the session messages via useChatMemory
  }, []);

  const handleDeleteSession = useCallback(async (e, sessionId) => {
    if (e) e.stopPropagation();
    const userId = getUserId();
    if (!userId) return;
    try {
      await api.deleteChatSession(sessionId, userId);
      setChatList(prev => prev.filter(s => s.session_id !== sessionId));
      if (currentSessionId === sessionId) setCurrentSessionId(null);
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    }
  }, [session, currentSessionId]);

  // Common props for Layout and pages
  const sharedProps = {
    isLoggedIn, setIsLoggedIn,
    session, setSession,
    currentSessionId, setCurrentSessionId,
    chatList, setChatList,
    chatListLoading, setChatListLoading,
    toast,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              {...sharedProps}
              onNewChat={handleNewChat}
              onLoadSession={handleLoadSession}
              onDeleteSession={handleDeleteSession}
            />
          }
        >
          <Route index element={<HomePage toast={toast} />} />
          <Route path="chat" element={<ChatPage {...sharedProps} />} />
          <Route path="categories" element={<CategoriesPage toast={toast} />} />
          <Route path="analytics" element={<AnalyticsPage toast={toast} />} />
          <Route path="about" element={<AboutPage toast={toast} />} />
          {/* Redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Global toast notifications */}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </BrowserRouter>
  );
}

export default function App() {
  return <AppShell />;
}
