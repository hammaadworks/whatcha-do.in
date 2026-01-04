import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TimeDropdownProps {
  value: string | null; // HH:mm format or null
  onChange: (time: string | null) => void;
  disabled?: boolean;
}

const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); // 01 to 12
const minutesProgression = ["00", "15", "30", "45"];
const ampmOptions = ["AM", "PM"];

const TimeDropdown: React.FC<TimeDropdownProps> = ({ value, onChange, disabled }) => {
  // Default to 11:59 PM if no value is set
  const [selectedHour, setSelectedHour] = useState<string | null>(value ? null : "11"); // 1-12
  const [selectedMinute, setSelectedMinute] = useState<string | null>(value ? null : "45"); // 00, 15, 30, 45
  const [selectedAmPm, setSelectedAmPm] = useState<"AM" | "PM">(value ? "AM" : "PM"); // AM or PM

  // Helper to convert 12-hour (with AM/PM) to 24-hour format
  const get24HourTime = (hour12: string | null, minute: string | null, ampm: "AM" | "PM") => {
    if (hour12 === null || minute === null) {
      // If any part is null, it means no selection, so return null for the whole time.
      return null;
    }

    let h = parseInt(hour12, 10);
    if (ampm === "PM" && h !== 12) {
      h += 12;
    } else if (ampm === "AM" && h === 12) {
      h = 0; // 12 AM (midnight) is 00 in 24-hour format
    }
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

  useEffect(() => {
    if (value) {
      const [h24, m] = value.split(':');
      let h = parseInt(h24, 10);
      let ampm: "AM" | "PM" = "AM";

      if (h >= 12) {
        ampm = "PM";
      }
      if (h === 0) { // 00:XX is 12 AM
        h = 12;
      } else if (h > 12) {
        h -= 12;
      }

      setSelectedHour(h.toString().padStart(2, '0'));
      setSelectedMinute(m);
      setSelectedAmPm(ampm);
    } else {
      // When value is null (cleared or initially null), default to 11:59 PM
      setSelectedHour("11");
      setSelectedMinute("45");
      setSelectedAmPm("PM"); 
    }
  }, [value]);

  const triggerChange = (
    newHour: string | null = selectedHour,
    newMinute: string | null = selectedMinute,
    newAmPm: "AM" | "PM" = selectedAmPm
  ) => {
    if (newHour === null && newMinute === null) {
      onChange(null);
    } else {
      onChange(get24HourTime(newHour, newMinute, newAmPm));
    }
  };

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
    triggerChange(hour, selectedMinute, selectedAmPm);
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
    triggerChange(selectedHour, minute, selectedAmPm);
  };

  const handleAmPmChange = (ampm: "AM" | "PM") => {
    setSelectedAmPm(ampm);
    triggerChange(selectedHour, selectedMinute, ampm);
  };

  const handleClear = () => {
    setSelectedHour("11");
    setSelectedMinute("45");
    setSelectedAmPm("PM");
    onChange(null); // Explicitly set the onChange to null, as it's intended to clear the selection.
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleHourChange} value={selectedHour || ""} disabled={disabled}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours12.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      :
      <Select onValueChange={handleMinuteChange} value={selectedMinute || ""} disabled={disabled}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutesProgression.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={handleAmPmChange} value={selectedAmPm} disabled={disabled}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {ampmOptions.map((option) => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
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
