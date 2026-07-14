"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Store, LogOut, Settings, Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { VendorSwitcher } from "@/components/VendorSwitcher";
import { useVendor } from "@/components/VendorContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeVendorId } = useVendor();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading session...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Logout Confirmation Modal */}
      <Modal open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <ModalContent className="sm:max-w-[425px]">
          <ModalHeader>
            <ModalTitle>Sign Out</ModalTitle>
            <ModalDescription>
              Are you sure you want to sign out of your account? You will need to log in again to access the vendor portal.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmLogout}>
              Sign Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">AutoGirl</h1>
            <p className="text-xs text-muted-foreground mt-1">Vendor Portal</p>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Vendor Switcher */}
        <div className="p-4 border-b border-border relative z-[60]">
          <VendorSwitcher />
        </div>

        <div className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-bold text-brand-600">AutoGirl</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setIsLogoutModalOpen(true)}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 shrink-0 items-center justify-end px-8 border-b border-border bg-background/50 backdrop-blur-md gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground relative" title="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-background"></span>
          </Button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 font-medium" 
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
