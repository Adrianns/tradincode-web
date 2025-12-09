/**
 * API Client
 * Handles communication with the worker API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tradincode-worker-production.up.railway.app/api';

/**
 * Fetch API with error handling
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * API client methods
 */
export const api = {
  // Accounts
  getAllAccounts: () => fetchAPI('/accounts'),

  getAccountById: (id) => fetchAPI(`/accounts/${id}`),

  createAccount: (data) => fetchAPI('/accounts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateAccount: (id, data) => fetchAPI(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteAccount: (id) => fetchAPI(`/accounts/${id}`, {
    method: 'DELETE'
  }),

  toggleAccount: (id) => fetchAPI(`/accounts/${id}/toggle`, {
    method: 'POST'
  }),

  getAccountTrades: (id, limit = 50) =>
    fetchAPI(`/accounts/${id}/trades?limit=${limit}`),

  getAccountSnapshots: (id, limit = 100) =>
    fetchAPI(`/accounts/${id}/snapshots?limit=${limit}`),

  // Rankings
  getRankings: () => fetchAPI('/rankings'),

  // Strategies
  getStrategies: () => fetchAPI('/strategies'),

  // Health check
  health: () => fetchAPI('/health', {
    headers: { 'Content-Type': 'application/json' }
  })
};

export default api;
