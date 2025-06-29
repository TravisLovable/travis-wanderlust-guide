
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchCountryFlag(destination: string): Promise<string | null> {
  try {
    // This is a simple implementation - in a real app you might want to use a proper API
    const response = await fetch(`https://restcountries.com/v3.1/name/${destination}`);
    if (response.ok) {
      const data = await response.json();
      return data[0]?.flags?.svg || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching country flag:', error);
    return null;
  }
}
