import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  // Initialize isAppInstalled directly, it's a one-time check on client mount
  const [isAppInstalled, setIsAppInstalled] = useState(
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  );
  const [showInstallMessage, setShowInstallMessage] = useState(false);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    // iOS detection
    // Use window directly now that it's checked in useState initializer
    const userAgent = window !== undefined ? window.navigator.userAgent : '';
    const isIPad = new RegExp(/iPad/i).exec(userAgent);
    const isIPhone = new RegExp(/iPhone/i).exec(userAgent);

    // Only set isIOS if not already installed, and on iOS device
    if ((isIPad || isIPhone) && !isAppInstalled) {
      setIsIOS(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Event listener for appinstalled to update state
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setCanInstall(false); // No need to show install button once installed
    };
    window.addEventListener('appinstalled', handleAppInstalled);


    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled); // Clean up
    };
  }, [isAppInstalled]); // Keep isAppInstalled in deps to re-evaluate isIOS if it changes

  const promptInstall = async () => {
    if (isAppInstalled) {
      setInstallMessage('The app is already installed. You can launch it from your home screen.');
      setShowInstallMessage(true);
      return; // Exit early if already installed
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the PWA installation prompt');
        setInstallMessage('Great! The app is being installed.');
        setShowInstallMessage(true);
        setIsAppInstalled(true); // App is now installed
      } else {
        console.log('User dismissed the PWA installation prompt');
        setInstallMessage('You dismissed the PWA installation. You can try again later or add it manually.');
        setShowInstallMessage(true);
      }
      setDeferredPrompt(null);
    } else {
      if (isIOS) {
        setInstallMessage('To install, tap the Share button (box with an arrow) and then "Add to Home Screen".');
      } else {
        setInstallMessage('PWA installation prompt not available at this moment. Please try again later.');
      }
      setShowInstallMessage(true);
    }
  };

  const closeInstallMessage = () => {
    setShowInstallMessage(false);
    setInstallMessage('');
  };

  // Return all relevant states and functions
  return {
    canInstall,
    promptInstall,
    isIOS,
    isAppInstalled,
    showInstallMessage,
    installMessage,
    closeInstallMessage,
    setInstallMessage,
    setShowInstallMessage
  };
};
