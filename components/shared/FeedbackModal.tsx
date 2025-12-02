"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LifeBuoy } from "lucide-react"; // Import LifeBuoy icon

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void; // New prop for interlinking
}

const formSchema = z.object({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }).max(420, {
    message: "Message must not be longer than 420 characters.",
  }),
  contactMethod: z.enum(["email", "whatsapp", "link"], {
    required_error: "Please select a contact method.",
  }),
  contactDetail: z.string().min(1, {
    message: "Please provide contact details.",
  }),
}).superRefine((data, ctx) => {
  if (data.contactMethod === "email") {
    if (!z.string().email().safeParse(data.contactDetail).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid email address.",
        path: ["contactDetail"],
      });
    }
  } else if (data.contactMethod === "whatsapp") {
    // Basic WhatsApp number validation (e.g., +1234567890, 123-456-7890, 1234567890)
    // This regex allows for an optional leading '+' and then digits, spaces, hyphens, or parentheses.
    const whatsappRegex = /^\+?[0-9\s\-()]{7,20}$/; 
    if (!whatsappRegex.test(data.contactDetail)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid WhatsApp number format. Please include country code if applicable (e.g., +1234567890).",
        path: ["contactDetail"],
      });
    }
  } else if (data.contactMethod === "link") {
    if (data.contactDetail.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link must be at least 5 characters.",
        path: ["contactDetail"],
      });
    }
  }
});

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onOpenContact }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      contactMethod: "email", // Default value
      contactDetail: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
                setIsLoading(true);
              try {
                const response = await fetch("/api/feedback", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(values),      });

      if (!response.ok) {
        throw new Error("Failed to send feedback.");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Great! Your feedback is in. We value your input.");
        form.reset();
        onClose();
      } else {
        toast.error("Uh oh! We couldn't send your feedback. Please try again.");
      }
    } catch (error: any) {
      toast.error("Oops! Something unexpected happened. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Feedback / Report Bug</DialogTitle>
          <DialogDescription>
            Share your thoughts, feature requests, or bug reports with us.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your feedback or bug here..."
                      rows={1}
                      maxLength={420}
                      {...field}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Please be as detailed as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How to contact you back?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="link">Other Link (e.g., LinkedIn, X)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    We might reach out for more details if needed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Your {form.watch("contactMethod") === "email" ? "Email Address" : form.watch("contactMethod") === "whatsapp" ? "WhatsApp Number" : "Link"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={form.watch("contactMethod") === "email" ? "email" : "text"}
                      placeholder={`Enter your ${form.watch("contactMethod") === "email" ? "email" : form.watch("contactMethod") === "whatsapp" ? "WhatsApp number" : "link"}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row sm:justify-end items-center sm:items-end"> {/* Adjusted for interlinking button */}
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto mt-2 sm:mt-0">
                {isLoading ? "Sending..." : "Send Feedback"}
              </Button>
              <Button onClick={onOpenContact} variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"> {/* Interlink button */}
                  <LifeBuoy className="h-4 w-4 mr-2" /> Contact Support
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
