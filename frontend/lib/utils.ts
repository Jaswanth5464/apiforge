import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return 'text-green-400';
  if (statusCode >= 300 && statusCode < 400) return 'text-blue-400';
  if (statusCode >= 400 && statusCode < 500) return 'text-yellow-400';
  if (statusCode >= 500) return 'text-red-400';
  return 'text-zinc-400';
}

export function getStatusBg(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return 'bg-green-500/15 text-green-400 border-green-500/30';
  if (statusCode >= 300 && statusCode < 400) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  if (statusCode >= 500) return 'bg-red-500/15 text-red-400 border-red-500/30';
  return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
}

export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'text-emerald-400',
    POST: 'text-amber-400',
    PUT: 'text-blue-400',
    PATCH: 'text-purple-400',
    DELETE: 'text-red-400',
    HEAD: 'text-cyan-400',
    OPTIONS: 'text-pink-400',
  };
  return colors[method] ?? 'text-zinc-400';
}

export function getMethodBadgeColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-400',
    POST: 'bg-amber-500/15 text-amber-400',
    PUT: 'bg-blue-500/15 text-blue-400',
    PATCH: 'bg-purple-500/15 text-purple-400',
    DELETE: 'bg-red-500/15 text-red-400',
    HEAD: 'bg-cyan-500/15 text-cyan-400',
    OPTIONS: 'bg-pink-500/15 text-pink-400',
  };
  return colors[method] ?? 'bg-zinc-500/15 text-zinc-400';
}

export function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + '…';
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function prettifyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function downloadText(content: string, filename: string, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
