const handleResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || errorBody.message || `HTTP Error ${response.status}`);
  }
  return response.json();
};

export const api = {
  query: (payload) => fetch('/api/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  }).then(handleResponse),

  login: (phoneOrEmail, method = 'phone') => {
    const body = method === 'phone' ? { phone: phoneOrEmail } : { email: phoneOrEmail };
    return fetch('/api/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    }).then(handleResponse);
  },

  getBusinessByPhone: (phone) => 
    fetch(`/api/business/by-phone/${phone}`).then(handleResponse),

  getSuggestions: (bizId) => 
    fetch(`/api/business/${bizId}/suggestions`).then(handleResponse),

  updateBusiness: (bizId, field, value) => fetch(`/api/business/${bizId}`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ field, value, updated_by: 'user' }) 
  }).then(handleResponse),

  addBusiness: (data) => fetch('/api/business', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }).then(handleResponse),

  searchByName: (name) => 
    fetch(`/api/business/search-name?name=${encodeURIComponent(name)}`).then(handleResponse),

  searchByAddress: (addr) => 
    fetch(`/api/business/search-address?address=${encodeURIComponent(addr)}`).then(handleResponse),

  sendEmailOtp: (email, type = "login") => fetch('/api/send-otp', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ email, type }) 
  }).then(handleResponse),

  verifyEmailOtp: (email, otp) => fetch('/api/verify-otp', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ email, otp }) 
  }).then(handleResponse),

  getAiSuggestions: (text, lang, flow) => fetch('/api/smart-suggestions', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ text, language: lang, flow }) 
  }).then(handleResponse),

  addProduct: (data) => fetch('/api/products', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }).then(handleResponse),

  addDeal: (data) => fetch('/api/deals', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }).then(handleResponse),

  deleteProduct: (id) => 
    fetch(`/api/products/${id}`, { method: 'DELETE' }).then(handleResponse),

  deleteDeal: (id) => 
    fetch(`/api/deals/${id}`, { method: 'DELETE' }).then(handleResponse),

  // ── CHAT MEMORY ──────────────────────────────────────────────────────────
  createChatSession: (userId) => fetch('/api/chats', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ user_id: userId, title: 'New Chat' }) 
  }).then(handleResponse),

  listChatSessions: (userId) => 
    fetch(`/api/chats?user_id=${encodeURIComponent(userId)}`).then(handleResponse),

  getChatHistory: (sessionId, userId) => 
    fetch(`/api/chats/${sessionId}?user_id=${encodeURIComponent(userId)}`).then(handleResponse),

  deleteChatSession: (sessionId, userId) => 
    fetch(`/api/chats/${sessionId}?user_id=${encodeURIComponent(userId)}`, { 
      method: 'DELETE' 
    }).then(handleResponse),

  // ── HOME PAGE DATA DYNAMIC ENDPOINTS ──────────────────────────────────────
  getCategories: () => 
    fetch('/api/categories').then(handleResponse),

  getTrending: () => 
    fetch('/api/trending').then(handleResponse),
    
  checkHealth: () => 
    fetch('/api/health').then(handleResponse)
};

export default api;
