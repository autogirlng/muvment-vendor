"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { VendorAPI } from "@/lib/api";
import { useVendor } from "@/components/VendorContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Building2, Mail, Phone, MapPin, Globe, Briefcase, 
  Users, Calendar, ShieldCheck, FileCheck, Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function SettingsPage() {
  const { activeVendorId, isVendorContextLoading } = useVendor();

  const { data: vendorRes, isLoading } = useQuery({
    queryKey: ["vendorDetails", activeVendorId],
    queryFn: () => VendorAPI.getVendorDetails(activeVendorId!),
    enabled: !!activeVendorId,
  });

  const vendor = vendorRes?.data;

  if (isVendorContextLoading || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!activeVendorId || !vendor) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Active Vendor</h2>
        <p className="text-muted-foreground mt-2 mb-6">Select a vendor workspace to view settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          View and manage the complete profile for <span className="font-semibold text-foreground">{vendor.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Key Stats / Statuses */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className={`h-2 w-full ${vendor.active ? 'bg-green-500' : 'bg-red-500'}`} />
            <CardHeader className="bg-muted/20 pb-4 border-b border-border">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-500" />
                {vendor.name}
              </CardTitle>
              <CardDescription>Primary Organization Profile</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Account Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  vendor.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {vendor.active ? 'Active' : 'Suspended'}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">KYC Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  vendor.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  vendor.kycStatus === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                }`}>
                  {vendor.kycStatus?.replace('_', ' ') || 'Not Submitted'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">Created</span>
                <span className="text-sm text-foreground">
                  {vendor.createdAt ? format(new Date(vendor.createdAt), "MMM d, yyyy") : 'Unknown'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-muted/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Vendor ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs break-all bg-background px-3 py-2 rounded-md border border-border block">
                {vendor.id}
              </code>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-500" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-border/50">
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> RC Number
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 font-medium">
                    {vendor.rcNumber || <span className="text-muted-foreground italic">Not provided</span>}
                  </dd>
                </div>
                
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Nature of Services
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {vendor.natureOfServices || <span className="text-muted-foreground italic">Not provided</span>}
                  </dd>
                </div>

                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Staff Count
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {vendor.staffCount ? `${vendor.staffCount} Employees` : <span className="text-muted-foreground italic">Not provided</span>}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-border/50">
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Business Email
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {vendor.businessEmail ? (
                      <a href={`mailto:${vendor.businessEmail}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                        {vendor.businessEmail}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </dd>
                </div>

                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Number
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {vendor.businessPhone ? (
                      <a href={`tel:${vendor.businessPhone}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                        {vendor.businessPhone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </dd>
                </div>

                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Website
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {vendor.website ? (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline break-all">
                        {vendor.website}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </dd>
                </div>

                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Office Address
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 leading-relaxed">
                    {vendor.address || <span className="text-muted-foreground italic">Not provided</span>}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
