// General application types

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  role: 'admin' | 'finance' | 'operations' | 'client';
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export logistics types for convenience
export * from './logistics';
