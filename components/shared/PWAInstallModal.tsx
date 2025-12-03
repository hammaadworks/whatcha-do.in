// components/shared/PWAInstallModal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import BaseModal from './BaseModal'; // Import the new BaseModal

interface PWAInstallModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ show, message, onClose }) => {
  return (
    <BaseModal
      isOpen={show}
      onClose={onClose}
      title="Install App"
      description={message}
      footerContent={<Button onClick={onClose} className="w-full">Got it</Button>}
    >
      {/* No additional children content for this modal */}
    </BaseModal>
  );
};

