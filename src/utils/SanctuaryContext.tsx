"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { SanctuaryConfig } from '@/utils/config';
import { setDates } from '@/utils/date';
import { importKey, decryptData } from '@/utils/crypto';
import { THEMES, DEFAULT_THEME } from '@/utils/themes';

interface SanctuaryContextType {
  config: SanctuaryConfig | null;
  isWizardMode: boolean;
  decryptWithPasscode: (passcode: string) => Promise<boolean>;
  isLocked: boolean;
  setPreviewConfig: (config: SanctuaryConfig | null) => void;
  applyTheme: (themeId: string) => void;
}

const SanctuaryContext = createContext<SanctuaryContextType | undefined>(undefined);

export function SanctuaryProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SanctuaryConfig | null>(null);
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const applyTheme = (themeId: string) => {
    const theme = THEMES[themeId] || DEFAULT_THEME;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-bg', theme.colors.bg);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-soft', theme.colors.soft);
    
    // Apply font family based on theme
    if (theme.font === 'elegant') {
      root.style.setProperty('--font-current', 'var(--font-dm-serif)');
    } else if (theme.font === 'modern') {
      root.style.setProperty('--font-current', 'var(--font-inter)');
    } else if (theme.font === 'playful') {
      root.style.setProperty('--font-current', 'var(--font-sacramento)');
    }
  };

  const setPreviewConfig = (newConfig: SanctuaryConfig | null) => {
    setConfig(newConfig);
    if (newConfig) {
      setDates(newConfig.anniversaryDate, newConfig.targetDate);
      applyTheme(newConfig.theme);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const d = searchParams.get('d');
    const iv = searchParams.get('iv');
    const masterKeyBase64 = window.location.hash.slice(1);

    if (d && iv && masterKeyBase64) {
      const decrypt = async () => {
        try {
          const masterKey = await importKey(masterKeyBase64);
          const decryptedConfig = await decryptData(d, iv, masterKey);
          
          if (decryptedConfig) {
            setConfig(decryptedConfig);
            setDates(decryptedConfig.anniversaryDate, decryptedConfig.targetDate);
            applyTheme(decryptedConfig.theme);
            
            if (decryptedConfig.passcodeSalt) {
              setIsLocked(true);
            }
          }
        } catch (e) {
          console.error("Master decryption failed", e);
        }
      };
      decrypt();
      return;
    }
    
    if (window.location.pathname === '/wizard') {
      setIsWizardMode(true);
    }
  }, []);

  const decryptWithPasscode = async (passcode: string): Promise<boolean> => {
    if (!config || !(config as any).passcodeSalt) return false;

    try {
      const { deriveKeyFromPasscode, decryptData } = await import('@/utils/crypto');
      const passcodeKey = await deriveKeyFromPasscode(passcode, (config as any).passcodeSalt);
      
      const decryptedNotes = await decryptData(
        (config as any).encryptedNotes.ciphertext,
        (config as any).encryptedNotes.iv,
        passcodeKey
      );
      
      const decryptedVideo = await decryptData(
        (config as any).encryptedVideo.ciphertext,
        (config as any).encryptedVideo.iv,
        passcodeKey
      );

      setConfig({
        ...config,
        notes: decryptedNotes,
        videoUrl: decryptedVideo
      });
      setIsLocked(false);
      return true;
    } catch (e) {
      console.error("Passcode decryption failed", e);
      return false;
    }
  };

  return (
    <SanctuaryContext.Provider value={{ config, isWizardMode, decryptWithPasscode, isLocked, setPreviewConfig, applyTheme }}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const context = useContext(SanctuaryContext);
  if (context === undefined) {
    throw new Error('useSanctuary must be used within a SanctuaryProvider');
  }
  return context;
}
