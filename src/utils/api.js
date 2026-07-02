const getFallbackApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('onrender.com')) {
      return '/api';
    }
  }
  return 'http://localhost:5000/api';
};

const API_URL = import.meta.env.VITE_API_URL || getFallbackApiUrl();


const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('questgrow_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const lang = localStorage.getItem('questgrow_language') || 'zh';
  headers['Accept-Language'] = lang;
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || '請求失敗，請稍後再試。');
    error.code = data.code;
    throw error;
  }
  return data;
};

export const api = {
  // --- Auth ---
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('questgrow_jwt_token', data.token);
    }
    return data;
  },

  register: async (email, password, name, avatar) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name, avatar }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('questgrow_jwt_token', data.token);
    }
    return data;
  },

  googleLogin: async (idToken, role) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ idToken, role }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('questgrow_jwt_token', data.token);
    }
    return data;
  },

  linkGoogle: async (idToken) => {
    const res = await fetch(`${API_URL}/auth/link-google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ idToken }),
    });
    return handleResponse(res);
  },

  linkLine: async (code, redirectUri) => {
    const res = await fetch(`${API_URL}/auth/link-line`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, redirectUri }),
    });
    return handleResponse(res);
  },

  unlinkLine: async () => {
    const res = await fetch(`${API_URL}/auth/unlink-line`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  logout: () => {
    // Best-effort, fire-and-forget: invalidate this user's token server-side
    // (and every other token issued to them) so a stolen/XSS'd token can't
    // keep working after the user believes they've logged out. Local
    // cleanup below must not wait on this — it should never delay logging
    // the user out of the current device even if the network call fails.
    const headers = getHeaders();
    fetch(`${API_URL}/auth/logout`, { method: 'POST', headers }).catch(() => {});
    localStorage.removeItem('questgrow_jwt_token');
  },

  getAuthConfig: async () => {
    const res = await fetch(`${API_URL}/auth/config`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('questgrow_jwt_token', data.token);
    }
    return data;
  },


  // --- Users / Family Members ---
  getMembers: async () => {
    const res = await fetch(`${API_URL}/users/members`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getChildren: async () => {
    const res = await fetch(`${API_URL}/users/children`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addChild: async (childData) => {
    const res = await fetch(`${API_URL}/users/children`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(childData),
    });
    return handleResponse(res);
  },

  deleteChild: async (childId) => {
    const res = await fetch(`${API_URL}/users/children/${childId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateChildProfile: async (childId, data) => {
    const res = await fetch(`${API_URL}/users/children/${childId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  addParent: async (parentData) => {
    const res = await fetch(`${API_URL}/users/parents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(parentData),
    });
    return handleResponse(res);
  },

  deleteParent: async (parentEmail) => {
    const res = await fetch(`${API_URL}/users/parents/${parentEmail}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateParent: async (parentData) => {
    const res = await fetch(`${API_URL}/users/parents`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(parentData),
    });
    const data = await handleResponse(res);
    // Changing your own password bumps token_version server-side, which
    // invalidates the token used to make this very request — the server
    // sends back a fresh one in that case so the session isn't dropped.
    if (data.token) {
      localStorage.setItem('questgrow_jwt_token', data.token);
    }
    return data;
  },

  clearAllFamilyData: async (confirmEmail) => {
    const res = await fetch(`${API_URL}/users/family/clear`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ confirmEmail }),
    });
    return handleResponse(res);
  },

  // --- Tasks ---
  getTasks: async () => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addTask: async (taskData) => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  editTask: async (taskId, taskData) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  clearAllTasks: async (filter = 'all') => {
    const res = await fetch(`${API_URL}/tasks?filter=${filter}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  submitTask: async (taskId, notes, photo) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notes, photo }),
    });
    return handleResponse(res);
  },

  reviewTask: async (taskId, action, reason) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, reason }),
    });
    return handleResponse(res);
  },

  // --- Backpack & Gacha ---
  getInventory: async () => {
    const res = await fetch(`${API_URL}/items/inventory`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getRedeemLogs: async () => {
    const res = await fetch(`${API_URL}/items/redeem-logs`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // The server chooses the drawn card — the client only requests a draw and
  // pays the ticket cost; it never supplies the resulting card.
  drawGachaCard: async (costTickets = 1) => {
    const res = await fetch(`${API_URL}/items/gacha`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ costTickets }),
    });
    return handleResponse(res);
  },

  buyTicketWithGold: async () => {
    const res = await fetch(`${API_URL}/items/buy-ticket`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  requestRedeem: async (inventoryId) => {
    const res = await fetch(`${API_URL}/items/inventory/${inventoryId}/redeem-request`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  cancelRedeem: async (inventoryId) => {
    const res = await fetch(`${API_URL}/items/inventory/${inventoryId}/cancel-redeem`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  reviewRedeem: async (inventoryId, action) => {
    const res = await fetch(`${API_URL}/items/inventory/${inventoryId}/redeem-review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    return handleResponse(res);
  },

  toggleEquipItem: async (inventoryId) => {
    const res = await fetch(`${API_URL}/items/inventory/${inventoryId}/toggle-equip`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },


  // --- Family & Goals ---
  getFamilyData: async () => {
    const res = await fetch(`${API_URL}/family`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateGachaPool: async (gachaPool) => {
    const res = await fetch(`${API_URL}/family/gacha-pool`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ gachaPool }),
    });
    return handleResponse(res);
  },

  updateFamilySettings: async (settings) => {
    const res = await fetch(`${API_URL}/family/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ settings }),
    });
    return handleResponse(res);
  },

  getWishlist: async () => {
    const res = await fetch(`${API_URL}/family/wishlist`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addWishlistItem: async (title, pointsNeeded) => {
    const res = await fetch(`${API_URL}/family/wishlist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, pointsNeeded }),
    });
    return handleResponse(res);
  },

  editWishlistItem: async (id, title, pointsNeeded) => {
    const res = await fetch(`${API_URL}/family/wishlist/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title, pointsNeeded }),
    });
    return handleResponse(res);
  },

  deleteWishlistItem: async (id) => {
    const res = await fetch(`${API_URL}/family/wishlist/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  redeemWishlist: async (id) => {
    const res = await fetch(`${API_URL}/family/wishlist/${id}/redeem`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Parent-only: approve or reject a kid's pending wishlist redemption request
  reviewWishlistRedeem: async (id, action) => {
    const res = await fetch(`${API_URL}/family/wishlist/${id}/redeem-review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    return handleResponse(res);
  },

  getParentGoals: async () => {
    const res = await fetch(`${API_URL}/family/goals`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addParentGoal: async (category, title) => {
    const res = await fetch(`${API_URL}/family/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ category, title }),
    });
    return handleResponse(res);
  },

  updateGoalProgress: async (id, progress) => {
    const res = await fetch(`${API_URL}/family/goals/${id}/progress`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ progress }),
    });
    return handleResponse(res);
  },

  deleteParentGoal: async (id) => {
    const res = await fetch(`${API_URL}/family/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getWeeklyComp: async () => {
    const res = await fetch(`${API_URL}/family/weekly-comp`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getEventLogs: async () => {
    const res = await fetch(`${API_URL}/family/event-logs`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addEventLog: async (eventType, metadata) => {
    const res = await fetch(`${API_URL}/family/event-logs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ eventType, metadata }),
    });
    return handleResponse(res);
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  completeOnboarding: async () => {
    const res = await fetch(`${API_URL}/auth/complete-onboarding`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateFamilyNickname: async (nickname) => {
    const res = await fetch(`${API_URL}/family/nickname`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ nickname }),
    });
    return handleResponse(res);
  },

  getFamilyLeaderboard: async () => {
    const res = await fetch(`${API_URL}/family/leaderboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getDailyProverb: async (dateStr, role) => {
    const params = [];
    if (dateStr) params.push(`date=${dateStr}`);
    if (role) params.push(`role=${role}`);
    const queryParam = params.length > 0 ? `?${params.join('&')}` : '';
    const res = await fetch(`${API_URL}/proverbs/daily${queryParam}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedbackData),
    });
    return handleResponse(res);
  },

  getAdminFeedbacks: async () => {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateFeedbackStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/feedback/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  deleteFeedback: async (id) => {
    const res = await fetch(`${API_URL}/feedback/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getFeedbackSummaries: async () => {
    const res = await fetch(`${API_URL}/feedback/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  generateFeedbackSummary: async () => {
    const res = await fetch(`${API_URL}/feedback/summary/generate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- Push Notifications ---
  subscribePush: async (subscription) => {
    const res = await fetch(`${API_URL}/push/subscribe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subscription }),
    });
    return handleResponse(res);
  },

  unsubscribePush: async (endpoint) => {
    const res = await fetch(`${API_URL}/push/unsubscribe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ endpoint }),
    });
    return handleResponse(res);
  },

  getPushKey: async () => {
    const res = await fetch(`${API_URL}/push/key`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

