// API service layer for backend integration
import {
  clientsMock,
  addClient as addClientMock,
  updateClient as updateClientMock,
  deleteClient as deleteClientMock,
  jobsMock,
  addJob as addJobMock,
  updateJob as updateJobMock,
  deleteJob as deleteJobMock,
  invoicesMock,
  addInvoice as addInvoiceMock,
  updateInvoice as updateInvoiceMock,
  deleteInvoice as deleteInvoiceMock,
  servicesMock,
  addService as addServiceMock,
  updateService as updateServiceMock,
  deleteService as deleteServiceMock,
  expensesMock,
  addExpense as addExpenseMock,
  updateExpense as updateExpenseMock,
  deleteExpense as deleteExpenseMock,
  usersMock,
  addUser as addUserMock,
  updateUser as updateUserMock,
  deleteUser as deleteUserMock,
} from './mockData';

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://aal-front-end.vercel.app' // Production Vercel URL
    : 'http://localhost:3000'; // For local development API server

// Flag to track if API is available
let apiAvailable = true;

// Set to true to always use real API regardless of availability tests
let FORCE_REAL_API = true; // Always use real API, no fallback to mock data

// Function to check if we're using fallback mode
export function isUsingFallback(): boolean {
  return !apiAvailable && !FORCE_REAL_API;
}

// Function to reset API availability (useful for retrying)
export function resetApiAvailability(): void {
  apiAvailable = true;
}

// Function to force using real API
export function forceRealApi(force: boolean = true): void {
  FORCE_REAL_API = force;
}

// Function to test API connection
export async function testApiConnection(): Promise<boolean> {
  try {
    resetApiAvailability();

    // Make sure to specify application/json content-type explicitly
    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');

    // Get the text response to enable better error handling
    const text = await response.text();

    // Check if it looks like code being displayed (like the API handler itself)
    const looksLikeCode =
      text.includes('import {') ||
      text.includes('export default') ||
      text.match(/function\s+handler\(/);

    if (looksLikeCode) {
      if (!FORCE_REAL_API) {
        apiAvailable = false;
      }
      return false;
    }

    if (contentType && contentType.includes('application/json')) {
      // Test if we can parse the response (either JSON or base64-encoded JSON)
      try {
        try {
          // First try to parse it as regular JSON
          JSON.parse(text);
          return true;
        } catch (e) {
          // If that fails, check if it's a base64 string
          if (isBase64(text)) {
            const decoded = atob(text);
            JSON.parse(decoded);
            return true;
          } else {
            if (!FORCE_REAL_API) {
              apiAvailable = false;
            }
            return false;
          }
        }
      } catch (parseError) {
        if (!FORCE_REAL_API) {
          apiAvailable = false;
        }
        return false;
      }
    } else {
      if (!FORCE_REAL_API) {
        apiAvailable = false;
      }
      return false;
    }
  } catch (error) {
    if (!FORCE_REAL_API) {
      apiAvailable = false;
    }
    return false;
  }
}

// Generic API call helper with fallback to mock data
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // If we already know API is not available and not forcing real API, skip the call
  if (!apiAvailable && !FORCE_REAL_API) {
    throw new Error('API not available - using fallback');
  }

  const url = `${API_BASE_URL}/api${endpoint}`;

  // Ensure headers contain content-type and accept for JSON
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    // Add credentials to ensure cookies are sent
    credentials: 'include',
  };

  // Merge the options and log the request
  const mergedOptions = { ...defaultOptions, ...options };
  // Ensure headers are properly merged
  mergedOptions.headers = {
    ...defaultOptions.headers,
    ...(options?.headers || {}),
  };

  try {
    const response = await fetch(url, mergedOptions);

    // Get the text response first to enable better error handling
    const text = await response.text();

    // Check if response is HTML (404 page) instead of JSON
    const contentType = response.headers.get('content-type');

    // Save the first 500 characters of the response for debugging
    const responsePreview = text.substring(0, 500);

    // Check if it looks like code being displayed (like the API handler itself)
    const looksLikeCode =
      responsePreview.includes('import {') ||
      responsePreview.includes('export default') ||
      responsePreview.match(/function\s+handler\(/);

    if (looksLikeCode) {
      if (!FORCE_REAL_API) {
        apiAvailable = false;
      }
      throw new Error(
        'API server issue: Returning source code instead of executing it'
      );
    }

    if (!contentType || !contentType.includes('application/json')) {
      if (!FORCE_REAL_API) {
        apiAvailable = false;
      }
      throw new Error(
        `API returned non-JSON response (${contentType || 'unknown type'})`
      );
    }

    if (!response.ok) {
      try {
        const errorData = JSON.parse(text);
        // Include details if available (e.g., for client deletion with existing records)
        let errorMessage =
          errorData.error || `HTTP ${response.status}: ${response.statusText}`;

        if (errorData.details) {
          // Format details in a user-friendly way
          if (typeof errorData.details === 'object') {
            const detailsParts = [];
            if (errorData.details.jobs !== undefined) {
              detailsParts.push(`${errorData.details.jobs} job(s)`);
            }
            if (errorData.details.invoices !== undefined) {
              detailsParts.push(`${errorData.details.invoices} invoice(s)`);
            }
            if (detailsParts.length > 0) {
              errorMessage += ` (${detailsParts.join(', ')})`;
            }
          } else {
            errorMessage += ` - ${errorData.details}`;
          }
        }

        throw new Error(errorMessage);
      } catch (e) {
        // If JSON parsing fails, check if e is already an Error we threw
        if (e instanceof Error && e.message.includes('Cannot delete client')) {
          throw e;
        }
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - Invalid JSON response`
        );
      }
    }

    // We've already read the response body as 'text', so we'll use that directly
    try {
      // First try to parse it as regular JSON
      return JSON.parse(text) as T;
    } catch (e) {
      // If that fails, check if it's a base64 string
      if (isBase64(text)) {
        try {
          const decoded = atob(text);
          return JSON.parse(decoded) as T;
        } catch (e2) {
          throw new Error('Invalid API response format');
        }
      } else {
        throw new Error('Invalid API response format');
      }
    }
  } catch (error) {
    if (!FORCE_REAL_API) {
      apiAvailable = false;
    }
    throw error;
  }
}

// Helper function to check if a string is base64 encoded
function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

// Helper function to convert date strings to Date objects
function convertDatesToObjects(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertDatesToObjects(item));
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        (key === 'createdAt' || key === 'updatedAt' || key.includes('Date')) &&
        typeof value === 'string' &&
        !isNaN(Date.parse(value))
      ) {
        converted[key] = new Date(value);
      } else if (key === 'role' && typeof value === 'string') {
        // Convert role to lowercase for frontend compatibility
        converted[key] = value.toLowerCase();
      } else if (typeof value === 'object') {
        converted[key] = convertDatesToObjects(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  return obj;
}

// Helper to generate IDs for mock data
function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Invoice API
export const invoiceApi = {
  // Get all invoices
  getAll: async () => {
    try {
      return await apiCall<{ invoices: any[]; total: number }>('/invoices');
    } catch (error) {
      return { invoices: invoicesMock, total: invoicesMock.length };
    }
  },

  // Get invoice by ID
  getById: async (id: string) => {
    try {
      return await apiCall<any>(`/invoices?id=${id}`);
    } catch (error) {
      const invoice = invoicesMock.find((i) => i.id === id);
      if (!invoice) throw new Error('Invoice not found');
      return invoice;
    }
  },

  // Create new invoice
  create: async (invoiceData: any) => {
    try {
      const result = await apiCall<any>('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });

      // Extract the invoice object from the API response
      const invoice = result?.invoice || result;
      return invoice;
    } catch (error) {
      const newInvoice = { ...invoiceData, id: generateId() };
      addInvoiceMock(newInvoice);
      return newInvoice;
    }
  },

  // Update invoice
  update: async (id: string, invoiceData: any) => {
    try {
      const result = await apiCall<any>(`/invoices?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(invoiceData),
      });

      // Extract the invoice object from the API response
      const invoice = result?.invoice || result;
      return invoice;
    } catch (error) {
      updateInvoiceMock(id, invoiceData);
      return { ...invoiceData, id };
    }
  },

  // Delete invoice
  delete: async (id: string) => {
    try {
      return await apiCall<{ message: string; invoice: any }>(
        `/invoices?id=${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      const invoice = invoicesMock.find((i) => i.id === id);
      if (invoice) {
        deleteInvoiceMock(id);
        return { message: 'Invoice deleted successfully', invoice };
      }
      throw new Error('Invoice not found');
    }
  },
};

// Jobs API
export const jobsApi = {
  // Get all jobs with optional filters
  getAll: async (filters?: {
    type?: string;
    status?: string;
    clientId?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientId) params.append('clientId', filters.clientId);

      const queryString = params.toString();
      const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';

      return await apiCall<{ jobs: any[]; total: number; filters: any }>(
        endpoint
      );
    } catch (error) {
      let filteredJobs = [...jobsMock];

      // Apply filters to mock data
      if (filters?.type) {
        filteredJobs = filteredJobs.filter(
          (job) => job.jobType === filters.type
        );
      }
      if (filters?.status) {
        filteredJobs = filteredJobs.filter(
          (job) => job.status === filters.status
        );
      }
      if (filters?.clientId) {
        filteredJobs = filteredJobs.filter(
          (job) => job.clientId === filters.clientId
        );
      }

      return {
        jobs: filteredJobs,
        total: filteredJobs.length,
        filters: filters || {},
      };
    }
  },

  // Get job by ID
  getById: async (id: string) => {
    try {
      const response = await apiCall<any>(`/jobs?id=${id}`);
      return convertDatesToObjects(response);
    } catch (error) {
      const job = jobsMock.find((j) => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
    }
  },

  // Create new job
  create: async (jobData: any) => {
    try {
      const result = await apiCall<any>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });

      // Extract the job object from the API response
      const job = result?.job || result;
      return convertDatesToObjects(job);
    } catch (error) {
      const newJob = { ...jobData, id: generateId() };
      addJobMock(newJob);
      return newJob;
    }
  },

  // Update job
  update: async (id: string, jobData: any) => {
    try {
      const result = await apiCall<any>(`/jobs?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });

      // Extract the job object from the API response
      const job = result?.job || result;
      return convertDatesToObjects(job);
    } catch (error) {
      updateJobMock(id, jobData);
      return { ...jobData, id };
    }
  },

  // Delete job
  delete: async (id: string) => {
    try {
      const result = await apiCall<{ message: string; job: any }>(
        `/jobs?id=${id}`,
        {
          method: 'DELETE',
        }
      );
      return {
        ...result,
        job: result?.job ? convertDatesToObjects(result.job) : result?.job,
      };
    } catch (error) {
      const job = jobsMock.find((j) => j.id === id);
      if (job) {
        deleteJobMock(id);
        return { message: 'Job deleted successfully', job };
      }
      throw new Error('Job not found');
    }
  },

  // Job expenses functionality
  expenses: {
    // Get all expenses for a specific job
    getAll: async (jobId: string) => {
      try {
        return await apiCall<{
          job: any;
          expenses: any[];
          totalExpenses: number;
          count: number;
          success: boolean;
        }>(`/jobs/${jobId}/expenses`);
      } catch (error) {
        // Mock fallback: filter expenses by jobId
        const jobExpenses = expensesMock.filter((e) => e.jobId === jobId || e.jobNumber?.includes(jobId.slice(-4)));
        const totalExpenses = jobExpenses.reduce((sum, e) => sum + e.amount, 0);
        return {
          job: { id: jobId },
          expenses: jobExpenses,
          totalExpenses,
          count: jobExpenses.length,
          success: false,
        };
      }
    },

    // Create new expense for a specific job
    create: async (jobId: string, expenseData: any) => {
      try {
        const result = await apiCall<{
          message: string;
          expense: any;
          totalExpenses: number;
          expenseCount: number;
        }>(`/jobs/${jobId}/expenses`, {
          method: 'POST',
          body: JSON.stringify(expenseData),
        });

        return result;
      } catch (error) {
        if (FORCE_REAL_API) {
          throw new Error(
            `Failed to create expense for job: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }

        const newExpense = {
          ...expenseData,
          id: generateId(),
          jobId,
          jobNumber: `JOB-${jobId.slice(-4)}`,
        };
        addExpenseMock(newExpense);
        return {
          message: 'Expense created successfully',
          expense: newExpense,
          totalExpenses: 0,
          expenseCount: 1,
        };
      }
    },
  },
};

// Services API
export const servicesApi = {
  // Get all services
  getAll: async () => {
    try {
      const response = await apiCall<{ services: any[]; total: number }>(
        '/services'
      );

      // The API response should have the correct structure: { services: [], total: number }
      if (response && Array.isArray(response.services)) {
        return response;
      }

      // If response is malformed, throw an error to trigger fallback
      throw new Error('Invalid response format from API');
    } catch (error) {
      if (FORCE_REAL_API) {
        // When forcing real API, don't fall back to mock data - throw the error
        throw new Error(
          `API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      return { services: servicesMock, total: servicesMock.length };
    }
  },

  // Get service by ID
  getById: async (id: string) => {
    try {
      const response = await apiCall<any>(`/services?id=${id}`);

      // The API should return the service object directly
      if (response && response.id) {
        return response;
      }

      throw new Error('Service not found or invalid response format');
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to get service: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const service = servicesMock.find((s) => s.id === id);
      if (!service) throw new Error('Service not found');
      return service;
    }
  },

  // Create new service
  create: async (serviceData: any) => {
    try {
      const result = await apiCall<any>('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });

      // Extract the service object from the API response
      const service = result?.service || result;
      return service;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to create service: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const newService = { ...serviceData, id: generateId() };
      addServiceMock(newService);
      return newService;
    }
  },

  // Update service
  update: async (id: string, serviceData: any) => {
    try {
      const result = await apiCall<any>(`/services?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData),
      });

      // Extract the service object from the API response
      const service = result?.service || result;
      return service;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to update service: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      updateServiceMock(id, serviceData);
      return { ...serviceData, id };
    }
  },

  // Delete service
  delete: async (id: string) => {
    try {
      const result = await apiCall<{ message: string; service: any }>(
        `/services?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      return result;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to delete service: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const service = servicesMock.find((s) => s.id === id);
      if (service) {
        deleteServiceMock(id);
        return { message: 'Service deleted successfully', service };
      }
      throw new Error('Service not found');
    }
  },
};

// Expenses API
export const expensesApi = {
  // Get all expenses
  getAll: async () => {
    try {
      const response = await apiCall<{ expenses: any[]; total: number }>(
        '/expenses'
      );

      // The API response should have the correct structure: { expenses: [], total: number }
      if (response && Array.isArray(response.expenses)) {
        return response;
      }

      // If response is malformed, throw an error to trigger fallback
      throw new Error('Invalid response format from API');
    } catch (error) {
      if (FORCE_REAL_API) {
        // When forcing real API, don't fall back to mock data - throw the error
        throw new Error(
          `API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      return { expenses: expensesMock, total: expensesMock.length };
    }
  },

  // Get expense by ID
  getById: async (id: string) => {
    try {
      const response = await apiCall<any>(`/expenses?id=${id}`);

      // The API should return the expense object directly
      if (response && response.id) {
        return response;
      }

      throw new Error('Expense not found or invalid response format');
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to get expense: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const expense = expensesMock.find((e) => e.id === id);
      if (!expense) throw new Error('Expense not found');
      return expense;
    }
  },

  // Create new expense
  create: async (expenseData: any) => {
    try {
      const result = await apiCall<any>('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });

      // Extract the expense object from the API response
      const expense = result?.expense || result;
      return expense;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to create expense: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const newExpense = { ...expenseData, id: generateId() };
      addExpenseMock(newExpense);
      return newExpense;
    }
  },

  // Update expense
  update: async (id: string, expenseData: any) => {
    try {
      const result = await apiCall<any>(`/expenses?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });

      // Extract the expense object from the API response
      const expense = result?.expense || result;
      return expense;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to update expense: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      updateExpenseMock(id, expenseData);
      return { ...expenseData, id };
    }
  },

  // Delete expense
  delete: async (id: string) => {
    try {
      const result = await apiCall<{ message: string; expense: any }>(
        `/expenses?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      return result;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to delete expense: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const expense = expensesMock.find((e) => e.id === id);
      if (expense) {
        deleteExpenseMock(id);
        return { message: 'Expense deleted successfully', expense };
      }
      throw new Error('Expense not found');
    }
  },
};

// Clients API
export const clientsApi = {
  // Get all clients
  getAll: async () => {
    try {
      const response = await apiCall<{ clients: any[]; total: number }>(
        '/clients'
      );

      // The API response should have the correct structure: { clients: [], total: number }
      if (response && Array.isArray(response.clients)) {
        // Convert date strings to Date objects
        const clientsWithDates = {
          ...response,
          clients: response.clients.map((client) =>
            convertDatesToObjects(client)
          ),
        };
        return clientsWithDates;
      }

      // If response is malformed, throw an error to trigger fallback
      throw new Error('Invalid response format from API');
    } catch (error) {
      if (FORCE_REAL_API) {
        // When forcing real API, don't fall back to mock data - throw the error
        throw new Error(
          `API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      return { clients: clientsMock, total: clientsMock.length };
    }
  },

  // Get client by ID
  getById: async (id: string) => {
    try {
      const response = await apiCall<any>(`/clients?id=${id}`);

      // The API should return the client object directly
      if (response && response.id) {
        return convertDatesToObjects(response);
      }

      throw new Error('Client not found or invalid response format');
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to get client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const client = clientsMock.find((c) => c.id === id);
      if (!client) throw new Error('Client not found');
      return client;
    }
  },

  // Create new client
  create: async (clientData: any) => {
    try {
      const result = await apiCall<any>('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      // Extract the client object from the API response
      const client = result?.client || result;
      return convertDatesToObjects(client);
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to create client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const newClient = { ...clientData, id: generateId() };
      addClientMock(newClient);
      return newClient;
    }
  },

  // Update client
  update: async (id: string, clientData: any) => {
    try {
      const result = await apiCall<any>(`/clients?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });

      // Extract the client object from the API response
      const client = result?.client || result;
      return convertDatesToObjects(client);
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to update client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      updateClientMock(id, clientData);
      return { ...clientData, id };
    }
  },

  // Delete client
  delete: async (id: string) => {
    try {
      const result = await apiCall<{ message: string; client: any }>(
        `/clients?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      return result;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to delete client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const client = clientsMock.find((c) => c.id === id);
      if (client) {
        deleteClientMock(id);
        return { message: 'Client deleted successfully', client };
      }
      throw new Error('Client not found');
    }
  },
};

// Legacy mock data fallback functions for gradual migration
export const legacyApi = {
  // For backward compatibility, keep the hello endpoint
  hello: async (name?: string) => {
    const endpoint = name ? `/hello?name=${name}` : '/hello';
    return apiCall<{ message: string; timestamp: string; method: string }>(
      endpoint
    );
  },
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard analytics data
  getAnalytics: async () => {
    try {
      const response = await apiCall<{
        metrics: {
          totalClients: number;
          totalInvoices: number;
          openInvoices: number;
          activeJobs: number;
          totalRevenue: number;
          totalExpenses: number;
          netRevenue: number;
        };
        recentJobs: any[];
        recentInvoices: any[];
        charts: {
          salesLast7Days: any[];
          salesLast6Months: any[];
          expensesByCategory: any[];
        };
        generatedAt: string;
        success: boolean;
      }>('/dashboard');

      if (response && response.success) {
        return response;
      }

      throw new Error('Invalid response format from dashboard API');
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Dashboard API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      // Return mock data structure if API fails
      return {
        metrics: {
          totalClients: 0,
          totalInvoices: 0,
          openInvoices: 0,
          activeJobs: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          netRevenue: 0,
        },
        recentJobs: [],
        recentInvoices: [],
        charts: {
          salesLast7Days: [],
          salesLast6Months: [],
          expensesByCategory: [],
        },
        generatedAt: new Date().toISOString(),
        success: false,
      };
    }
  },
};

// Suppliers API
export const suppliersApi = {
  // Get all suppliers
  getAll: async () => {
    try {
      const response = await apiCall<{ suppliers: any[]; total: number }>(
        '/suppliers'
      );

      // The API response should have the correct structure: { suppliers: [], total: number }
      if (response && Array.isArray(response.suppliers)) {
        return response;
      }

      // If response is malformed, throw an error to trigger fallback
      throw new Error('Invalid response format from API');
    } catch (error) {
      if (FORCE_REAL_API) {
        // When forcing real API, don't fall back to mock data - throw the error
        throw new Error(
          `API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      // Note: Using empty array since suppliers don't have mock data yet
      return { suppliers: [], total: 0 };
    }
  },

  // Get supplier by ID
  getById: async (id: string) => {
    try {
      const response = await apiCall<any>(`/suppliers?id=${id}`);

      // The API should return the supplier object directly
      if (response && response.id) {
        return response;
      }

      throw new Error('Supplier not found or invalid response format');
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to get supplier: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      throw new Error('Supplier not found');
    }
  },

  // Create new supplier
  create: async (supplierData: any) => {
    try {
      const result = await apiCall<any>('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData),
      });

      // Extract the supplier object from the API response
      const supplier = result?.supplier || result;
      return supplier;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to create supplier: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      throw new Error('Failed to create supplier');
    }
  },

  // Update supplier
  update: async (id: string, supplierData: any) => {
    try {
      const result = await apiCall<any>(`/suppliers?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(supplierData),
      });

      // Extract the supplier object from the API response
      const supplier = result?.supplier || result;
      return supplier;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to update supplier: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      throw new Error('Failed to update supplier');
    }
  },

  // Delete supplier
  delete: async (id: string) => {
    try {
      const result = await apiCall<{ message: string; supplier: any }>(
        `/suppliers?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      return result;
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to delete supplier: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      throw new Error('Failed to delete supplier');
    }
  },
};

// Users API
export const usersApi = {
  // Get all users with optional filters
  getAll: async (filters?: { role?: string; isActive?: boolean }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';

      const response = await apiCall<{
        users: any[];
        total: number;
        filters: any;
      }>(endpoint);

      // The API response should have the correct structure: { users: [], total: number }
      if (response && Array.isArray(response.users)) {
        // Convert date strings to Date objects
        const usersWithDates = {
          ...response,
          users: response.users.map((user) => convertDatesToObjects(user)),
        };
        return usersWithDates;
      }

      // If response is malformed, throw an error to trigger fallback
      throw new Error('Invalid response format from API');
    } catch (error) {
      if (FORCE_REAL_API) {
        // When forcing real API, don't fall back to mock data - throw the error
        throw new Error(
          `API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      // Apply filters to mock data
      let filteredUsers = [...usersMock];
      if (filters?.role) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === filters.role
        );
      }
      if (filters?.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(
          (user) => user.isActive === filters.isActive
        );
      }

      return {
        users: filteredUsers,
        total: filteredUsers.length,
        filters: filters || {},
      };
    }
  },

  // Get user by ID
  getById: async (id: string) => {
    try {
      const response = await apiCall<any>(`/users?id=${id}`);

      // The API should return the user object directly
      if (response && response.id) {
        return convertDatesToObjects(response);
      }

      throw new Error('User not found or invalid response format');
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to get user: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const user = usersMock.find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  // Create new user
  create: async (userData: any) => {
    try {
      const result = await apiCall<any>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Extract the user object from the API response
      const user = result?.user || result;
      return convertDatesToObjects(user);
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to create user: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const newUser = { ...userData, id: generateId() };
      addUserMock(newUser);
      return newUser;
    }
  },

  // Update user
  update: async (id: string, userData: any) => {
    try {
      const result = await apiCall<any>(`/users?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      // Extract the user object from the API response
      const user = result?.user || result;
      return convertDatesToObjects(user);
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to update user: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      updateUserMock(id, userData);
      return { ...userData, id };
    }
  },

  // Delete user
  delete: async (id: string) => {
    try {
      const result = await apiCall<{ message: string; user: any }>(
        `/users?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      return {
        ...result,
        user: result?.user ? convertDatesToObjects(result.user) : result?.user,
      };
    } catch (error) {
      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to delete user: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      const user = usersMock.find((u) => u.id === id);
      if (user) {
        deleteUserMock(id);
        return { message: 'User deleted successfully', user };
      }
      throw new Error('User not found');
    }
  },
};

// Export all APIs
export const api = {
  invoices: invoiceApi,
  jobs: jobsApi,
  clients: clientsApi,
  users: usersApi,
  services: servicesApi,
  expenses: expensesApi,
  suppliers: suppliersApi,
  dashboard: dashboardApi,
  legacy: legacyApi,

  // Base64 testing API
  base64test: {
    // Test the connection to the API
    getText: async () => {
      try {
        return await apiCall<{ base64Data: string; decodedText?: string }>(
          '/base64test/text'
        );
      } catch (error) {
        return {
          base64Data: btoa('This is a test string encoded in base64'),
          decodedText: 'This is a test string encoded in base64',
        };
      }
    },

    // Get a base64 encoded image
    getImage: async () => {
      try {
        return await apiCall<{ base64Data: string }>('/base64test/image');
      } catch (error) {
        // Return a small base64 encoded 1x1 pixel image
        return {
          base64Data:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        };
      }
    },

    // Decode a base64 string
    decode: async (data: { base64string: string }) => {
      try {
        return await apiCall<{ decodedText: string }>('/base64test/decode', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (error) {
        try {
          return { decodedText: atob(data.base64string) };
        } catch (e) {
          return { decodedText: 'Invalid base64 string' };
        }
      }
    },
  },

  // Test API connection helper
  testConnection: async () => {
    const success = await testApiConnection();
    return { available: success, timestamp: new Date().toISOString() };
  },
};

export default api;
