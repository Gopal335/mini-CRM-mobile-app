// Mock API service for development and testing
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'admin' as const,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user' as const,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockCustomers = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0101',
    company: 'Acme Corporation',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Tech Solutions Inc',
    email: 'info@techsolutions.com',
    phone: '+1-555-0102',
    company: 'Tech Solutions Inc',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Global Enterprises',
    email: 'hello@globalent.com',
    phone: '+1-555-0103',
    company: 'Global Enterprises',
    createdAt: '2024-01-17T00:00:00.000Z',
    updatedAt: '2024-01-17T00:00:00.000Z',
  },
];

const mockLeads = [
  {
    id: '1',
    title: 'Website Redesign Project',
    description: 'Complete website redesign and development for Acme Corporation\'s new product launch',
    status: 'New' as const,
    value: 25000,
    customerId: '1',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Custom mobile application development for iOS and Android platforms',
    status: 'Contacted' as const,
    value: 50000,
    customerId: '2',
    createdAt: '2024-01-21T00:00:00.000Z',
    updatedAt: '2024-01-22T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Cloud Migration Services',
    description: 'Migration of existing infrastructure to cloud-based solutions',
    status: 'Converted' as const,
    value: 75000,
    customerId: '3',
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'E-commerce Platform',
    description: 'Development of custom e-commerce platform with payment integration',
    status: 'Lost' as const,
    value: 40000,
    customerId: '1',
    createdAt: '2024-01-19T00:00:00.000Z',
    updatedAt: '2024-01-24T00:00:00.000Z',
  },
  {
    id: '5',
    title: 'Data Analytics Dashboard',
    description: 'Custom analytics dashboard with real-time reporting capabilities',
    status: 'New' as const,
    value: 30000,
    customerId: '2',
    createdAt: '2024-01-23T00:00:00.000Z',
    updatedAt: '2024-01-23T00:00:00.000Z',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockAuthAPI = {
  async login(credentials: {email: string; password: string}) {
    await delay(1000);
    
    const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    await AsyncStorage.setItem('authToken', token);

    return {
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    };
  },

  async register(userData: {name: string; email: string; password: string}) {
    await delay(1000);

    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      ...userData,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    const token = `mock-token-${newUser.id}-${Date.now()}`;
    await AsyncStorage.setItem('authToken', token);

    return {
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    };
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
  },
};

export const mockCustomerAPI = {
  async getCustomers(params: {page?: number; search?: string} = {}) {
    await delay(800);
    
    let filteredCustomers = [...mockCustomers];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }

    const page = params.page || 1;
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    return {
      data: paginatedCustomers,
      totalCount: filteredCustomers.length,
      currentPage: page,
      totalPages: Math.ceil(filteredCustomers.length / pageSize),
    };
  },

  async getCustomerById(id: string) {
    await delay(500);
    
    const customer = mockCustomers.find(c => c.id === id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  },

  async createCustomer(customerData: any) {
    await delay(1000);
    
    const newCustomer = {
      id: String(mockCustomers.length + 1),
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCustomers.push(newCustomer);
    return newCustomer;
  },

  async updateCustomer(id: string, data: any) {
    await delay(1000);
    
    const customerIndex = mockCustomers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockCustomers[customerIndex];
  },

  async deleteCustomer(id: string) {
    await delay(800);
    
    const customerIndex = mockCustomers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    mockCustomers.splice(customerIndex, 1);
    
    // Also delete associated leads
    const leadIndices = mockLeads
      .map((lead, index) => lead.customerId === id ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    leadIndices.forEach(index => mockLeads.splice(index, 1));
  },
};

export const mockLeadAPI = {
  async getLeads(params: {page?: number; status?: string; customerId?: string} = {}) {
    await delay(800);
    
    let filteredLeads = [...mockLeads];
    
    if (params.status && params.status !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.status === params.status);
    }
    
    if (params.customerId) {
      filteredLeads = filteredLeads.filter(lead => lead.customerId === params.customerId);
    }

    const page = params.page || 1;
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    return {
      data: paginatedLeads,
      totalCount: filteredLeads.length,
      currentPage: page,
      totalPages: Math.ceil(filteredLeads.length / pageSize),
    };
  },

  async getLeadById(id: string) {
    await delay(500);
    
    const lead = mockLeads.find(l => l.id === id);
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    return lead;
  },

  async getLeadsByCustomer(customerId: string) {
    await delay(500);
    
    return mockLeads.filter(lead => lead.customerId === customerId);
  },

  async createLead(leadData: any) {
    await delay(1000);
    
    const newLead = {
      id: String(mockLeads.length + 1),
      ...leadData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockLeads.push(newLead);
    return newLead;
  },

  async updateLead(id: string, data: any) {
    await delay(1000);
    
    const leadIndex = mockLeads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }

    mockLeads[leadIndex] = {
      ...mockLeads[leadIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockLeads[leadIndex];
  },

  async deleteLead(id: string) {
    await delay(800);
    
    const leadIndex = mockLeads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }

    mockLeads.splice(leadIndex, 1);
  },
};
