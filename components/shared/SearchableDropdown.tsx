"use client";

import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableDropdownProps {
    options: { id: string; label: string }[];
    onSelect: (id: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    disabled?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    options,
    onSelect,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyMessage = "No options found.",
    className,
    disabled = false
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter(option => 
            option.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const handleSelect = (id: string) => {
        onSelect(id);
        setOpen(false);
        setSearch("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", className)}
                    disabled={disabled}
                >
                    {placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0 px-0"
                    />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        <ul className="grid gap-1">
                            {filteredOptions.map((option) => (
                                <li key={option.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option.id)}
                                        className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                                    >
                                        <span className="truncate block w-full">{option.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
