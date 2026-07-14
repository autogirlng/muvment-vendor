import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", isLoading, children, disabled, ...props },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    const variants = {
      default: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/20",
      outline: "border border-input bg-background hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/50",
      ghost: "hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/50",
      link: "text-brand-600 underline-offset-4 hover:underline",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 dark:bg-red-900 dark:hover:bg-red-800",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-muted/80 text-foreground",
    };

    const sizes = {
      default: "h-11 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
