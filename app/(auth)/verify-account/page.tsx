"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await AuthAPI.verifyAccount({ email, otp });
      setSuccess("Account verified successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to verify account. Please check your OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Verify your account</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit OTP sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-red-50 dark:bg-red-950/50 text-red-500 rounded-md border border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 text-sm bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-md border border-green-200 dark:border-green-900 animate-in fade-in zoom-in-95">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || !!initialEmail}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">One-Time Password</Label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            pattern="\d{6}"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Must be exactly 6 digits.</p>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} disabled={success !== ""}>
          Verify Account
        </Button>
      </form>
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <VerifyAccountForm />
    </Suspense>
  );
}
