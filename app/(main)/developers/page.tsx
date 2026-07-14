"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VendorAPI } from "@/lib/api";
import { useVendor } from "@/components/VendorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { 
  Terminal, Key, ShieldAlert, Plus, Copy, AlertTriangle, CheckCircle2, 
  Trash2, Loader2, Building2, BookOpen, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function DevelopersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeVendorId, activeVendor, isLoading: isVendorContextLoading } = useVendor();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  
  // State for the one-time raw key display
  const [newRawKey, setNewRawKey] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionVariant?: "default" | "destructive";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "",
    actionVariant: "default",
    onConfirm: () => {},
  });

  const openConfirm = (title: string, description: string, actionLabel: string, actionVariant: "default" | "destructive", onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, description, actionLabel, actionVariant, onConfirm });
  };

  // Queries
  const { data: keysRes, isLoading: isKeysLoading } = useQuery({
    queryKey: ["api-keys", activeVendorId],
    queryFn: () => VendorAPI.getApiKeys(activeVendorId!),
    enabled: !!activeVendorId && activeVendor?.kycStatus === "APPROVED",
  });

  const apiKeys = keysRes?.data || [];

  // Mutations
  const generateMutation = useMutation({
    mutationFn: (name: string) => VendorAPI.generateApiKey(activeVendorId!, { name }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", activeVendorId] });
      setIsGenerateModalOpen(false);
      setKeyName("");
      // Display the raw key exactly once
      if (res.data?.rawApiKey) {
        setNewRawKey(res.data.rawApiKey);
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to generate API Key."),
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => VendorAPI.revokeApiKey(activeVendorId!, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", activeVendorId] });
      toast.success("API Key successfully revoked.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to revoke API Key."),
  });

  // Handlers
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast.error("Please provide a name for the API Key.");
      return;
    }
    generateMutation.mutate(keyName);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("API Key copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy. Please manually copy the key.");
    }
  };

  if (isVendorContextLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!activeVendorId) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Active Vendor</h2>
        <p className="text-muted-foreground mt-2 mb-6">Select a vendor workspace to manage API Keys.</p>
      </div>
    );
  }

  // KYC Guard
  if (activeVendor?.kycStatus !== "APPROVED") {
    return (
      <div className="max-w-3xl mx-auto mt-10 animate-in zoom-in-95 fade-in duration-500">
        <Card className="border-border/60 overflow-hidden shadow-lg">
          <div className="h-2 w-full bg-brand-500" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-brand-100 dark:bg-brand-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <CardTitle className="text-2xl text-foreground">Verification Required</CardTitle>
            <CardDescription className="text-base mt-2">
              For security reasons, API Keys can only be generated by vendors with an Approved KYC status.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6 pb-8">
            <p className="text-muted-foreground mb-6">
              Current Status: <span className="font-semibold text-foreground">{activeVendor?.kycStatus || "NOT_SUBMITTED"}</span>
            </p>
            <Button onClick={() => router.push("/dashboard")} variant="default" className="shadow-md hover:shadow-lg">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage API keys and integrate AutoGirl services into your external applications.
          </p>
        </div>
        <Button 
          onClick={() => setIsGenerateModalOpen(true)} 
          className="gap-2 shadow-md hover:shadow-lg"
          disabled={apiKeys.length > 0} // Vendor holds at most one active key at a time based on docs, but we can let them override.
        >
          <Plus className="w-4 h-4" /> Generate New Key
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-brand-500" />
                <CardTitle>Active API Keys</CardTitle>
              </div>
              <CardDescription>
                A vendor can hold at most one active key. Generating a new one will silently revoke the current key.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isKeysLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Terminal className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No active API keys</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                    You haven't generated any API keys yet. Create one to start authenticating your integrations.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {apiKeys.map((key: any) => (
                    <div key={key.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-foreground">{key.name}</h4>
                          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" /> Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 w-fit px-3 py-1.5 rounded-md border border-border/50">
                          <code className="text-sm font-mono text-foreground/80 tracking-widest">
                            {key.prefix}••••••••••••••••••••••••••••••{key.last4}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(key.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="w-full sm:w-auto shadow-sm"
                          onClick={() => openConfirm(
                            "Revoke API Key",
                            `Are you sure you want to permanently revoke the "${key.name}" key? Any integrations currently using it will start failing immediately.`,
                            "Yes, Revoke Key",
                            "destructive",
                            () => revokeMutation.mutate(key.id)
                          )}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Revoke Key
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm bg-brand-50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" /> API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-brand-800/80 dark:text-brand-200/80">
              <p>
                Ready to start building? Check out our official API documentation for comprehensive guides and endpoint references.
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-background hover:bg-muted text-foreground border-border/60 shadow-sm transition-all group"
                onClick={() => window.open("https://muvment-vendor-api.readme.io/reference/getmaintenance", "_blank", "noopener noreferrer")}
              >
                Explore Docs 
                <ExternalLink className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-500" /> Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                API keys grant full access to your vendor account programmatically. Treat them with the same security as a password.
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Never commit your keys to version control (e.g., GitHub).</li>
                <li>Never expose them in client-side code like React or Mobile apps.</li>
                <li>Use environment variables on your secure servers.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Key Modal */}
      <Modal open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <ModalContent className="sm:max-w-[425px]">
          <form onSubmit={handleGenerate}>
            <ModalHeader>
              <ModalTitle>Generate API Key</ModalTitle>
              <ModalDescription>
                {apiKeys.length > 0 
                  ? "Warning: Generating a new key will automatically and permanently revoke your currently active key." 
                  : "Give this API key a descriptive name so you remember what it's used for."}
              </ModalDescription>
            </ModalHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. Production Booking Backend"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generateMutation.isPending} className="min-w-[140px]">
                {generateMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <>Generate Key</>
                )}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Secret One-Time Display Modal */}
      <Modal open={!!newRawKey} onOpenChange={(open) => !open && setNewRawKey(null)}>
        <ModalContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <ModalHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <ModalTitle className="text-center text-xl">New API Key Generated</ModalTitle>
            <ModalDescription className="text-center">
              Please copy this key and store it somewhere safe immediately. 
              <br /><strong className="text-foreground">You will not be able to see it again!</strong>
            </ModalDescription>
          </ModalHeader>
          <div className="py-6 space-y-4">
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-4 border border-border/50">
              <code className="text-sm font-mono text-foreground break-all bg-transparent w-full">
                {newRawKey}
              </code>
              <Button 
                variant="secondary" 
                size="icon" 
                className="shrink-0 shadow-sm"
                onClick={() => newRawKey && copyToClipboard(newRawKey)}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/50">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-400">
                If you lose this key, you will have to generate a new one, which will automatically revoke this one.
              </p>
            </div>
          </div>
          <ModalFooter className="sm:justify-center">
            <Button onClick={() => setNewRawKey(null)} className="w-full sm:w-auto px-8">
              I have safely stored this key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <Modal open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
        <ModalContent className="sm:max-w-[425px]">
          <ModalHeader>
            <ModalTitle>{confirmModal.title}</ModalTitle>
            <ModalDescription>
              {confirmModal.description}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button 
              variant={confirmModal.actionVariant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
              }}
            >
              {confirmModal.actionLabel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
