// components/ui/tour.tsx
import React from 'react';

// Interface for a single step in the tour
export interface TourStep {
  id: string;
  title: string;
  content: string;
}

export const Step = ({ children }: { children: React.ReactNode }) => {
  return <div className="step">{children}</div>;
};

export const Tour = ({ children }: { children: React.ReactNode }) => {
  return <div className="tour">{children}</div>;
};