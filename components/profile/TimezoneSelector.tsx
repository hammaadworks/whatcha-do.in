'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Clock, LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to get formatted local time in a specific timezone
const getFormattedLocalTime = (ianaTimezone: string, date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'shortOffset', // Show offset (e.g., GMT-05:00)
    }).format(date);
  } catch (e) {
    return 'Invalid Time';
  }
};

// Helper to get a user-friendly display name for an IANA timezone
const getFriendlyTimeZoneName = (ianaTimezone: string, date: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      timeZoneName: 'longGeneric', // e.g., "Eastern Time", "Indian Standard Time"
    }).formatToParts(date);

    const genericName = parts.find(p => p.type === 'timeZoneName')?.value;
    const offset = getFormattedLocalTime(ianaTimezone, date).match(/GMT[+-]\d{1,2}:\d{2}/)?.[0] || '';

    // If generic name is too broad (e.g. "Los Angeles Time", use the IANA ID)
    if (genericName && !genericName.includes('Coordinated Universal Time') && !genericName.includes('GMT')) {
        return `${genericName} (${ianaTimezone.split('/').pop()?.replace(/_/g, ' ') || ianaTimezone}) ${offset}`;
    }
    return `${ianaTimezone.replace(/_/g, ' ').replace('/', ', ')} ${offset}`;
  } catch (e) {
    return ianaTimezone;
  }
};


interface TimezoneOption {
  id: string; // IANA identifier, e.g., 'America/New_York'
  label: string; // User-friendly display name with offset, e.g., 'Eastern Time - New York (GMT-05:00)'
  currentTime: string; // Current time in that timezone, e.g., '10:30 AM'
}

interface TimezoneSelectorProps {
  currentTimezone?: string;
  onTimezoneChange: (newTimezone: string) => void;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ currentTimezone, onTimezoneChange }) => {
  const [open, setOpen] = useState(false);
  const [timezoneOptions, setTimezoneOptions] = useState<TimezoneOption[]>([]);
  const [currentLocalTimeFormatted, setCurrentLocalTimeFormatted] = useState<string>('');
  const [search, setSearch] = useState('');

  // Memoize the list of timezone options for performance
  useEffect(() => {
    const generateTimezoneOptions = () => {
      try {
        const supportedTimezones = Intl.supportedValuesOf('timeZone');
        const now = new Date(); // Use a single date for consistency
        const options: TimezoneOption[] = supportedTimezones.map(tz => ({
          id: tz,
          label: getFriendlyTimeZoneName(tz, now),
          currentTime: getFormattedLocalTime(tz, now),
        })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically for easier navigation
        setTimezoneOptions(options);
      } catch (e) {
        console.error("Intl.supportedValuesOf not supported", e);
        // Fallback with basic options if API is not supported
        setTimezoneOptions([
          { id: 'UTC', label: 'Coordinated Universal Time (UTC)', currentTime: getFormattedLocalTime('UTC'), },
          { id: 'America/New_York', label: 'Eastern Time - New York (GMT-05:00)', currentTime: getFormattedLocalTime('America/New_York'), },
          { id: 'Europe/London', label: 'London (GMT)', currentTime: getFormattedLocalTime('Europe/London'), },
          { id: 'Asia/Tokyo', label: 'Tokyo (GMT+09:00)', currentTime: getFormattedLocalTime('Asia/Tokyo'), },
        ]);
      }
    };
    generateTimezoneOptions();
  }, []);

  // Update current local time display for the selected timezone
  useEffect(() => {
    const updateTimeDisplay = () => {
      if (currentTimezone) {
        setCurrentLocalTimeFormatted(getFormattedLocalTime(currentTimezone));
      } else {
        setCurrentLocalTimeFormatted('Select timezone...');
      }
    };
    updateTimeDisplay();
    const interval = setInterval(updateTimeDisplay, 1000);
    return () => clearInterval(interval);
  }, [currentTimezone]);

  const handleAutoDetect = useCallback(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    onTimezoneChange(detected);
    setOpen(false);
  }, [onTimezoneChange]);

  const handleTimezoneSelect = useCallback((tzId: string) => {
    onTimezoneChange(tzId);
    setOpen(false);
  }, [onTimezoneChange]);

  // Determine if the detected timezone is the current one
  const isAutoDetectedCurrent = currentTimezone === Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Filter timezone options based on search input
  const filteredTimezoneOptions = useMemo(() => {
    if (!search) return timezoneOptions;
    const lowerSearch = search.toLowerCase();
    return timezoneOptions.filter(option =>
      option.label.toLowerCase().includes(lowerSearch) ||
      option.id.toLowerCase().includes(lowerSearch)
    );
  }, [timezoneOptions, search]);


  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-between">
        <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{currentLocalTimeFormatted}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleAutoDetect} className="h-7 text-xs">
            <LocateFixed className="mr-1 h-3 w-3" /> Auto-detect
        </Button>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-xs h-9" // Made width full
          >
            {timezoneOptions.find(option => option.id === currentTimezone)?.label || "Select timezone..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0"> {/* Use trigger width */}
          <Command>
            <CommandInput placeholder="Search timezone..." onValueChange={setSearch} value={search} />
            <CommandList>
              <CommandEmpty>No timezone found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={`Auto-detect ${Intl.DateTimeFormat().resolvedOptions().timeZone}`} // Include detected TZ for search
                  onSelect={handleAutoDetect}
                  className={cn("cursor-pointer font-semibold text-primary", isAutoDetectedCurrent && "bg-accent")}
                >
                  <Check className={cn("mr-2 h-4 w-4", isAutoDetectedCurrent ? "opacity-100" : "opacity-0")} />
                  Auto-detect ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </CommandItem>
                {filteredTimezoneOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label} // Search by label
                    onSelect={() => handleTimezoneSelect(option.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentTimezone === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex justify-between items-center w-full">
                        <span>{option.label}</span>
                        <span className="text-muted-foreground text-[0.7rem]">{option.currentTime}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
