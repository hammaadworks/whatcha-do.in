import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { toZonedTime } from 'date-fns-tz';
import { ShineBorder } from '@/components/ui/shine-border';
import { motion, AnimatePresence } from "framer-motion";

interface UserClockProps {
  timezone: string;
  className?: string;
  isOwner?: boolean;
  viewerTimezone?: string;
}

// Helper to get consistent short timezone abbreviations
const getConsistentTimeZoneName = (ianaTimezone: string, date: Date): string => {
  // Hardcoded preferred abbreviations for common IANA timezones
  const preferredAbbr: { [key: string]: string | ((date: Date) => string) } = {
    'Asia/Kolkata': 'IST',
    'Asia/Calcutta': 'IST', // Added mapping for Asia/Calcutta
    'America/New_York': (d: Date) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortGeneric' }).format(d).includes('Daylight') ? 'EDT' : 'EST',
    'America/Los_Angeles': (d: Date) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'shortGeneric' }).format(d).includes('Daylight') ? 'PDT' : 'PST',
    'America/Chicago': (d: Date) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'shortGeneric' }).format(d).includes('Daylight') ? 'CDT' : 'CST',
    'Europe/London': (d: Date) => new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/London', timeZoneName: 'shortGeneric' }).format(d).includes('Daylight') ? 'BST' : 'GMT',
    'UTC': 'UTC',
  };

  if (preferredAbbr[ianaTimezone]) {
    const abbr = preferredAbbr[ianaTimezone];
    return typeof abbr === 'function' ? abbr(date) : abbr;
  }

  try {
      // Fallback: Try Intl.DateTimeFormat with 'short' using formatToParts to avoid getting date/time
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: ianaTimezone, timeZoneName: 'short' }).formatToParts(date);
      let shortName = parts.find(p => p.type === 'timeZoneName')?.value || '';

      // If it's still a GMT offset after trying 'short', try 'shortGeneric'
      if (shortName.includes('GMT') || shortName.includes('Coordinated Universal Time')) {
          const genericParts = new Intl.DateTimeFormat('en-US', { timeZone: ianaTimezone, timeZoneName: 'shortGeneric' }).formatToParts(date);
          const genericName = genericParts.find(p => p.type === 'timeZoneName')?.value || '';
          
          if (!genericName.includes('GMT') && genericName !== '') {
              return genericName; // Use generic name if it's not GMT and not empty
          }
          return shortName; // Return the short GMT name if no better generic name
      }

      return shortName; // Return the short name if not GMT or already a good abbreviation
  } catch (e) {
      return '';
  }
};

export const UserClock: React.FC<UserClockProps> = ({ timezone, className, isOwner, viewerTimezone }) => {
  const [timeString, setTimeString] = useState<string>('');
  const [diffInfo, setDiffInfo] = useState<{ text: string; isSame: boolean }>({ text: '', isSame: true });
  const [showDate, setShowDate] = useState<boolean>(false); // New state for showing date
  const [displayDateContent, setDisplayDateContent] = useState<string>(''); // New state for formatted date

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        
        // Use formatToParts for explicit extraction of weekday, hour, minute, and dayPeriod
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit', // Changed to 2-digit for leading zero (09:30)
            minute: '2-digit',
            hour12: true,
            weekday: 'short',
        }).formatToParts(now);

        let weekday = '';
        let hour = '';
        let minute = '';
        let dayPeriod = '';

        for (const part of parts) {
            if (part.type === 'weekday') weekday = part.value;
            if (part.type === 'hour') hour = part.value;
            if (part.type === 'minute') minute = part.value;
            if (part.type === 'dayPeriod') dayPeriod = part.value;
        }

        const timeOnly = `${hour}:${minute} ${dayPeriod}`;
        const timeZoneAbbr = getConsistentTimeZoneName(timezone, now);
        
        // Combine as "Mon, 09:34 PM, IST" (Added comma)
        setTimeString(`${weekday}, ${timeOnly}, ${timeZoneAbbr}`);

        // Format date for display
        setDisplayDateContent(new Intl.DateTimeFormat('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).format(now));

        // 2. Calculate the difference relative to the viewer's local time
        const localTimezone = viewerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Helper to get "face value" timestamp
        const getFaceValueMs = (date: Date, tz: string) => {
             try {
                const str = date.toLocaleString('en-US', { timeZone: tz });
                return new Date(str).getTime();
             } catch (e) {
                return date.getTime();
             }
        };

        const targetFaceMs = getFaceValueMs(now, timezone);
        const localFaceMs = getFaceValueMs(now, localTimezone);
        
        const diffMs = targetFaceMs - localFaceMs;
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        
        if (Math.abs(diffMinutes) < 1) {
             setDiffInfo({ text: 'Same time as you', isSame: true });
        } else {
            const absMinutes = Math.abs(diffMinutes);
            const hours = Math.floor(absMinutes / 60);
            const minutes = absMinutes % 60;
            
            let durationStr = '';
            if (hours > 0) durationStr += `${hours}h`;
            if (minutes > 0) durationStr += ` ${minutes}m`;
            durationStr = durationStr.trim();
            
            if (!durationStr) durationStr = '0m';

            const direction = diffMinutes > 0 ? "ahead of you" : "behind you";
            setDiffInfo({ text: `${durationStr} ${direction}`, isSame: false });
        }

      } catch (e) {
        setTimeString('Invalid Timezone');
        setDiffInfo({ text: '', isSame: true });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, viewerTimezone]);

  const handleClick = () => {
    setShowDate(true);
    setTimeout(() => {
      setShowDate(false);
    }, 2000); // Revert after 2 seconds
  };

  if (!timeString) return null;

  return (
    <div className={cn("flex flex-col items-end", className)}>
      {/* Main Pill Wrapper - This is the element that gets the border and background */}
      <div
        className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full border border-transparent bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground shadow-sm hover:bg-accent/50 transition-colors cursor-pointer select-none"
        title={`Current time in ${timezone}`}
        onClick={handleClick}
      >
        {/* ShineBorder as an absolute overlay within this relative div */}
        <ShineBorder
            borderWidth={1}
            duration={8} // Adjust duration for a subtle, continuous animation
            shineColor={["hsl(var(--primary))", "hsl(var(--primary-foreground))"]} // Use theme colors
            className="rounded-full" // Ensure the shine border matches the pill's border-radius
        />
        {/* Actual clock content, ensures it's above the shine border */}
        <span className="relative z-10 inline-flex items-center gap-2"> {/* Added z-10 and inline-flex for content */}
          <span className="relative flex h-2 w-2">
            {/* Theme color dot with slow heartbeat animation */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 duration-[3000ms]"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <AnimatePresence mode="wait"> {/* Use AnimatePresence to manage exit/enter animations */}
            {showDate ? (
              <motion.span
                key="date" // Unique key for date content
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="font-mono tracking-tight"
              >
                {displayDateContent}
              </motion.span>
            ) : (
              <motion.span
                key="time" // Unique key for time content
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="font-mono tracking-tight"
              >
                {timeString}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>
      
      {/* Subtitle for Time Difference */}
      {!diffInfo.isSame && !isOwner && (
        <div className="w-full text-center"> {/* Changed span to div, added w-full */}
            <span className="text-[10px] text-muted-foreground/80 font-medium mt-1 px-1 tracking-wide animate-in fade-in slide-in-from-top-1 duration-500">
                {diffInfo.text}
            </span>
        </div>
      )}
    </div>
  );
};
