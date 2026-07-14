"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { VendorAPI } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

interface VendorContextType {
  activeVendorId: string | null;
  setActiveVendorId: (id: string) => void;
  activeVendor: any | null;
  vendors: any[];
  isLoading: boolean;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [activeVendorId, setActiveVendorIdState] = useState<string | null>(null);

  const { data: vendorsResponse, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => VendorAPI.myVendors(),
    enabled: status === "authenticated",
  });

  const vendors = vendorsResponse?.data || session?.vendors || [];

  // Initialize active vendor from localStorage or default to the first vendor
  useEffect(() => {
    if (!vendors || vendors.length === 0) {
      setActiveVendorIdState(null);
      return;
    }

    const storedId = localStorage.getItem("activeVendorId");
    
    // Check if storedId is still valid for this user
    const isValidStoredId = storedId && vendors.some((v: any) => (v.vendorId || v.id) === storedId);

    if (isValidStoredId) {
      setActiveVendorIdState(storedId);
    } else {
      // Default to the first vendor
      const firstVendor = vendors[0];
      const firstVendorId = firstVendor.vendorId || firstVendor.id;
      setActiveVendorIdState(firstVendorId);
      localStorage.setItem("activeVendorId", firstVendorId);
    }
  }, [vendors]);

  const setActiveVendorId = (id: string) => {
    setActiveVendorIdState(id);
    localStorage.setItem("activeVendorId", id);
  };

  const activeVendor = vendors.find((v: any) => (v.vendorId || v.id) === activeVendorId) || null;

  return (
    <VendorContext.Provider value={{ activeVendorId, setActiveVendorId, activeVendor, vendors, isLoading }}>
      {children}
    </VendorContext.Provider>
  );
}

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error("useVendor must be used within a VendorProvider");
  }
  return context;
};
