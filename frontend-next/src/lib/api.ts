type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
};

class ApiError extends Error {
  constructor(message: string, public status: number, public data: any) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiClient = async <T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> => {
  const { method = 'GET', headers = {}, body } = options;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
  const url = `${apiUrl}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      ...headers,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'API request failed', response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // ネットワークエラーなど、fetch自体が失敗した場合
    throw new Error(error instanceof Error ? error.message : 'An unknown network error occurred');
  }
};

export { apiClient, ApiError };
