// Simplified flags implementation without @vercel/flags
export type Flag = {
  name: string;
  enabled: boolean;
};

const FLAGS: Record<string, boolean> = {
  // Environment flags
  'in-development': process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview',
  'is-preview': process.env.VERCEL_ENV === 'preview',
  'is-production': process.env.NODE_ENV === 'production',
};

export function getFlag(name: string): boolean {
  if (process.env.FORCE_FLAGS) {
    try {
      const forcedFlags = JSON.parse(process.env.FORCE_FLAGS);
      if (name in forcedFlags) {
        return forcedFlags[name];
      }
    } catch (e) {
      console.warn('Failed to parse FORCE_FLAGS environment variable');
    }
  }
  return FLAGS[name] ?? false;
}

export function getAllFlags(): Record<string, boolean> {
  return { ...FLAGS };
}

// Helper functions for common flag checks
export const isDevelopment = () => getFlag('in-development');
export const isPreview = () => getFlag('is-preview');
export const isProduction = () => getFlag('is-production');
export const isDebugMode = () => getFlag('debug-mode');
