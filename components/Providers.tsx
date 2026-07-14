"use client";

import * as React from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AuthAPI } from "@/lib/api";

type GlobalModalContextType = {
  showSessionExpired: () => void;
};

const GlobalModalContext = React.createContext<GlobalModalContextType | undefined>(undefined);

export const useGlobalModals = () => {
  const context = React.useContext(GlobalModalContext);
  if (!context) throw new Error("useGlobalModals must be used within Providers");
  return context;
};

function SessionExpirationModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: session, update } = useSession();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleContinue = async () => {
    if (!session?.refreshToken) {
      window.location.href = "/login";
      return;
    }
    
    setIsRefreshing(true);
    try {
      const res = await AuthAPI.refreshToken({ refreshToken: session.refreshToken as string });
      if (res.data?.accessToken) {
        // Update NextAuth session with the new token
        await update({ accessToken: res.data.accessToken });
        onOpenChange(false);
      }
    } catch (err) {
      // Refresh failed, force logout
      window.location.href = "/login";
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <ModalTitle>Session Expired</ModalTitle>
          <ModalDescription>
            Your authentication session has expired. Would you like to continue your session?
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={handleLogout} disabled={isRefreshing}>
            Log Out
          </Button>
          <Button onClick={handleContinue} isLoading={isRefreshing}>
            Continue Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

import { VendorProvider } from "./VendorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client (outside component to avoid recreation on re-renders, unless we need SSR specific handling.
// For Next.js App Router, it's safer to create it inside the component with useState).
export function Providers({ children, ...props }: ThemeProviderProps) {
  const [isSessionModalOpen, setIsSessionModalOpen] = React.useState(false);
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  const showSessionExpired = React.useCallback(() => {
    setIsSessionModalOpen(true);
  }, []);

  // Make showSessionExpired globally accessible to non-React functions via window
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).showSessionExpired = showSessionExpired;
    }
  }, [showSessionExpired]);

  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <VendorProvider>
          <GlobalModalContext.Provider value={{ showSessionExpired }}>
            <NextThemesProvider {...props}>
              {children}
              <SessionExpirationModal isOpen={isSessionModalOpen} onOpenChange={setIsSessionModalOpen} />
            </NextThemesProvider>
          </GlobalModalContext.Provider>
        </VendorProvider>
      </QueryClientProvider>
    </NextAuthSessionProvider>
  );
}
