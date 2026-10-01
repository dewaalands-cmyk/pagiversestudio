"use client";

import { createContext, useContext } from "react";

const AdminSidebarContext = createContext<(() => void) | null>(null);

export function AdminSidebarProvider({
  children,
  onOpen,
}: {
  children: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <AdminSidebarContext.Provider value={onOpen}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}
