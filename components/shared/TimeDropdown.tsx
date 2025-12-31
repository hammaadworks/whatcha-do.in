"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TimeDropdownProps {
  value: string | null; // HH:mm format or null
  onChange: (time: string | null) => void;
  disabled?: boolean;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutesProgression = ["00", "15", "30", "45"];

const TimeDropdown: React.FC<TimeDropdownProps> = ({ value, onChange, disabled }) => {
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    } else {
      setSelectedHour(null);
      setSelectedMinute(null);
    }
  }, [value]);

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      onChange(`${hour}:${selectedMinute}`);
    } else {
      // If minute is not selected, set to 00 by default for consistency
      onChange(`${hour}:00`);
    }
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      onChange(`${selectedHour}:${minute}`);
    } else {
      // If hour is not selected, set to 00 by default for consistency
      onChange(`00:${minute}`);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  // Helper to format 24h time to 12h AM/PM for display in SelectTrigger
  const formatTimeDisplay = (hour: string | null, minute: string | null) => {
    if (hour === null || minute === null) return "Set time";
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const displayValue = formatTimeDisplay(selectedHour, selectedMinute);

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleHourChange} value={selectedHour || ""} disabled={disabled}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      :
      <Select onValueChange={handleMinuteChange} value={selectedMinute || ""} disabled={disabled}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutesProgression.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={handleClear} disabled={disabled}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TimeDropdown;
