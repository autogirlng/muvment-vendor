"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown, PlusCircle, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useVendor } from "./VendorContext";

export function VendorSwitcher() {
  const { activeVendor, activeVendorId, setActiveVendorId, vendors } = useVendor();
  const router = useRouter();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Select a vendor"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-medium text-foreground">
                {activeVendor ? (activeVendor.name || activeVendor.businessName) : "Select Vendor"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {activeVendor ? (activeVendor.email || activeVendor.myRole?.replace('_', ' ') || "Active Vendor") : "No active vendor"}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>


        <DropdownMenu.Content
          className="z-[100] min-w-[240px] w-(--radix-dropdown-menu-trigger-width) overflow-hidden rounded-xl border border-border bg-card p-2 text-card-foreground shadow-2xl animate-in fade-in-80 zoom-in-95 relative"
          align="start"
          sideOffset={8}
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Switch Vendor Context
          </DropdownMenu.Label>
          {vendors.map((vendor: any, idx: number) => {
            const vId = vendor.vendorId || vendor.id || String(idx);
            return (
            <DropdownMenu.Item
              key={vId}
              onSelect={() => setActiveVendorId(vId)}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 z-[101]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 mr-2">
                {(vendor.name || vendor.businessName || "V").charAt(0)}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="truncate">{vendor.name || vendor.businessName}</span>
              </div>
              {activeVendorId === vId && (
                <Check className="ml-auto h-4 w-4 text-brand-600 dark:text-brand-400" />
              )}
            </DropdownMenu.Item>
          )})}
          <DropdownMenu.Separator className="my-1 h-px bg-muted" />
          <DropdownMenu.Item
            onSelect={() => router.push("/vendor/create")}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-accent focus:text-accent-foreground text-brand-600 dark:text-brand-400 font-medium"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add new vendor account
          </DropdownMenu.Item>
        </DropdownMenu.Content>

    </DropdownMenu.Root>
  );
}
