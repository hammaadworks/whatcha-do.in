import { useState, useEffect } from 'react';

/**
 * Interface for the `beforeinstallprompt` event, which is not yet standard in TypeScript's DOM lib.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Custom hook to manage Progressive Web App (PWA) installation.
 * 
 * Handles detecting install eligibility, managing the install prompt (for Android/Desktop),
 * detecting iOS (for manual install instructions), and tracking installation status.
 * 
 * @returns An object containing installation state and handler functions.
 */
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
    if (typeof window === 'undefined') return;

    // iOS detection
    const userAgent = window.navigator.userAgent;
    const isIPad = /iPad/i.test(userAgent);
    const isIPhone = /iPhone/i.test(userAgent);

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
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAppInstalled]);

  /**
   * Triggers the PWA installation flow.
   * If on a supported platform (Android/Chrome), shows the native prompt.
   * If on iOS or unsupported, shows a modal with manual instructions.
   */
  const promptInstall = async () => {
    if (isAppInstalled) {
      setInstallMessage('The app is already installed. You can launch it from your home screen.');
      setShowInstallMessage(true);
      return; 
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallMessage('Great! The app is being installed.');
        setShowInstallMessage(true);
        setIsAppInstalled(true);
      } else {
        setInstallMessage('You dismissed the PWA installation. You can try again later or add it manually.');
        setShowInstallMessage(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt (e.g. iOS or manual triggers)
      if (isIOS) {
        setInstallMessage('To install, tap the Share button (box with an arrow) and then "Add to Home Screen".');
      } else {
        setInstallMessage('PWA installation prompt not available at this moment. Please try again later.');
      }
      setShowInstallMessage(true);
    }
  };

  /**
   * Closes the installation status message modal.
   */
  const closeInstallMessage = () => {
    setShowInstallMessage(false);
    setInstallMessage('');
  };

  return {
    /** Whether the app can be installed (native prompt available). */
    canInstall,
    /** Function to trigger the installation prompt. */
    promptInstall,
    /** Whether the user is on an iOS device (requires manual install). */
    isIOS,
    /** Whether the app is already running in standalone mode. */
    isAppInstalled,
    /** Whether to show the install feedback modal. */
    showInstallMessage,
    /** The message to display in the feedback modal. */
    installMessage,
    /** Function to close the feedback modal. */
    closeInstallMessage,
    /** Setter for install message (exposed for custom UI logic). */
    setInstallMessage,
    /** Setter for showing the feedback modal (exposed for custom UI logic). */
    setShowInstallMessage
  };
};