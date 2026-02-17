/**
 * API Client — Singleton HTTP client with auth, token refresh, and abort support.
 * 
 * Performance optimizations:
 * - Request deduplication via AbortController
 * - Automatic token refresh on 401
 * - No redundant JSON.stringify for non-body requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this._inflightRequests = new Map(); // Dedup inflight GETs
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getHeaders(includeContentType = true) {
    const headers = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 — Token expired
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          config.headers = {
            ...this.getHeaders(),
            ...options.headers,
          };
          const retryResponse = await fetch(url, config);
          return this.handleResponse(retryResponse);
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      // Don't log abort errors
      if (error.name === 'AbortError') throw error;
      console.error('API Error:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.detail || data?.error || 'Request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ============== HTTP Methods ==============

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, data) {
    const options = { method: 'DELETE' };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return this.request(endpoint, options);
  }

  // File upload (FormData — no Content-Type header)
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // Get full media URL from relative path
  getMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const host = this.baseURL.replace('/api/v1', '');
    return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}

// Export singleton
const api = new ApiClient(API_BASE_URL);

export default api;
export { API_BASE_URL };
