'use client';

import { Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AuthType, AuthData } from '@/types/request';

interface AuthPanelProps {
  authType: AuthType;
  authData: AuthData;
  onChange: (type: AuthType, data: AuthData) => void;
}

const AUTH_TYPES: { value: AuthType; label: string; description: string }[] = [
  { value: 'none', label: 'No Auth', description: 'This request does not use any authorization' },
  { value: 'bearer', label: 'Bearer Token', description: 'Uses a token in the Authorization header' },
  { value: 'basic', label: 'Basic Auth', description: 'Uses username and password (Base64 encoded)' },
];

export function AuthPanel({ authType, authData, onChange }: AuthPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="p-4">
      {/* Auth type selector */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-3.5 h-3.5 text-[#555]" />
        <span className="text-xs text-[#777]">Type:</span>
        <div className="flex gap-1">
          {AUTH_TYPES.map((at) => (
            <button
              key={at.value}
              onClick={() => onChange(at.value, {})}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                authType === at.value
                  ? 'bg-[#ff6c37]/15 text-[#ff6c37] border border-[#ff6c37]/30'
                  : 'text-[#666] hover:text-[#aaa] border border-[#2e2e2e] hover:border-[#333]'
              )}
            >
              {at.label}
            </button>
          ))}
        </div>
      </div>

      {authType === 'none' && (
        <div className="flex items-center gap-2 text-[#444] text-xs py-4">
          <Shield className="w-4 h-4" />
          <span>This request does not use any authorization.</span>
        </div>
      )}

      {authType === 'bearer' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#666] mb-1.5">Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={authData.token || ''}
                onChange={(e) => onChange('bearer', { ...authData, token: e.target.value })}
                placeholder="Enter bearer token or {{TOKEN}}"
                className="w-full bg-[#242424] border border-[#333] rounded-md px-3 py-2 pr-10 text-xs text-[#e8e8e8] placeholder:text-[#444] focus:outline-none focus:border-[#ff6c37] font-mono transition-colors"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] transition-colors"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-[#444] mt-1">
              Adds <code className="text-[#ff6c37]">Authorization: Bearer &lt;token&gt;</code> header automatically
            </p>
          </div>
        </div>
      )}

      {authType === 'basic' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#666] mb-1.5">Username</label>
            <input
              type="text"
              value={authData.username || ''}
              onChange={(e) => onChange('basic', { ...authData, username: e.target.value })}
              placeholder="Enter username or {{USERNAME}}"
              className="w-full bg-[#242424] border border-[#333] rounded-md px-3 py-2 text-xs text-[#e8e8e8] placeholder:text-[#444] focus:outline-none focus:border-[#ff6c37] font-mono transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={authData.password || ''}
                onChange={(e) => onChange('basic', { ...authData, password: e.target.value })}
                placeholder="Enter password or {{PASSWORD}}"
                className="w-full bg-[#242424] border border-[#333] rounded-md px-3 py-2 pr-10 text-xs text-[#e8e8e8] placeholder:text-[#444] focus:outline-none focus:border-[#ff6c37] font-mono transition-colors"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-[#444] mt-1">
            Adds <code className="text-[#ff6c37]">Authorization: Basic &lt;base64&gt;</code> header automatically
          </p>
        </div>
      )}
    </div>
  );
}
