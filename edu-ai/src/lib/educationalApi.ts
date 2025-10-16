// lib/educationalApi.ts
import type { TeachRequest, TeachResponse } from '@/types/educational-types';

const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_PREFIX = '/v1';

class EducationalAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async teach(
    query: string, 
    userId: string, 
    allowDirectCode: boolean = false, 
    historySummary?: string
  ): Promise<TeachResponse> {
    const payload: TeachRequest = {
      query,
      user_id: userId,
      allow_direct_code: allowDirectCode
    };

    if (historySummary) {
      payload.history_summary = historySummary;
    }

    return this.request<TeachResponse>(`${API_PREFIX}/teach`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/');
  }

  // Optional: Add method to get user progress if your backend supports it
  async getUserProgress(userId: string): Promise<any> {
    return this.request<any>(`${API_PREFIX}/users/${userId}/progress`);
  }

  // Optional: Add method to clear user history if your backend supports it
  async clearUserHistory(userId: string): Promise<any> {
    return this.request<any>(`${API_PREFIX}/users/${userId}/history`, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
export const educationalApi = new EducationalAPI(
  import.meta.env.REACT_APP_BACKEND_API_KEY || ''
);

export default EducationalAPI;