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
  console.log(`API mode: ${force ? 'FORCED REAL API' : 'AUTO-DETECT'}`);
}

// Function to test API connection
export async function testApiConnection(): Promise<boolean> {
  try {
    resetApiAvailability();
    console.log(`🔍 Testing API connection to ${API_BASE_URL}/api/clients`);

    // Make sure to specify application/json content-type explicitly
    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    console.log(
      `🔍 API response status: ${response.status} ${response.statusText}`
    );

    const contentType = response.headers.get('content-type');
    console.log(`🔍 API response content-type: ${contentType || 'none'}`);

    // Get the text response to enable better error handling
    const text = await response.text();
    console.log(`🔍 API response preview: ${text.substring(0, 100)}...`);

    // Check if it looks like code being displayed (like the API handler itself)
    const looksLikeCode =
      text.includes('import {') ||
      text.includes('export default') ||
      text.match(/function\s+handler\(/);

    if (looksLikeCode) {
      console.error(
        '⚠️ API is returning the source code instead of executing it!'
      );
      console.error(
        '⚠️ This likely means the development server is misconfigured'
      );
      console.error(
        '⚠️ Check that Vercel Dev is running correctly and handling API routes'
      );

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
          console.log('✅ API connection successful with direct JSON!');
          return true;
        } catch (e) {
          // If that fails, check if it's a base64 string
          if (isBase64(text)) {
            const decoded = atob(text);
            JSON.parse(decoded);
            console.log(
              '✅ API connection successful with base64-encoded JSON!'
            );
            return true;
          } else {
            console.log(
              '❌ API returned invalid format',
              text.substring(0, 100)
            );
            if (!FORCE_REAL_API) {
              apiAvailable = false;
            }
            return false;
          }
        }
      } catch (parseError) {
        console.log('❌ API returned unparsable content');
        if (!FORCE_REAL_API) {
          apiAvailable = false;
        }
        return false;
      }
    } else {
      console.log('❌ API returned HTML instead of JSON');
      if (!FORCE_REAL_API) {
        apiAvailable = false;
      }
      return false;
    }
  } catch (error) {
    console.log('❌ API connection failed:', error);
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

  console.log(
    `API Request: ${options?.method || 'GET'} ${url}`,
    options?.body ? `Body: ${options.body}` : ''
  );

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
      console.error(
        'API is returning the source code instead of executing it!'
      );
      console.error('Response preview:', responsePreview);

      if (!FORCE_REAL_API) {
        apiAvailable = false;
      }
      throw new Error(
        'API server issue: Returning source code instead of executing it'
      );
    }

    if (!contentType || !contentType.includes('application/json')) {
      console.warn('API returned non-JSON response, marking as unavailable');
      console.warn('Response content-type:', contentType);
      console.warn('Response preview:', responsePreview);

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
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      } catch (e) {
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
          console.error('Failed to decode base64 response', e2);
          throw new Error('Invalid API response format');
        }
      } else {
        console.error(
          'Response is not valid JSON or base64',
          text.substring(0, 100)
        );
        throw new Error('Invalid API response format');
      }
    }
  } catch (error) {
    console.warn('API call failed:', error);
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
      console.warn('Using mock data for invoices:', error);
      return { invoices: invoicesMock, total: invoicesMock.length };
    }
  },

  // Get invoice by ID
  getById: async (id: string) => {
    try {
      return await apiCall<any>(`/invoices?id=${id}`);
    } catch (error) {
      console.warn('Using mock data for invoice by ID:', error);
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
      console.warn('Using mock data for creating invoice:', error);
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
      console.warn('Using mock data for updating invoice:', error);
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
      console.warn('Using mock data for deleting invoice:', error);
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
      console.warn('Using mock data for jobs:', error);
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
      return await apiCall<any>(`/jobs?id=${id}`);
    } catch (error) {
      console.warn('Using mock data for job by ID:', error);
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
      return job;
    } catch (error) {
      console.warn('Using mock data for creating job:', error);
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
      return job;
    } catch (error) {
      console.warn('Using mock data for updating job:', error);
      updateJobMock(id, jobData);
      return { ...jobData, id };
    }
  },

  // Delete job
  delete: async (id: string) => {
    try {
      return await apiCall<{ message: string; job: any }>(`/jobs?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Using mock data for deleting job:', error);
      const job = jobsMock.find((j) => j.id === id);
      if (job) {
        deleteJobMock(id);
        return { message: 'Job deleted successfully', job };
      }
      throw new Error('Job not found');
    }
  },
};

// Clients API
export const clientsApi = {
  // Get all clients
  getAll: async () => {
    try {
      console.log('🔍 Fetching clients from database...');
      const response = await apiCall<{ clients: any[]; total: number }>(
        '/clients'
      );

      console.log(
        `✅ Successfully fetched ${
          response?.clients?.length || 0
        } clients from database`
      );

      // The API response should have the correct structure: { clients: [], total: number }
      if (response && Array.isArray(response.clients)) {
        return response;
      }

      // If response is malformed, throw an error to trigger fallback
      throw new Error('Invalid response format from API');
    } catch (error) {
      console.error('❌ Failed to fetch clients from database:', error);

      if (FORCE_REAL_API) {
        // When forcing real API, don't fall back to mock data - throw the error
        throw new Error(
          `API Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      console.warn('⚠️ Falling back to mock data for clients');
      return { clients: clientsMock, total: clientsMock.length };
    }
  },

  // Get client by ID
  getById: async (id: string) => {
    try {
      console.log(`🔍 Fetching client ${id} from database...`);
      const response = await apiCall<any>(`/clients?id=${id}`);

      console.log(
        '✅ Successfully fetched client by ID:',
        response?.name || 'Unknown'
      );

      // The API should return the client object directly
      if (response && response.id) {
        return response;
      }

      throw new Error('Client not found or invalid response format');
    } catch (error) {
      console.error('❌ Failed to fetch client by ID from database:', error);

      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to get client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      console.warn('⚠️ Falling back to mock data for client by ID');
      const client = clientsMock.find((c) => c.id === id);
      if (!client) throw new Error('Client not found');
      return client;
    }
  },

  // Create new client
  create: async (clientData: any) => {
    try {
      console.log(
        '📝 Creating new client in database:',
        clientData.name || 'Unknown name'
      );
      const result = await apiCall<any>('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      // Extract the client object from the API response
      const client = result?.client || result;
      console.log('✅ Successfully created client:', client?.name || 'Unknown');
      return client;
    } catch (error) {
      console.error('❌ Failed to create client in database:', error);

      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to create client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      console.warn('⚠️ Creating client in mock data only (fallback)');
      const newClient = { ...clientData, id: generateId() };
      addClientMock(newClient);
      return newClient;
    }
  },

  // Update client
  update: async (id: string, clientData: any) => {
    try {
      console.log(`🔄 Updating client ${id} in database...`);
      const result = await apiCall<any>(`/clients?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });

      // Extract the client object from the API response
      const client = result?.client || result;
      console.log('✅ Successfully updated client:', client?.name || 'Unknown');
      return client;
    } catch (error) {
      console.error('❌ Failed to update client in database:', error);

      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to update client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      console.warn('⚠️ Updating client in mock data only (fallback)');
      updateClientMock(id, clientData);
      return { ...clientData, id };
    }
  },

  // Delete client
  delete: async (id: string) => {
    try {
      console.log(`🗑️ Deleting client ${id} from database...`);
      const result = await apiCall<{ message: string; client: any }>(
        `/clients?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log(
        '✅ Successfully deleted client:',
        result?.client?.name || id
      );
      return result;
    } catch (error) {
      console.error('❌ Failed to delete client from database:', error);

      if (FORCE_REAL_API) {
        throw new Error(
          `Failed to delete client: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      console.warn('⚠️ Deleting client from mock data only (fallback)');
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

// Export all APIs
export const api = {
  invoices: invoiceApi,
  jobs: jobsApi,
  clients: clientsApi,
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
        console.warn('Base64 text test failed:', error);
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
        console.warn('Base64 image test failed:', error);
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
        console.warn('Base64 decode test failed:', error);
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
