import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

// Generic API hook for CRUD operations
export function useApiData<T>(
  apiEndpoint: {
    getAll: () => Promise<{
      data?: T[];
      items?: T[];
      invoices?: T[];
      jobs?: T[];
      clients?: T[];
      services?: T[];
      expenses?: T[];
      suppliers?: T[];
      total: number;
    }>;
  },
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiEndpoint.getAll();

      // Handle different response formats
      const items =
        result.data ||
        result.items ||
        result.invoices ||
        result.jobs ||
        result.clients ||
        result.services ||
        result.expenses ||
        result.suppliers ||
        [];
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}

// Invoices hook
export function useInvoices() {
  const {
    data: invoices,
    loading,
    error,
    refetch,
    setData: setInvoices,
  } = useApiData(api.invoices);

  const createInvoice = async (invoiceData: any) => {
    try {
      const newInvoice = await api.invoices.create(invoiceData);
      setInvoices((prev) => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      throw err;
    }
  };

  const updateInvoice = async (id: string, invoiceData: any) => {
    try {
      const updatedInvoice = await api.invoices.update(id, invoiceData);
      setInvoices((prev: any[]) =>
        prev.map((invoice: any) =>
          invoice.id === id ? updatedInvoice : invoice
        )
      );
      return updatedInvoice;
    } catch (err) {
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await api.invoices.delete(id);
      setInvoices((prev: any[]) =>
        prev.filter((invoice: any) => invoice.id !== id)
      );
    } catch (err) {
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    refetch,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}

// Jobs hook with filtering
export function useJobs(filters?: {
  type?: string;
  status?: string;
  clientId?: string;
}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.jobs.getAll(filters);
      setJobs(result.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Jobs API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.status, filters?.clientId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async (jobData: any) => {
    try {
      const newJob = await api.jobs.create(jobData);
      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    } catch (err) {
      throw err;
    }
  };

  const updateJob = async (id: string, jobData: any) => {
    try {
      const updatedJob = await api.jobs.update(id, jobData);
      setJobs((prev) => prev.map((job) => (job.id === id ? updatedJob : job)));
      return updatedJob;
    } catch (err) {
      throw err;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await api.jobs.delete(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    createJob,
    updateJob,
    deleteJob,
  };
}

// Clients hook
export function useClients() {
  const {
    data: clients,
    loading,
    error,
    refetch,
    setData: setClients,
  } = useApiData(api.clients);

  const createClient = async (clientData: any) => {
    try {
      const newClient = await api.clients.create(clientData);
      setClients((prev) => [newClient, ...prev]);
      return newClient;
    } catch (err) {
      throw err;
    }
  };

  const updateClient = async (id: string, clientData: any) => {
    try {
      const updatedClient = await api.clients.update(id, clientData);
      setClients((prev: any[]) =>
        prev.map((client: any) => (client.id === id ? updatedClient : client))
      );
      return updatedClient;
    } catch (err) {
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await api.clients.delete(id);
      setClients((prev: any[]) =>
        prev.filter((client: any) => client.id !== id)
      );
    } catch (err) {
      throw err;
    }
  };

  return {
    clients,
    loading,
    error,
    refetch,
    createClient,
    updateClient,
    deleteClient,
  };
}

// Services hook
export function useServices() {
  const {
    data: services,
    loading,
    error,
    refetch,
    setData: setServices,
  } = useApiData(api.services);

  const createService = async (serviceData: any) => {
    try {
      const newService = await api.services.create(serviceData);
      setServices((prev) => [newService, ...prev]);
      return newService;
    } catch (err) {
      throw err;
    }
  };

  const updateService = async (id: string, serviceData: any) => {
    try {
      const updatedService = await api.services.update(id, serviceData);
      setServices((prev: any[]) =>
        prev.map((service: any) =>
          service.id === id ? updatedService : service
        )
      );
      return updatedService;
    } catch (err) {
      throw err;
    }
  };

  const deleteService = async (id: string) => {
    try {
      await api.services.delete(id);
      setServices((prev: any[]) =>
        prev.filter((service: any) => service.id !== id)
      );
    } catch (err) {
      throw err;
    }
  };

  return {
    services,
    loading,
    error,
    refetch,
    createService,
    updateService,
    deleteService,
  };
}

// Expenses hook
export function useExpenses() {
  const {
    data: expenses,
    loading,
    error,
    refetch,
    setData: setExpenses,
  } = useApiData(api.expenses);

  const createExpense = async (expenseData: any) => {
    try {
      const newExpense = await api.expenses.create(expenseData);
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      throw err;
    }
  };

  const updateExpense = async (id: string, expenseData: any) => {
    try {
      const updatedExpense = await api.expenses.update(id, expenseData);
      setExpenses((prev: any[]) =>
        prev.map((expense: any) =>
          expense.id === id ? updatedExpense : expense
        )
      );
      return updatedExpense;
    } catch (err) {
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await api.expenses.delete(id);
      setExpenses((prev: any[]) =>
        prev.filter((expense: any) => expense.id !== id)
      );
    } catch (err) {
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    refetch,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}

// Single item hooks
export function useInvoice(id: string) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await api.invoices.getById(id);
        setInvoice(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch invoice'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  return { invoice, loading, error };
}

export function useJob(id: string) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await api.jobs.getById(id);
        setJob(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  return { job, loading, error };
}

export function useClient(id: string) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await api.clients.getById(id);
        setClient(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  return { client, loading, error };
}

export function useService(id: string) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await api.services.getById(id);
        setService(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch service'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  return { service, loading, error };
}

// Suppliers hook
export function useSuppliers() {
  const {
    data: suppliers,
    loading,
    error,
    refetch,
    setData: setSuppliers,
  } = useApiData(api.suppliers);

  const createSupplier = async (supplierData: any) => {
    try {
      const newSupplier = await api.suppliers.create(supplierData);
      setSuppliers((prev) => [newSupplier, ...prev]);
      return newSupplier;
    } catch (err) {
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplierData: any) => {
    try {
      const updatedSupplier = await api.suppliers.update(id, supplierData);
      setSuppliers((prev: any[]) =>
        prev.map((supplier: any) =>
          supplier.id === id ? updatedSupplier : supplier
        )
      );
      return updatedSupplier;
    } catch (err) {
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await api.suppliers.delete(id);
      setSuppliers((prev: any[]) =>
        prev.filter((supplier: any) => supplier.id !== id)
      );
    } catch (err) {
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    refetch,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

export function useSupplier(id: string) {
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await api.suppliers.getById(id);
        setSupplier(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch supplier'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  return { supplier, loading, error };
}

// Job expenses hook
export function useJobExpenses(jobId: string) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobExpenses = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await api.jobs.expenses.getAll(jobId);
      setExpenses(result.expenses || []);
      setTotalExpenses(result.totalExpenses || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job expenses');
      console.error('Job Expenses API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobExpenses();
  }, [fetchJobExpenses]);

  const createJobExpense = async (expenseData: any) => {
    try {
      const result = await api.jobs.expenses.create(jobId, expenseData);
      setExpenses((prev) => [result.expense, ...prev]);
      setTotalExpenses(result.totalExpenses || 0);
      return result.expense;
    } catch (err) {
      throw err;
    }
  };

  return {
    expenses,
    totalExpenses,
    loading,
    error,
    refetch: fetchJobExpenses,
    createJobExpense,
  };
}
