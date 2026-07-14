"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VendorAPI } from "@/lib/api";
import { useVendor } from "@/components/VendorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, CheckCircle2, Clock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function KycVerificationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeVendorId, activeVendor, isLoading: isVendorContextLoading } = useVendor();

  const [formData, setFormData] = useState({
    rcNumber: "",
    officeAddress: "",
    staffCount: "",
    natureOfServices: "",
  });

  const { data: kycData, isLoading: isKycLoading } = useQuery({
    queryKey: ["kyc", activeVendorId],
    queryFn: () => VendorAPI.getKycStatus(activeVendorId!),
    enabled: !!activeVendorId,
  });

  const { data: vendorDetailsRes, isLoading: isVendorDetailsLoading } = useQuery({
    queryKey: ["vendorDetails", activeVendorId],
    queryFn: () => VendorAPI.getVendorDetails(activeVendorId!),
    enabled: !!activeVendorId,
  });

  const kycStatus = kycData?.data?.status || activeVendor?.kycStatus || "NOT_SUBMITTED";

  // Pre-fill form if data exists
  useEffect(() => {
    if (kycData?.data && kycData.data.status !== "NOT_SUBMITTED") {
      setFormData({
        rcNumber: kycData.data.rcNumber || "",
        officeAddress: kycData.data.officeAddress || "",
        staffCount: kycData.data.staffCount ? String(kycData.data.staffCount) : "",
        natureOfServices: kycData.data.natureOfServices || "",
      });
    } else {
      // Fallback pre-fill from vendor details fetched from the API
      const details = vendorDetailsRes?.data;
      if (details) {
        setFormData(prev => ({
          ...prev,
          rcNumber: details.rcNumber || prev.rcNumber,
          officeAddress: details.address || prev.officeAddress,
          staffCount: details.staffCount ? String(details.staffCount) : prev.staffCount,
          natureOfServices: details.natureOfServices || prev.natureOfServices,
        }));
      } else if (activeVendor) {
        // Ultimate fallback from context if API is still loading
        setFormData(prev => ({
          ...prev,
          rcNumber: activeVendor.rcNumber || prev.rcNumber,
          officeAddress: activeVendor.address || prev.officeAddress,
          staffCount: activeVendor.staffCount ? String(activeVendor.staffCount) : prev.staffCount,
          natureOfServices: activeVendor.natureOfServices || prev.natureOfServices,
        }));
      }
    }
  }, [kycData, vendorDetailsRes, activeVendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitMutation = useMutation({
    mutationFn: (payload: any) => VendorAPI.submitKyc(activeVendorId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", activeVendorId] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVendorId) return;

    const payload = {
      ...formData,
      staffCount: parseInt(formData.staffCount) || 1
    };
    submitMutation.mutate(payload);
  };

  const isSubmitting = submitMutation.isPending;
  const error = submitMutation.error ? (submitMutation.error as Error).message : "";

  if (isVendorContextLoading || isKycLoading) {
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
        <p className="text-muted-foreground mt-2 mb-6">Please select or create a vendor to proceed with KYC.</p>
        <Button onClick={() => router.push("/vendor/create")}>Create Vendor</Button>
      </div>
    );
  }

  if (kycStatus === "APPROVED") {
    return (
      <div className="max-w-3xl mx-auto mt-10 animate-in zoom-in-95 fade-in duration-500">
        <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/10 overflow-hidden">
          <div className="h-2 w-full bg-green-500" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-400">KYC Verified</CardTitle>
            <CardDescription className="text-base mt-2">
              Your business has been successfully verified. You now have full access to AutoGirl services.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6 pb-8">
            <Button onClick={() => router.push("/dashboard")} className="bg-green-600 hover:bg-green-700 text-white gap-2">
              Return to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycStatus === "UNDER_REVIEW") {
    return (
      <div className="max-w-3xl mx-auto mt-10 animate-in zoom-in-95 fade-in duration-500">
        <Card className="border-yellow-100 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-950/10 overflow-hidden">
          <div className="h-2 w-full bg-yellow-500" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl text-yellow-800 dark:text-yellow-400">Verification Under Review</CardTitle>
            <CardDescription className="text-base mt-2">
              We have received your KYC submission and our team is currently reviewing your details. 
              This typically takes 24-48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6 pb-8">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // NOT_SUBMITTED or REJECTED state
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-brand-100 dark:bg-brand-900/40 p-3 rounded-2xl">
          <ShieldCheck className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Complete your business profile for <span className="font-semibold text-foreground">{activeVendor.name || activeVendor.businessName}</span>.
          </p>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <div className="h-1.5 w-full bg-linear-to-r from-brand-400 to-brand-600" />
        <CardHeader>
          <CardTitle className="text-xl">Business Information</CardTitle>
          <CardDescription>
            This information must match your official registration documents exactly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="kyc-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 text-sm bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/50 p-1 rounded-full shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="rcNumber" className="text-sm font-semibold text-foreground/80">
                  RC Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rcNumber"
                  name="rcNumber"
                  placeholder="e.g. RC-7734921"
                  className="h-11 bg-muted/50 focus:bg-background transition-colors"
                  value={formData.rcNumber}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Required to verify your business legitimacy.</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="staffCount" className="text-sm font-semibold text-foreground/80">
                  Staff Count <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="staffCount"
                  name="staffCount"
                  type="number"
                  placeholder="e.g. 18"
                  className="h-11 bg-muted/50 focus:bg-background transition-colors"
                  value={formData.staffCount}
                  onChange={handleChange}
                  min={1}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Approximate number of employees.</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="officeAddress" className="text-sm font-semibold text-foreground/80">
                Registered Office Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="officeAddress"
                name="officeAddress"
                placeholder="e.g. 12 Admiralty Way, Lekki"
                className="h-11 bg-muted/50 focus:bg-background transition-colors"
                value={formData.officeAddress}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="natureOfServices" className="text-sm font-semibold text-foreground/80">
                Nature of Services <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="natureOfServices"
                name="natureOfServices"
                placeholder="Please describe the nature of the services you provide in detail..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                value={formData.natureOfServices}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-border px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground max-w-[60%]">
            By submitting, you confirm that these details match your official corporate filings.
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="kyc-form" disabled={isSubmitting} className="min-w-[140px] shadow-md hover:shadow-lg transition-all">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit KYC <CheckCircle2 className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
