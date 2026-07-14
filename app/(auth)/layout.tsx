import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left side: Animated Gradient Branding */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden bg-brand-950 p-12">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-brand-900 to-black/80" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse delay-1000" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">AutoGirl</h1>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-semibold text-white mb-6 leading-tight">
            Empowering your fleet and operations.
          </h2>
          <p className="text-brand-200 text-lg">
            Join the platform designed for seamless logistics, management, and real-time vendor insights.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center justify-between text-brand-300 text-sm">
          <span>© 2026 AutoGirl. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right side: Form Area */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>
    </div>
  );
}
