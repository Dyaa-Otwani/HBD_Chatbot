import { useState } from 'react';
import { api } from '../services/api';
import { UI_TRANSLATIONS } from '../constants/Translations';

export function useChatMemory({ session, currentLanguage, setLocalMessages, setFlowMode, setWizardStep, setWizardData }) {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatList, setChatList] = useState([]); // list of past sessions
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [chatListLoading, setChatListLoading] = useState(false);

  const getUserId = () => session.phone || session.email || null;

  const startNewSession = async () => {
    const userId = getUserId();
    if (!userId) return null;
    try {
      const res = await api.createChatSession(userId);
      if (res.success) {
        setCurrentSessionId(res.session_id);
        return res.session_id;
      }
    } catch (e) {
      console.error('Failed to create chat session:', e);
    }
    return null;
  };

  const loadChatList = async () => {
    const userId = getUserId();
    if (!userId) return;
    setChatListLoading(true);
    try {
      const list = await api.listChatSessions(userId);
      setChatList(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load chat list:', e);
    } finally {
      setChatListLoading(false);
    }
  };

  const loadPastSession = async (sessionId) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const history = await api.getChatHistory(sessionId, userId);
      if (!Array.isArray(history)) return;
      const mapped = history.map((h, i) => {
        let parsedContent = h.content;
        let msgType = 'text';
        let intro = null;
        let suggestions = null;
        let prompt = null;

        // Try to parse JSON if it looks like a rich message
        if (typeof h.content === 'string' && (h.content.trim().startsWith('{') || h.content.trim().startsWith('['))) {
          try {
            const data = JSON.parse(h.content);
            if (data && typeof data === 'object') {
              msgType = data.type || 'text';
              parsedContent = data.content ?? data.data ?? data.detail ?? data;
              intro = data.intro;
              suggestions = data.suggestions;
              prompt = data.prompt;
            }
          } catch (e) { /* fallback to text if parsing fails */ }
        }

        return {
          id: `history_${i}_${Date.now()}`,
          role: h.role === 'assistant' ? 'bot' : 'user',
          type: msgType,
          content: parsedContent,
          intro: intro,
          suggestions: suggestions,
          prompt: prompt
        };
      });
      setCurrentSessionId(sessionId);
      setLocalMessages(mapped.length ? mapped : [{ id: 'init', role: 'bot', type: 'text', content: 'No messages in this session.' }]);
      setShowChatSidebar(false);
      setFlowMode('QUERY');
    } catch (e) {
      console.error('Failed to load past session:', e);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation(); // prevent triggering loadPastSession
    const userId = getUserId();
    if (!userId) return;
    try {
      await api.deleteChatSession(sessionId, userId);
      setChatList(prev => prev.filter(s => s.session_id !== sessionId));
      // If deleted session was active, start fresh
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        const lang = currentLanguage || 'en';
        const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
        setLocalMessages([{ id: 'init', role: 'bot', type: 'text', content: trans.welcome }]);
      }
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  const handleNewChat = async () => {
    const lang = currentLanguage || 'en';
    const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
    const hint = trans.menu_hint || "💡 Note: Click the three-dot (⋮) menu at the top-right for more options.";
    setLocalMessages([
      { id: 'init', role: 'bot', type: 'text', content: trans.welcome || trans.welcome_message },
      { id: 'hint', role: 'bot', type: 'text', content: hint }
    ]);
    setFlowMode('QUERY');
    setWizardStep(0);
    setWizardData({});
    setCurrentSessionId(null);
    setShowChatSidebar(false);
    // Create new session immediately if logged in
    await startNewSession();
    // Refresh list
    await loadChatList();
  };

  return {
    currentSessionId,
    setCurrentSessionId,
    chatList,
    setChatList,
    showChatSidebar,
    setShowChatSidebar,
    chatListLoading,
    setChatListLoading,
    getUserId,
    startNewSession,
    loadChatList,
    loadPastSession,
    deleteSession,
    handleNewChat
  };
}
