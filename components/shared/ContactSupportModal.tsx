"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ExternalLink, X, Github, Linkedin, MessageCircle, Bug } from "lucide-react"; // Added Bug icon
import Link from "next/link";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void; // New prop for interlinking
}

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose, onOpenFeedback }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Reach out to us for any questions, feedback, or support needs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Link href="mailto:hammaadworks@gmail.com" className="text-primary hover:underline">
              hammaadworks@gmail.com
            </Link>
          </div>
          <p className="font-semibold mt-2 text-center">Find me on:</p> {/* Added text-center */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <Link href="https://api.whatsapp.com/send/?phone=918310428923&text=%22Hey%20_hammaadworks_,%20I%20got%20here%20from%20your%20*whatcha-doin*%20app.%20Wazzup!%22" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                WhatsApp
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-muted-foreground" />
              <Link href="https://x.com/hammaadworks" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                X
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              <Link href="https://github.com/hammaadworks" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                GitHub
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <Link href="https://www.linkedin.com/in/hammaadworks" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                LinkedIn
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Link href="https://www.producthunt.com/@hammaadw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ProductHunt
              </Link>
            </div>
            <div className="flex items-center space-x-2"> {/* Removed col-span-2 */}
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Link href="https://www.hammaadworks.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Website (Coming Soon)
              </Link>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center sm:items-end"> {/* Adjusted for interlinking button */}
            <Button onClick={onOpenFeedback} variant="outline" className="w-full sm:w-auto"> {/* Interlink button */}
                <Bug className="h-4 w-4 mr-2" /> Send Feedback
            </Button>
            <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportModal;
