"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useVendor } from "@/components/VendorContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Activity, Users, DollarSign, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { activeVendor } = useVendor();

  const user = session?.user as any;

  if (!activeVendor) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center border border-dashed rounded-2xl bg-card/30 p-8">
        <Building2 className="w-16 h-16 text-muted-foreground mb-6" />
        <h3 className="text-2xl font-bold mb-3 text-foreground">Welcome to AutoGirl Vendor Portal, {user?.firstName}!</h3>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          To get started, you need to create your first vendor account. This will serve as your business workspace.
        </p>
        <Link href="/vendor/create">
          <Button size="lg" className="gap-2">
            Create Vendor Account <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Welcome back to <span className="font-semibold text-foreground">{activeVendor.name || activeVendor.businessName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
            ${activeVendor.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
              activeVendor.kycStatus === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
            KYC: {activeVendor.kycStatus?.replace('_', ' ') || "PENDING"}
          </span>
          {activeVendor.isActive && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
              Active Status
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-brand-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <p className="text-xs text-muted-foreground mt-1">+0% from last month</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Drivers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Pending assignments</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicle Activity</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Vehicles on active trips</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions / Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-brand-50 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/50">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete your setup to fully integrate with AutoGirl.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div className="flex-1">
                <p className="font-medium text-sm">Complete KYC Verification</p>
                <p className="text-xs text-muted-foreground">Upload required business documents</p>
              </div>
              <Button size="sm" variant="outline">Start</Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">2</div>
              <div className="flex-1">
                <p className="font-medium text-sm">Add Vehicles</p>
                <p className="text-xs text-muted-foreground">Register your fleet</p>
              </div>
              <Button size="sm" variant="outline" disabled>Pending KYC</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
