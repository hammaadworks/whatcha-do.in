"use client";

import React from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { LayoutGrid, Sparkles } from "lucide-react";
import { ToggleButtonGroup } from "@/components/shared/ToggleButtonGroup";

export const ViewSelector = () => {
  const { layoutMode, setLayoutMode } = useUiStore();

  const VIEW_OPTIONS = [
    { id: "card", label: "Card View", icon: LayoutGrid },
    { id: "section", label: "Focus Mode", icon: Sparkles }
  ];

  return (
    <ToggleButtonGroup
      options={VIEW_OPTIONS}
      selectedValue={layoutMode}
      onValueChange={(value) => setLayoutMode(value as "card" | "section")}
    />
  );
};