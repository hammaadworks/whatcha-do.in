'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Clock, LocateFixed, Search, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// ... (keep helper functions: getFormattedLocalTime, getFriendlyTimeZoneName)

// ... (keep helper functions)
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
  id: string; 
  label: string; 
  currentTime: string; 
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

  useEffect(() => {
            const generateTimezoneOptions = () => {
              try {
                const supportedTimezones = Intl.supportedValuesOf('timeZone');
                const now = new Date(); 
                const options: TimezoneOption[] = supportedTimezones.map(tz => ({
                  id: tz,
                  label: getFriendlyTimeZoneName(tz, now),
                  currentTime: getFormattedLocalTime(tz, now),
                })).sort((a, b) => a.label.localeCompare(b.label)); 
                setTimezoneOptions(options);
              } catch (e) {
                            console.error("Intl.supportedValuesOf not supported", e);
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

  const isAutoDetectedCurrent = currentTimezone === Intl.DateTimeFormat().resolvedOptions().timeZone;

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
            <Clock className="w-4 h-4 text-primary/70" />
            <span className="font-mono text-xs">{currentLocalTimeFormatted}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleAutoDetect} className="h-6 text-xs px-2 hover:bg-accent/50">
            <LocateFixed className="mr-1 h-3 w-3" /> Auto-detect
        </Button>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-xs h-9 bg-background/50 hover:bg-accent/50 transition-colors border-input/60" 
          >
            <span className="truncate">
                {timezoneOptions.find(option => option.id === currentTimezone)?.label || "Select timezone..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0 z-[60] pointer-events-auto shadow-xl border-border/60 backdrop-blur-sm bg-popover/95 force-native-cursor max-h-[350px] overflow-y-auto" align="start">
          <div className="flex flex-col">
            <div className="flex items-center border-b border-border/50 px-3 py-2 bg-muted/20">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
              <Input
                placeholder="Search by city, country or offset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/70 border-none focus-visible:ring-0 shadow-none px-0"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 force-native-cursor">
                {/* Auto Detect Option */}
                <div
                  onClick={handleAutoDetect}
                  className={cn(
                    "group relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm outline-none transition-all duration-200",
                    isAutoDetectedCurrent ? "bg-primary/10 text-primary" : "hover:bg-accent/70 hover:text-accent-foreground text-foreground/80"
                  )}
                >
                  <div className={cn("mr-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors", isAutoDetectedCurrent ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50")}>
                      {isAutoDetectedCurrent && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-xs">Auto-detect</span>
                      <span className="text-[10px] text-muted-foreground truncate">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                  </div>
                </div>
                
                {filteredTimezoneOptions.length === 0 && (
                    <div className="py-8 flex flex-col items-center justify-center text-center text-sm text-muted-foreground/60 gap-2">
                        <Globe className="h-8 w-8 opacity-20" />
                        <span>No timezone found.</span>
                    </div>
                )}

                {filteredTimezoneOptions.length > 0 && <div className="h-px bg-border/40 my-2 mx-2" />}

                {filteredTimezoneOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleTimezoneSelect(option.id)}
                    className={cn(
                        "group relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-all duration-200 mb-0.5",
                        currentTimezone === option.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/60 hover:text-accent-foreground text-foreground/80"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4 shrink-0 transition-opacity duration-200",
                        currentTimezone === option.id ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    <div className="flex justify-between items-center w-full overflow-hidden gap-2">
                        <span className="truncate text-xs leading-relaxed" title={option.label}>{option.label}</span>
                        <span className="text-muted-foreground/60 text-[10px] font-mono whitespace-nowrap bg-muted/30 px-1.5 py-0.5 rounded">{option.currentTime}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};