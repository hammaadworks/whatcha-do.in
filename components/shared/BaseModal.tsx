'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  // Removed DialogClose from here
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Removed X import as it's no longer directly used for the close button

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode; // Optional prop for custom footer content
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerContent,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full !w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto mx-auto p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
          {/* The DialogClose is typically provided by DialogContent itself, so removing explicit add */}
        </DialogHeader>
        <div className="px-4">
          {children}
        </div>
        <DialogFooter className="px-4 pb-4">
          {footerContent ? (
            footerContent
          ) : (
            <Button type="button" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BaseModal;