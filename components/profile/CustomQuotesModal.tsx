'use client';

import React, { useState, useRef, useEffect } from 'react';
import BaseModal from '@/components/shared/BaseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Pencil, Quote, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { QuoteItem } from '@/lib/supabase/types'; // Import QuoteItem from central types

interface CustomQuotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuotes: QuoteItem[]; // Now required and always the source of truth
    onAddQuote?: (text: string) => void;
    onDeleteQuote?: (id: string) => void;
    onEditQuote?: (id: string, newText: string) => void;
    onSelectQuote?: (text: string) => void; // New prop for selecting a quote
}

// Define your list of messages
const quoteSetToastMessages = [
    "Quote set! Time to shine!",
    "Quote set! Go own the day!",
    "Quote set! Make an impact!",
    "Quote set! Seize the moment!",
    "Quote set! Go forth and be amazing!",
    "Quote set! Make it happen.",
    "Quote set! Now the work begins.",
    "Quote set! Your move.",
    "Quote set! Get to it.",
    "Quote set! Start doing.",
];

// Function to get a random message
const getRandomQuoteSetToastMessage = () => {
    const randomIndex = Math.floor(Math.random() * quoteSetToastMessages.length);
    return quoteSetToastMessages[randomIndex];
};

const CustomQuotesModal: React.FC<CustomQuotesModalProps> = ({
    isOpen,
    onClose,
    initialQuotes, // No default empty array here as it's handled by parent
    onAddQuote,
    onDeleteQuote,
    onEditQuote,
    onSelectQuote
}) => {
    const [inputValue, setInputValue] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            // Give a small delay to ensure modal is rendered and input is available
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleAdd = async () => {
        if (!inputValue.trim()) {
            toast.error("Quote cannot be empty");
            return;
        }

        // Call parent handler
        await onAddQuote?.(inputValue.trim());

        // Reset
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleDelete = async (id: string) => {
        await onDeleteQuote?.(id);
    };

    const startEditing = (quote: QuoteItem) => {
        setEditingId(quote.id);
        setEditValue(quote.text);
    };

    const saveEdit = async () => {
        if (!editValue.trim() || !editingId) return;

        await onEditQuote?.(editingId, editValue.trim());
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Craft Your Quote"
            description="Add personal manifestions or favorite quotes to keep your fire burning."
            className="sm:max-w-xl" // Slightly wider
        >
            <div className="space-y-6 pb-6">

                {/* Input Section */}
                <div className="flex gap-2 items-center">
                    <div className="relative flex-grow">
                        <Quote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., The only way out is through..."
                            className="pl-9 pr-4 bg-muted/30 border-primary/20 focus-visible:ring-primary/30"
                        />
                    </div>
                    <Button onClick={handleAdd} size="icon" className="shrink-0 rounded-full">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* List Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        Your Collection
                    </h3>

                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 -mr-2 no-scrollbar">
                        {initialQuotes.length === 0 ? (
                            <div className="text-center py-10 border border-dashed rounded-xl border-muted-foreground/20 text-muted-foreground text-sm">
                                No custom quotes yet.<br/>Add your first one above! ✨
                            </div>
                        ) : (
                            initialQuotes.map((quote) => (
                                <div
                                    key={quote.id}
                                    className={cn(
                                        "group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200",
                                        editingId === quote.id
                                            ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                                            : "bg-card border-border/40 hover:border-primary/20 hover:shadow-sm"
                                    )}
                                >
                                    {/* Quote Icon / Bullet */}
                                    <div className="mt-1 text-primary/40 shrink-0">
                                        <Quote className="w-3 h-3 fill-current" />
                                    </div>

                                    {/* Content Area - Clickable to Select */}
                                    <div
                                        className={cn(
                                            "flex-grow min-w-0 transition-colors",
                                            !editingId && "cursor-pointer hover:text-primary"
                                        )}
                                        onClick={() => {
                                            if (!editingId) {
                                                onSelectQuote?.(quote.text);
                                                onClose();
                                                toast.success(getRandomQuoteSetToastMessage());
                                            }
                                        }}
                                    >
                                        {editingId === quote.id ? (
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="h-8 text-sm bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()} // Prevent select on input click
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit();
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                            />
                                        ) : (
                                            <p className="text-sm font-medium leading-relaxed break-words">
                                                {quote.text}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {editingId === quote.id ? (
                                            <>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={saveEdit}>
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={cancelEdit}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => startEditing(quote)}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete(quote.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default CustomQuotesModal;
