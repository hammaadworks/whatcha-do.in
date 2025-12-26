"use client";

import React from "react";
import BaseModal from './BaseModal';
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, X, Github, Linkedin, MessageCircle, Bug } from "lucide-react";
import Link from "next/link";
import {
    EMAIL,
    WHATSAPP_URL,
    X_PROFILE_URL,
    GITHUB_PROFILE_URL,
    LINKEDIN_PROFILE_URL,
    PRODUCTHUNT_PROFILE_URL,
    WEBSITE_URL
} from "@/lib/constants";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Callback to switch to the Feedback modal. */
  onOpenFeedback: () => void;
}

/**
 * Modal displaying various support contact options and social links.
 */
const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose, onOpenFeedback }) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Support"
      description="Reach out to us for any questions, feedback, or support needs."
      footerContent={
        <div className="flex justify-end space-x-2">
            <Button onClick={onOpenFeedback} variant="outline" className="w-auto">
                <Bug className="h-4 w-4 mr-2" /> Send Feedback
            </Button>
            <Button onClick={onClose} className="w-auto">Close</Button>
        </div>
      }
    >
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Link href={`mailto:${EMAIL}`} className="text-primary hover:underline">
              {EMAIL}
            </Link>
          </div>
          <p className="font-semibold mt-2 text-center">Find me on:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                WhatsApp
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-muted-foreground" />
              <Link href={X_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                X
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              <Link href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                GitHub
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <Link href={LINKEDIN_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                LinkedIn
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Link href={PRODUCTHUNT_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ProductHunt
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Link href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Website (Coming Soon)
              </Link>
            </div>
          </div>
        </div>
    </BaseModal>
  );
};

export default ContactSupportModal;
