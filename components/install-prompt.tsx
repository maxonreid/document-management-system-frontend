'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border bg-white p-4 shadow-lg">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 text-text-secondary hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="mb-2 font-semibold text-text-primary">Install DMS App</h3>
      <p className="mb-4 text-sm text-text-secondary">
        Install this app on your device for quick access and offline functionality.
      </p>
      <Button onClick={handleInstall} className="w-full">
        Install
      </Button>
    </div>
  );
}
