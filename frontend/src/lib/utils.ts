import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number, total: number) => {
  if (total === 0 || value === 0) return "";
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const calculatePercentageChange = (currentValue: number, previousValue: number | null, normalized: boolean) => {
  if (!previousValue || previousValue === 0) return null;
  
  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  return {
    percentageChange,
    indicator: percentageChange > 0 ? "↑" : percentageChange < 0 ? "↓" : "",
    indicatorColor: percentageChange > 0 ? "text-green-600" : "text-red-600"
  };
}; 
