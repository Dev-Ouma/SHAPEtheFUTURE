"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminSidebarSections } from '@/lib/admin-navigation';

interface AdminMenuContextType {
  menuSections: any[];
  loading: boolean;
  refreshMenu: () => Promise<void>;
}

const AdminMenuContext = createContext<AdminMenuContextType | undefined>(undefined);

export function AdminMenuProvider({ children }: { children: React.ReactNode }) {
  const [menuSections, setMenuSections] = useState<any[]>(() => getAdminSidebarSections());
  const [loading, setLoading] = useState(false);

  const fetchMenu = async () => {
    setMenuSections(getAdminSidebarSections());
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <AdminMenuContext.Provider value={{ menuSections, loading, refreshMenu: fetchMenu }}>
      {children}
    </AdminMenuContext.Provider>
  );
}

export function useAdminMenu() {
  const context = useContext(AdminMenuContext);
  if (context === undefined) {
    throw new Error('useAdminMenu must be used within an AdminMenuProvider');
  }
  return context;
}
