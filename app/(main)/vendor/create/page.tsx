"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VendorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "@/components/VendorContext";

export default function CreateVendorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActiveVendorId } = useVendor();

  const [formData, setFormData] = useState({
    name: "",
    rcNumber: "",
    natureOfServices: "",
    staffCount: "",
    businessEmail: "",
    businessPhone: "",
    address: "",
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => VendorAPI.createVendor(payload),
    onSuccess: (res) => {
      // Invalidate the vendors cache so it immediately fetches the new list
      queryClient.invalidateQueries({ queryKey: ["vendors"] });

      // Automatically set the active vendor if the API returned it
      const newVendor = res.data;
      if (newVendor) {
        const id = newVendor.vendorId || newVendor.id || newVendor._id;
        if (id) {
          setActiveVendorId(id);
        }
      }

      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      staffCount: parseInt(formData.staffCount) || 0
    };
    createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending;
  const error = createMutation.error ? (createMutation.error as Error).message : "";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Vendor</h1>
        <p className="text-muted-foreground mt-1">
          Create your vendor profile to start operating on the AutoGirl platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Provide your official business information. You can add more details later during KYC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Swiftlane Logistics"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rcNumber">RC Number</Label>
                <Input
                  id="rcNumber"
                  name="rcNumber"
                  placeholder="RC-123456"
                  value={formData.rcNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="natureOfServices">Nature of Services</Label>
              <Input
                id="natureOfServices"
                name="natureOfServices"
                placeholder="e.g. Fleet telematics integration"
                value={formData.natureOfServices}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  placeholder="ops@example.com"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  placeholder="+2348012345678"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="staffCount">Staff Count</Label>
                <Input
                  id="staffCount"
                  name="staffCount"
                  type="number"
                  placeholder="10"
                  value={formData.staffCount}
                  onChange={handleChange}
                  min={1}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="12 Admiralty Way, Lekki"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create Vendor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
