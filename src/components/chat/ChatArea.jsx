import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, Globe, ChevronDown, MoreVertical, Plus, Search, RefreshCw, LogIn,
  Settings, MessageSquare, Trash2, Clock, Mic, MicOff, Send, ArrowUp
} from 'lucide-react';
import MessageItem from '../MessageItem';
import LoginPopup from '../LoginPopup';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { INDIAN_LANGUAGES } from '../../constants/Languages';
import { UI_TRANSLATIONS } from '../../constants/Translations';
import { api } from '../../services/api';
import { useChatMemory } from '../../hooks/useChatMemory';
import { useChatWizards, ADD_BIZ_STEPS, getAddProductSteps, getAddDealSteps } from '../../hooks/useChatWizards';

const ChatArea = ({
  // Sidebar integration
  isLoggedIn, setIsLoggedIn,
  session, setSession,
  currentSessionId, setCurrentSessionId,
  chatList, setChatList,
  chatListLoading, setChatListLoading,
  // Toast
  toast,
  // Initial query (from home page search)
  initialQuery,
  onClearInitialQuery,
  initialAction,
  onClearInitialAction,
  // Floating widget support
  isFloating = false,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [resetConfirmCount, setResetConfirmCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [msgHistory, setMsgHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState('checking');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const [localMessages, setLocalMessages] = useState([
    { id: 'init', role: 'bot', type: 'text', content: UI_TRANSLATIONS.en.welcome }
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const hasThinking = (msgs) => msgs.some(m => m.type === 'thinking');
  const isThinking = hasThinking(localMessages);

  const addThinking = () => setLocalMessages(prev =>
    prev.some(m => m.type === 'thinking') ? prev : [...prev, { id: 'thinking', role: 'bot', type: 'thinking' }]
  );
  const removeThinking = () => setLocalMessages(prev => prev.filter(m => m.type !== 'thinking'));

  // ── HOOKS ─────────────────────────────────────────────
  const wizards = useChatWizards({
    session, currentLanguage, setLocalMessages, addThinking, removeThinking,
    setSession, setQuickActionsView: () => {},
  });

  const memory = useChatMemory({
    session, currentLanguage, setLocalMessages,
    setFlowMode: wizards.setFlowMode,
    setWizardStep: wizards.setWizardStep,
    setWizardData: wizards.setWizardData,
  });

  const { flowMode, setFlowMode, wizardStep, setWizardStep, wizardData, setWizardData, pendingUpdateField, setPendingUpdateField } = wizards;
  const {
    currentSessionId: memSessionId, setCurrentSessionId: setMemSessionId,
    chatList: memChatList, setChatList: setMemChatList,
    chatListLoading: memLoading, setChatListLoading: setMemLoading,
    getUserId, startNewSession, loadChatList, loadPastSession, deleteSession, handleNewChat
  } = memory;

  // Sync memory hook session state upward if parent provided setters
  useEffect(() => { if (setCurrentSessionId) setCurrentSessionId(memSessionId); }, [memSessionId]);
  useEffect(() => { if (setChatList) setChatList(memChatList); }, [memChatList]);
  useEffect(() => { if (setChatListLoading) setChatListLoading(memLoading); }, [memLoading]);

  // ── SCROLL TO BOTTOM ─────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  // ── LANGUAGE CHANGE ───────────────────────────────────
  useEffect(() => {
    const lang = currentLanguage || 'en';
    const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
    const hint = trans.menu_hint || "💡 Tip: Use the ⋮ menu at the top for more options.";

    if (localMessages.length <= 2 && localMessages.every(m => m.id === 'init' || m.id === 'hint')) {
      setLocalMessages([
        { id: 'init', role: 'bot', type: 'text', content: trans.welcome || trans.welcome_message },
        { id: 'hint', role: 'bot', type: 'text', content: hint },
      ]);
    }
  }, [currentLanguage]);

  // ── AUTO SESSION ON LOGIN ─────────────────────────────
  useEffect(() => {
    if (isLoggedIn && !memSessionId && getUserId()) {
      startNewSession().then(() => loadChatList());
    }
  }, [isLoggedIn, session, memSessionId]);

  // ── HEALTH CHECK ──────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try { await api.checkHealth(); setBackendHealth('Connected'); }
    catch { setBackendHealth('Offline'); }
  }, []);

  useEffect(() => {
    checkHealth();
    const i = setInterval(checkHealth, 10000);
    return () => clearInterval(i);
  }, [checkHealth]);

  // ── INITIAL QUERY ─────────────────────────────────────
  useEffect(() => {
    if (initialQuery) {
      handleSend(null, initialQuery);
      onClearInitialQuery?.();
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialAction) {
      handleAction(initialAction);
      onClearInitialAction?.();
    }
  }, [initialAction]);

  // ── VOICE INPUT ───────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast?.warning('Voice input is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(prev => prev + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  // ── BACK HANDLER ──────────────────────────────────────
  const handleBack = () => {
    const lang = currentLanguage || 'en';
    const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;

    if (flowMode === 'ADD_WIZARD' || flowMode === 'ADD_PRODUCT' || flowMode === 'ADD_DEAL') {
      if (wizardStep > 0) {
        setWizardStep(prev => prev - 1);
        const stepList = flowMode === 'ADD_WIZARD' ? ADD_BIZ_STEPS
          : flowMode === 'ADD_PRODUCT' ? getAddProductSteps(trans) : getAddDealSteps(trans);
        const prevStep = stepList[wizardStep - 1];
        setLocalMessages(prev => [...prev, {
          id: Date.now(), role: 'bot', type: 'text',
          content: prevStep.prompt || trans[prevStep.promptKey] || prevStep.promptKey
        }]);
      } else {
        setFlowMode('QUERY');
      }
      return;
    }
    if (flowMode === 'SEARCH_NAME' || flowMode === 'SEARCH_ADDR') {
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'user', type: 'text', content: trans.btn_back }]);
      setFlowMode('QUERY');
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: trans.cancel_search }]);
      return;
    }
    if (flowMode === 'UPDATE_VALUE') {
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'user', type: 'text', content: trans.btn_back }]);
      setFlowMode('QUERY');
      setPendingUpdateField(null);
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: trans.cancel_update }]);
    }
  };

  // ── LOGOUT ─────────────────────────────────────────────
  const handleLogout = () => {
    const lang = currentLanguage || 'en';
    const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
    setIsLoggedIn(false);
    setSession({ type: 'GUEST', phone: null, businessId: null });
    setMemSessionId(null);
    setMemChatList([]);
    setFlowMode('QUERY');
    setWizardStep(0);
    setWizardData({});
    setLocalMessages([
      { id: 'init', role: 'bot', type: 'text', content: trans.welcome || trans.welcome_message },
      { id: 'hint', role: 'bot', type: 'text', content: trans.menu_hint || "💡 Click the ⋮ menu at the top for more options." }
    ]);
    toast?.success('Logged out successfully');
  };

  // ── LOGIN SUCCESS ─────────────────────────────────────
  const handleLoginSuccess = async (identifier, method = 'phone') => {
    try {
      const res = await api.login(identifier, method);
      if (res.status === 'error') throw new Error(res.message);
      setShowLoginPopup(false);
      const trans = UI_TRANSLATIONS[currentLanguage || 'en'] || UI_TRANSLATIONS.en;
      if (res.status === 'logged_in' && res.businesses?.length) {
        const biz = res.businesses[0];
        const sessionData = { type: 'BUSINESS', businessId: biz.global_business_id };
        if (method === 'phone') sessionData.phone = identifier;
        else { sessionData.email = identifier; if (biz.phone_number) sessionData.phone = biz.phone_number; }
        setSession(sessionData);
        setIsLoggedIn(true);
        setLocalMessages(prev => [...prev, {
          id: Date.now(), role: 'bot', type: 'text',
          content: `👋 ${trans.welcome_back || 'Welcome back'}, ${biz.business_name}!`
        }]);
        toast?.success(`Welcome back, ${biz.business_name}!`);
        try {
          const sRes = await api.createChatSession(identifier);
          if (sRes.success) setMemSessionId(sRes.session_id);
          const list = await api.listChatSessions(identifier);
          setMemChatList(Array.isArray(list) ? list : []);
        } catch (err) { console.error('Chat session init error:', err); }
      } else {
        const sessionData = { type: 'REGISTERED' };
        if (method === 'phone') sessionData.phone = identifier;
        else sessionData.email = identifier;
        setSession(sessionData);
        setIsLoggedIn(true);
        setLocalMessages(prev => [...prev,
          { id: Date.now(), role: 'bot', type: 'text', content: trans.welcome },
          { id: Date.now() + 1, role: 'bot', type: 'text', content: trans.menu_hint || "💡 Click the ⋮ menu for more actions." }
        ]);
        toast?.info('Logged in. No business found — you can add one!');
        try {
          const sRes = await api.createChatSession(identifier);
          if (sRes.success) setMemSessionId(sRes.session_id);
          const list = await api.listChatSessions(identifier);
          setMemChatList(Array.isArray(list) ? list : []);
        } catch {}
      }
    } catch (e) {
      toast?.error(`Login error: ${e.message}`);
    }
  };

  // ── SEND MESSAGE ──────────────────────────────────────
  const handleSend = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const text = (overrideText || inputText).trim();
    if (!text || isThinking) return;

    setInputText('');
    setLocalMessages(prev => [...prev, { id: Date.now(), role: 'user', type: 'text', content: text }]);
    setMsgHistory(prev => prev[prev.length - 1] === text ? prev : [...prev, text]);
    setHistoryIndex(-1);
    addThinking();

    try {
      const lang = currentLanguage || 'en';
      const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
      const wasWizardFlow = await wizards.handleWizardSend(text, trans);
      if (wasWizardFlow) return;

      let activeSessionId = memSessionId;
      if (isLoggedIn && !activeSessionId) {
        activeSessionId = await startNewSession();
        await loadChatList();
      }

      const data = await api.query({ query: text, session, language: lang, session_id: activeSessionId });
      removeThinking();

      const responseType = data.type || 'text';
      if (responseType === 'command') { handleAction(data.command); return; }

      setLocalMessages(prev => [...prev, {
        id: Date.now(), role: 'bot', type: responseType,
        content: data.data || data.content || (trans.fallback_response || 'I am not sure about that.'),
        intro: data.intro, suggestions: data.suggestions, prompt: data.prompt,
      }]);
    } catch (e) {
      removeThinking();
      const lang = currentLanguage || 'en';
      const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
      setLocalMessages(prev => [...prev, {
        id: Date.now(), role: 'bot', type: 'text',
        content: `⚠️ ${trans.generic_error || 'Something went wrong.'} (${e.message})`
      }]);
      toast?.error('Failed to get response. Check your connection.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && msgHistory.length > 0) {
      e.preventDefault();
      const nextIdx = historyIndex + 1;
      if (nextIdx < msgHistory.length) {
        setHistoryIndex(nextIdx);
        setInputText(msgHistory[msgHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setInputText(msgHistory[msgHistory.length - 1 - nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInputText('');
      }
    }
  };

  // ── ACTION HANDLER ────────────────────────────────────
  const handleAction = async (action, payload) => {
    const lang = currentLanguage || 'en';
    const trans = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;

    const actionLabels = {
      'search': trans.btn_show_biz,
      'update': trans.btn_update_biz,
      'add_new_business': trans.btn_add,
      'search_by_name': trans.btn_name,
      'search_by_address': trans.btn_address,
      'update_specific': `Update ${payload}`,
      'claim_business': `Claim ${payload?.business_name}`,
      'go_back': trans.btn_back,
      'reset_chat': trans.btn_reset
    };

    if (actionLabels[action]) {
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'user', type: 'text', content: actionLabels[action] }]);
    }

    if (action === 'go_back') return handleBack();
    if (action === 'login_trigger') return setShowLoginPopup(true);
    if (action === 'cancel_sub_menu') return;

    if (action === 'search_method') {
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'user', type: 'text', content: trans.btn_find }]);
      setLocalMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot', type: 'search_options',
        content: trans.search_by,
        labels: { name: trans.btn_name, address: trans.btn_address }
      }]);
      return;
    }
    if (action === 'search_by_name') { setFlowMode('SEARCH_NAME'); setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: trans.search_prompt }]); }
    if (action === 'search_by_address') { setFlowMode('SEARCH_ADDR'); setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: trans.address_prompt }]); }
    if (action === 'add_new_business') {
      setFlowMode('ADD_WIZARD'); setWizardStep(0);
      const initialData = {};
      if (session.phone) initialData.phone = session.phone;
      if (session.email) initialData.email = session.email;
      setWizardData(initialData);
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: trans.prompt_phone }]);
    }
    if (action === 'start_add_product') {
      if (!session.businessId) return setShowLoginPopup(true);
      const steps = getAddProductSteps(trans);
      setFlowMode('ADD_PRODUCT'); setWizardStep(0); setWizardData({});
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: steps[0].prompt }]);
      return;
    }
    if (action === 'start_add_deal') {
      if (!session.businessId) return setShowLoginPopup(true);
      const steps = getAddDealSteps(trans);
      setFlowMode('ADD_DEAL'); setWizardStep(0); setWizardData({});
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: steps[0].prompt }]);
      return;
    }
    if (action === 'reset_chat') { setShowResetConfirm(true); return; }
    if (action === 'confirm_reset') {
      if (memSessionId && getUserId()) {
        api.deleteChatSession(memSessionId, getUserId()).then(() => loadChatList());
      }
      setShowResetConfirm(false);
      const hint = trans.menu_hint || "💡 Click the ⋮ menu for more options.";
      setLocalMessages([
        { id: 'init', role: 'bot', type: 'text', content: trans.chat_cleared || 'Chat cleared!' },
        { id: 'hint', role: 'bot', type: 'text', content: hint }
      ]);
      setResetConfirmCount(0); setFlowMode('QUERY'); setWizardStep(0); setWizardData({}); setMemSessionId(null);
      toast?.success('Chat cleared');
      return;
    }
    if (action !== 'reset_chat') setResetConfirmCount(0);

    if (action === 'search') {
      addThinking();
      try {
        const data = await api.query({ query: 'show my business', session, language: lang, session_id: memSessionId });
        removeThinking();
        if (!data || (!data.type && data.detail)) {
          setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: '❌ Could not load your business.' }]);
          return;
        }
        setLocalMessages(prev => [...prev, {
          id: Date.now(), role: 'bot', type: data.type || 'text',
          content: data.content ?? data.data ?? data.detail ?? 'No data found.',
          intro: data.intro, prompt: data.prompt, suggestions: data.suggestions
        }]);
      } catch { removeThinking(); toast?.error('Error loading business'); }
    }
    if (action === 'update') {
      addThinking();
      try {
        const data = await api.query({ query: 'update my business', session, language: lang, session_id: memSessionId });
        removeThinking();
        setLocalMessages(prev => [...prev, { id: Date.now(), role: 'suggestions', content: data.content, intro: data.intro }]);
      } catch { removeThinking(); }
    }
    if (action === 'update_specific') {
      const field = payload;
      setPendingUpdateField(field);
      setFlowMode('UPDATE_VALUE');
      setLocalMessages(prev => [...prev, {
        id: Date.now(), role: 'bot', type: 'text',
        content: `${trans.update_prompt || 'Please enter your new'} ${field.replace('_', ' ')}:`
      }]);
    }
    if (action?.startsWith('Update ')) {
      const field = action.replace('Update ', '').toLowerCase().replace(' ', '_');
      setPendingUpdateField(field);
      setFlowMode('UPDATE_VALUE');
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: `${trans.update_prompt} ${field.replace('_', ' ')}:` }]);
    }
    if (action === 'claim_business') {
      const verMsg = trans.claim_verification
        ? trans.claim_verification.replace('this business', `"${payload.business_name}"`)
        : `To manage "${payload.business_name}", we need to verify your ownership via phone.`;
      setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: verMsg }]);
      setShowLoginPopup(true);
    }
    if (action === 'manage_products') {
      addThinking();
      try {
        const data = await api.query({ query: 'manage product', session, language: lang, session_id: memSessionId });
        removeThinking();
        setLocalMessages(prev => [...prev, {
          id: Date.now(), role: 'bot',
          type: data.type === 'manage_products' ? 'manage_products' : 'text',
          content: data.content !== undefined ? data.content : (data.data || ''),
          intro: data.intro
        }]);
      } catch { removeThinking(); }
    }
    if (action === 'manage_deals') {
      addThinking();
      try {
        const data = await api.query({ query: 'manage deal', session, language: lang, session_id: memSessionId });
        removeThinking();
        setLocalMessages(prev => [...prev, {
          id: Date.now(), role: 'bot',
          type: data.type === 'manage_deals' ? 'manage_deals' : 'text',
          content: data.content !== undefined ? data.content : (data.data || ''),
          intro: data.intro
        }]);
      } catch { removeThinking(); }
    }
    if (action === 'delete_product') {
      const res = await api.deleteProduct(payload);
      if (res.success) {
        setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: '🗑️ Product removed successfully!' }]);
        toast?.success('Product deleted');
        setTimeout(() => handleAction('manage_products'), 300);
      }
    }
    if (action === 'delete_deal') {
      const res = await api.deleteDeal(payload);
      if (res.success) {
        setLocalMessages(prev => [...prev, { id: Date.now(), role: 'bot', type: 'text', content: '🗑️ Deal removed successfully!' }]);
        toast?.success('Deal deleted');
        setTimeout(() => handleAction('manage_deals'), 300);
      }
    }
  };

  // Only messages that are visible (filter out thinking — shown by TypingIndicator)
  const visibleMessages = localMessages.filter(m => m.type !== 'thinking');
  const isEmptyChat = visibleMessages.length <= 2 && visibleMessages.every(m => m.id === 'init' || m.id === 'hint');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }}>

      {/* ── HEADER ─────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Left: Brand + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}>
            🐝
          </div>
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              CityHangAround AI
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div className={`status-dot ${backendHealth === 'Connected' ? 'online' : backendHealth === 'Offline' ? 'offline' : 'checking'}`} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {backendHealth === 'Connected' ? 'Online' : backendHealth === 'Offline' ? 'Offline' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Language selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
                borderRadius: 8, cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              aria-label="Change language"
            >
              <Globe size={13} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{currentLanguage}</span>
              <ChevronDown size={11} style={{ color: 'var(--text-muted)', transform: isLangMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
            </button>
            {isLangMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                width: 160, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden', zIndex: 50, animation: 'scaleIn 150ms ease',
              }}>
                <div style={{ maxHeight: 220, overflowY: 'auto' }} className="no-scrollbar">
                  {INDIAN_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setCurrentLanguage(lang.code); setIsLangMenuOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 14px', border: 'none', background: currentLanguage === lang.code ? 'var(--color-primary-light)' : 'transparent',
                        cursor: 'pointer', fontSize: '0.8rem',
                        fontWeight: currentLanguage === lang.code ? 700 : 500,
                        color: currentLanguage === lang.code ? 'var(--color-primary)' : 'var(--text-secondary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => { if (currentLanguage !== lang.code) e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
                      onMouseLeave={e => { if (currentLanguage !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{lang.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', opacity: 0.7 }}>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              style={{
                padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: isActionsMenuOpen ? 'var(--color-primary-light)' : 'transparent',
                color: isActionsMenuOpen ? 'var(--color-primary)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { if (!isActionsMenuOpen) { e.currentTarget.style.background = 'var(--bg-surface-2)'; } }}
              onMouseLeave={e => { if (!isActionsMenuOpen) { e.currentTarget.style.background = 'transparent'; } }}
              aria-label="More actions"
            >
              <MoreVertical size={17} />
            </button>
            {isActionsMenuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsActionsMenuOpen(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 6,
                  width: 220, background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)', zIndex: 50,
                  overflow: 'hidden', animation: 'scaleIn 150ms ease',
                }}>
                  <div style={{ padding: '10px 14px 8px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>Actions</p>
                  </div>
                  <div style={{ padding: '6px 0' }}>
                    {!isLoggedIn ? (
                      <>
                        <MenuBtn icon={<LogIn size={14} className="text-indigo-500" />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.btn_phone || 'Login'} onClick={() => { setIsActionsMenuOpen(false); handleAction('login_trigger'); }} />
                        <MenuBtn icon={<Search size={14} style={{ color: '#3b82f6' }} />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.btn_find || 'Find Business'} onClick={() => { setIsActionsMenuOpen(false); handleAction('search_method'); }} />
                      </>
                    ) : (
                      <>
                        <MenuBtn icon={<Search size={14} style={{ color: '#3b82f6' }} />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.btn_show_biz || 'Show Business'} onClick={() => { setIsActionsMenuOpen(false); handleAction('search'); }} />
                        <MenuBtn icon={<RefreshCw size={14} style={{ color: '#10b981' }} />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.btn_update_biz || 'Update Business'} onClick={() => { setIsActionsMenuOpen(false); handleAction('update'); }} />
                      </>
                    )}
                    <MenuBtn icon={<Plus size={14} style={{ color: '#10b981' }} />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.btn_add || 'Add Business'} onClick={() => { setIsActionsMenuOpen(false); handleAction('add_new_business'); }} />
                    <div style={{ margin: '4px 12px', borderTop: '1px solid var(--border-subtle)' }} />
                    <MenuBtn icon={<RefreshCw size={14} style={{ color: 'var(--color-error)' }} />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.btn_reset || 'Reset Chat'} onClick={() => { setIsActionsMenuOpen(false); handleAction('reset_chat'); }} color="error" />
                    {isLoggedIn && (
                      <MenuBtn icon={<LogIn size={14} style={{ color: 'var(--text-muted)', transform: 'rotate(180deg)' }} />} label={UI_TRANSLATIONS[currentLanguage || 'en']?.logout || 'Logout'} onClick={() => { setIsActionsMenuOpen(false); handleLogout(); }} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          {isFloating && (
            <button
              onClick={onClose}
              style={{
                padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
                display: 'flex', alignItems: 'center', justifyItems: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ── BACKEND OFFLINE BANNER ───────────────── */}
      {backendHealth === 'Offline' && (
        <div style={{
          padding: '10px 16px',
          background: '#fef3c7',
          borderBottom: '1px solid #fde68a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          animation: 'slideUp 200ms ease',
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>⚠️ Backend Offline</p>
            <p style={{ fontSize: '0.75rem', color: '#b45309' }}>
              Start the backend server on port 5000 to use the chatbot.
            </p>
          </div>
          <button
            onClick={checkHealth}
            style={{
              padding: '5px 12px', background: '#f59e0b', color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── MESSAGES AREA ────────────────────────── */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
        className="no-scrollbar"
      >
        {isEmptyChat ? (
          <WelcomeScreen onSend={(q) => handleSend(null, q)} />
        ) : (
          <>
            {visibleMessages.map(msg => (
              <MessageItem
                key={msg.id}
                message={msg}
                onAction={handleAction}
                isLoggedIn={isLoggedIn}
                session={session}
              />
            ))}
            {isThinking && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK ACTION CHIPS (logged in business) ── */}
      {isLoggedIn && session.businessId && flowMode === 'QUERY' && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          flexShrink: 0,
        }}
          className="no-scrollbar"
        >
          {[
            { label: 'Add Product', action: 'start_add_product', emoji: '📦' },
            { label: 'Add Deal', action: 'start_add_deal', emoji: '🏷️' },
            { label: 'My Products', action: 'manage_products', emoji: '📋' },
            { label: 'My Deals', action: 'manage_deals', emoji: '🔥' },
          ].map(chip => (
            <button
              key={chip.action}
              onClick={() => handleAction(chip.action)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.75rem',
                fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
            >
              {chip.emoji} {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT BAR ─────────────────────────────── */}
      {flowMode === 'ADD_PRODUCT' && wizardStep === 4 ? (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)', display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <input type="file" accept="image/*" id="product-image-upload" style={{ display: 'none' }}
            onChange={e => wizards.handleImageUpload(e)} />
          <label
            htmlFor="product-image-upload"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
              border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem',
            }}
          >
            <Plus size={15} /> Choose Image
          </label>
          <button
            type="button"
            onClick={() => wizards.handleImageSkip()}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
              background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Skip
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 12px',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => {
                let val = e.target.value;
                if (flowMode === 'ADD_WIZARD' && ADD_BIZ_STEPS[wizardStep]?.key === 'phone') {
                  val = val.replace(/\D/g, '').slice(0, 10);
                }
                setInputText(val);
              }}
              onKeyDown={handleKeyDown}
              placeholder={UI_TRANSLATIONS[currentLanguage || 'en']?.input_placeholder || 'Ask anything...'}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.875rem', color: 'var(--text-primary)',
              }}
              disabled={isThinking}
              aria-label="Message input"
            />

            {/* Voice button */}
            <button
              type="button"
              onClick={toggleVoice}
              title={isRecording ? 'Stop recording' : 'Voice input'}
              style={{
                padding: 6, borderRadius: 8, border: 'none', background: 'transparent',
                cursor: 'pointer', color: isRecording ? '#ef4444' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', flexShrink: 0,
                transition: 'color var(--transition-fast)',
              }}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none',
                background: inputText.trim() && !isThinking ? 'var(--color-primary)' : 'var(--border-default)',
                color: 'white', cursor: inputText.trim() && !isThinking ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all var(--transition-fast)',
                boxShadow: inputText.trim() && !isThinking ? 'var(--shadow-primary)' : 'none',
              }}
              onMouseEnter={e => { if (inputText.trim() && !isThinking) e.currentTarget.style.background = 'var(--color-primary-hover)'; }}
              onMouseLeave={e => { if (inputText.trim() && !isThinking) e.currentTarget.style.background = 'var(--color-primary)'; }}
              aria-label="Send message"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </form>
      )}

      {/* ── LOGIN POPUP ───────────────────────────── */}
      {showLoginPopup && (
        <LoginPopup
          onClose={() => setShowLoginPopup(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* ── RESET CONFIRMATION ────────────────────── */}
      {showResetConfirm && (
        <>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40, borderRadius: 'inherit' }}
            onClick={() => setShowResetConfirm(false)}
          />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24,
          }}>
            <div style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 300, overflow: 'hidden',
              animation: 'scaleIn 200ms ease',
            }}>
              <div style={{ padding: '20px 20px 12px', textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: 'var(--color-error-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                }}>
                  <RefreshCw size={22} style={{ color: 'var(--color-error)' }} />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {UI_TRANSLATIONS[currentLanguage || 'en']?.btn_reset || 'Reset Chat'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This will clear the current chat. Are you sure?
                </p>
              </div>
              <div style={{ display: 'flex', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    flex: 1, padding: '12px', fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--text-secondary)', border: 'none', background: 'transparent',
                    cursor: 'pointer', borderRight: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction('confirm_reset')}
                  style={{
                    flex: 1, padding: '12px', fontSize: '0.8125rem', fontWeight: 700,
                    color: 'var(--color-error)', border: 'none', background: 'transparent',
                    cursor: 'pointer', transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-error-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Menu button helper
function MenuBtn({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px', border: 'none', background: 'transparent',
        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
        color: color === 'error' ? 'var(--color-error)' : 'var(--text-secondary)',
        transition: 'background var(--transition-fast)',
        textAlign: 'left',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = color === 'error' ? 'var(--color-error-light)' : 'var(--bg-surface-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default ChatArea;
