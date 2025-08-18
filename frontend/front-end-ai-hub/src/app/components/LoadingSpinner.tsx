"use client";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 20, className = "" }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin ${className}`} 
      size={size}
    />
  );
} 