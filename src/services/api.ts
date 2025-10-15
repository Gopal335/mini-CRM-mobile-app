import AsyncStorage from '@react-native-async-storage/async-storage';
import {mockAuthAPI, mockCustomerAPI, mockLeadAPI} from './mockApi';

const BASE_URL = 'http://localhost:3001';
const USE_MOCK_API = true; // Set to false to use real API

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth API
  async login(credentials: {email: string; password: string}) {
    if (USE_MOCK_API) {
      return mockAuthAPI.login(credentials);
    }
    return this.makeRequest<ApiResponse<{user: any; token: string}>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {name: string; email: string; password: string}) {
    if (USE_MOCK_API) {
      return mockAuthAPI.register(userData);
    }
    return this.makeRequest<ApiResponse<{user: any; token: string}>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    if (USE_MOCK_API) {
      return mockAuthAPI.logout();
    }
    await AsyncStorage.removeItem('authToken');
  }
}

// Customer API
class CustomerAPI {
  private api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  async getCustomers(params: {page?: number; search?: string} = {}) {
    if (USE_MOCK_API) {
      return mockCustomerAPI.getCustomers(params);
    }
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);

    return this.api.makeRequest<PaginatedResponse<any>>(`/customers?${queryParams}`);
  }

  async getCustomerById(id: string) {
    if (USE_MOCK_API) {
      return mockCustomerAPI.getCustomerById(id);
    }
    return this.api.makeRequest<any>(`/customers/${id}`);
  }

  async createCustomer(customerData: any) {
    if (USE_MOCK_API) {
      return mockCustomerAPI.createCustomer(customerData);
    }
    return this.api.makeRequest<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: string, data: any) {
    if (USE_MOCK_API) {
      return mockCustomerAPI.updateCustomer(id, data);
    }
    return this.api.makeRequest<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string) {
    if (USE_MOCK_API) {
      return mockCustomerAPI.deleteCustomer(id);
    }
    return this.api.makeRequest<void>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }
}

// Lead API
class LeadAPI {
  private api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  async getLeads(params: {page?: number; status?: string; customerId?: string} = {}) {
    if (USE_MOCK_API) {
      return mockLeadAPI.getLeads(params);
    }
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.customerId) queryParams.append('customerId', params.customerId);

    return this.api.makeRequest<PaginatedResponse<any>>(`/leads?${queryParams}`);
  }

  async getLeadById(id: string) {
    if (USE_MOCK_API) {
      return mockLeadAPI.getLeadById(id);
    }
    return this.api.makeRequest<any>(`/leads/${id}`);
  }

  async getLeadsByCustomer(customerId: string) {
    if (USE_MOCK_API) {
      return mockLeadAPI.getLeadsByCustomer(customerId);
    }
    return this.api.makeRequest<any[]>(`/leads?customerId=${customerId}`);
  }

  async createLead(leadData: any) {
    if (USE_MOCK_API) {
      return mockLeadAPI.createLead(leadData);
    }
    return this.api.makeRequest<any>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(id: string, data: any) {
    if (USE_MOCK_API) {
      return mockLeadAPI.updateLead(id, data);
    }
    return this.api.makeRequest<any>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string) {
    if (USE_MOCK_API) {
      return mockLeadAPI.deleteLead(id);
    }
    return this.api.makeRequest<void>(`/leads/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create API instances
const apiService = new ApiService();
export const authAPI = apiService;
export const customerAPI = new CustomerAPI(apiService);
export const leadAPI = new LeadAPI(apiService);
