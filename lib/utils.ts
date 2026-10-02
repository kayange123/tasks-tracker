import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(url: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}${url}`;
}

// Unsplash serves any width through its `w` parameter; the stored
// thumbnail is only 200px wide, too soft for board covers
export function unsplashWidth(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "images.unsplash.com") return url;
    parsed.searchParams.set("w", String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}
