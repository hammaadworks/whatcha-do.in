"use client";

import React from 'react';
import BaseModal from './BaseModal';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    onClose(); // Close the modal
    router.push('/logins'); // Redirect to the logins page
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Login Required"
      description="You need to be logged in to install the Progressive Web App."
      className="max-w-sm"
      footerContent={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLoginRedirect}>
            Go to Login
          </Button>
        </div>
      }
    >
      {/* Any additional content for the modal body can go here if needed */}
    </BaseModal>
  );
};

export default LoginPromptModal;
