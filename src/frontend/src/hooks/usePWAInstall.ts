import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSAL_KEY = 'pwa-install-dismissed';
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Check if user has dismissed the prompt recently
      const dismissedData = localStorage.getItem(DISMISSAL_KEY);
      if (dismissedData) {
        try {
          const { timestamp } = JSON.parse(dismissedData);
          const now = Date.now();
          if (now - timestamp < DISMISSAL_DURATION) {
            // Still within dismissal period
            return;
          }
        } catch (error) {
          console.error('Error parsing dismissal data:', error);
        }
      }
      
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    
    // Store dismissal with timestamp
    const dismissalData = {
      timestamp: Date.now(),
    };
    localStorage.setItem(DISMISSAL_KEY, JSON.stringify(dismissalData));
  };

  return {
    showInstallPrompt,
    installPWA,
    dismissPrompt,
    isInstalling,
  };
}
