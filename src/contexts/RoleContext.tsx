import React, { createContext, useContext, useState } from 'react';

type Role = 'admin' | 'finance' | 'operations' | 'client';

const RoleContext = createContext({
  role: 'admin' as Role,
  setRole: (r: Role) => {},
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>('admin');
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
