/* eslint-disable @typescript-eslint/no-explicit-any */
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

async function handleResponse<T>(response: Response, originalUrl?: string, originalOptions?: RequestInit): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    // If 401 Unauthorized, try to refresh token and retry the request once
    if (response.status === 401 && originalUrl && originalOptions) {
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.accessToken || (refreshData.data && refreshData.data.accessToken);
          if (newToken) {
            localStorage.setItem('accessToken', newToken);
            // Re-build headers with new token
            const headers = new Headers(originalOptions.headers);
            headers.set('Authorization', `Bearer ${newToken}`);

            // Retry request
            const retryRes = await fetch(originalUrl, { ...originalOptions, headers });
            let retryData: any;
            try { retryData = await retryRes.json(); } catch (e) { retryData = null; }
            if (retryRes.ok) return retryData as T;

            let retryErrMsg = retryData?.error || retryData?.message || retryRes.statusText;
            if (retryData?.details && Array.isArray(retryData.details)) {
              retryErrMsg = retryData.details.map((d: any) => `${d.path?.join('.') || ''}: ${d.message}`).join(', ');
            }
            throw new ApiError(retryErrMsg, retryRes.status, retryData);
          }
        }
      } catch (e) {
        // Ignore refresh errors and throw original 401
      }
    }

    let errMsg = data?.error || data?.message || response.statusText;
    if (data?.details && Array.isArray(data.details)) {
      errMsg = data.details.map((d: any) => `${d.path?.join('.') || ''}: ${d.message}`).join(', ');
    }
    throw new ApiError(errMsg, response.status, data);
  }

  return data as T;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

function getHeaders(customHeaders?: HeadersInit, isFormData = false): Record<string, string> {
  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(customHeaders as Record<string, string> || {}),
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Reusable API utility for frontend requests
 */
export const ApiUtils = {
  async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;
    const url = buildUrl(endpoint, params);
    const fetchOptions = {
      ...customConfig,
      method: 'GET',
      headers: getHeaders(customConfig.headers),
    };
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response, url, fetchOptions);
  },

  async post<T = any>(endpoint: string, body?: any, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;
    const url = buildUrl(endpoint, params);
    const isFormData = body instanceof FormData;
    const isString = typeof body === 'string';
    const fetchOptions = {
      ...customConfig,
      method: 'POST',
      headers: getHeaders(customConfig.headers, isFormData),
      body: isFormData || isString ? body : JSON.stringify(body),
    };
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response, url, fetchOptions);
  },

  async put<T = any>(endpoint: string, body?: any, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;
    const url = buildUrl(endpoint, params);
    const isFormData = body instanceof FormData;
    const isString = typeof body === 'string';
    const fetchOptions = {
      ...customConfig,
      method: 'PUT',
      headers: getHeaders(customConfig.headers, isFormData),
      body: isFormData || isString ? body : JSON.stringify(body),
    };
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response, url, fetchOptions);
  },

  async patch<T = any>(endpoint: string, body?: any, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;
    const url = buildUrl(endpoint, params);
    const isFormData = body instanceof FormData;
    const isString = typeof body === 'string';
    const fetchOptions = {
      ...customConfig,
      method: 'PATCH',
      headers: getHeaders(customConfig.headers, isFormData),
      body: isFormData || isString ? body : JSON.stringify(body),
    };
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response, url, fetchOptions);
  },

  async delete<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;
    const url = buildUrl(endpoint, params);
    const fetchOptions = {
      ...customConfig,
      method: 'DELETE',
      headers: getHeaders(customConfig.headers),
    };
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response, url, fetchOptions);
  },
};

/**
 * Utility matching the legacy apiCall signature
 */
export async function apiCall<T = any>(endpoint: string, options: Omit<RequestInit, 'body'> & { body?: any } = {}): Promise<T> {
  const method = options.method || 'GET';

  if (method === 'GET') {
    return ApiUtils.get<T>(endpoint, options);
  } else if (method === 'POST') {
    return ApiUtils.post<T>(endpoint, options.body, options);
  } else if (method === 'PUT') {
    return ApiUtils.put<T>(endpoint, options.body, options);
  } else if (method === 'PATCH') {
    return ApiUtils.patch<T>(endpoint, options.body, options);
  } else if (method === 'DELETE') {
    return ApiUtils.delete<T>(endpoint, options);
  }

  // fallback for any other method
  const url = buildUrl(endpoint);
  const isFormData = options.body instanceof FormData;
  const isString = typeof options.body === 'string';
  const fetchOptions = {
    ...options,
    headers: getHeaders(options.headers, isFormData),
    body: (isFormData || isString || !options.body) ? options.body : JSON.stringify(options.body),
  };
  const response = await fetch(url, fetchOptions as RequestInit);
  return handleResponse<T>(response, url, fetchOptions);
}
