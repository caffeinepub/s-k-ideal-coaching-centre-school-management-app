import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Indian Rupees with proper INR formatting conventions
 * Example: 100000 -> ₹1,00,000
 */
export function formatINR(amount: bigint | number): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  
  // Convert to string and split into integer and decimal parts
  const [integerPart, decimalPart] = numAmount.toFixed(2).split('.');
  
  // Apply Indian numbering system (lakhs and crores)
  // First 3 digits from right, then groups of 2
  const lastThree = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  
  let formattedInteger = lastThree;
  if (otherDigits) {
    // Add commas every 2 digits for the remaining part
    const groups = otherDigits.match(/.{1,2}/g)?.reverse() || [];
    formattedInteger = groups.join(',') + ',' + lastThree;
  }
  
  return `₹${formattedInteger}.${decimalPart}`;
}
