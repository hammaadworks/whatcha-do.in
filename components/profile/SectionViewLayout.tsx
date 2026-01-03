"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BookOpen, Flame, ListTodo, Sparkles, Target, UserCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionViewLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export const SectionViewLayout: React.FC<SectionViewLayoutProps> = ({ children, headerContent }) => {
  // We need to identify the children and map them to sections.
  // This assumes the children passed are the Sections themselves.
  // However, children is a ReactNode, which might be a fragment or array.

  // Convert children to an array to map them
  const allChildren = React.Children.toArray(children);

  // As per requirement: "remove motivations from the nav and place motivations quote inside each of the remaining sections"
  // We assume the LAST child is the Motivations/Vibe section based on standard order.
  // [Me, Actions, Habits, Journal, Motivations]
  const contentSections = allChildren.length > 1 ? allChildren.slice(0, -1) : allChildren;
  const footerQuoteSection = allChildren.length > 1 ? allChildren[allChildren.length - 1] : null;

  // Define the Focus Home Section (Header + Motivations)
  const FocusHomeSection = (
    <div
      className="flex flex-col items-center justify-center h-full min-h-[60vh] w-full max-w-xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
      {/* Header Content (Vibe/View Selectors) */}
      {headerContent && (
        <div className="w-full flex justify-center scale-110">
          {headerContent}
        </div>
      )}

      {/* Motivations Quote */}
      {footerQuoteSection && (
        <div className="w-full flex justify-center opacity-90">
          {footerQuoteSection}
        </div>
      )}
    </div>
  );

  // Final list of sections to render: [FocusHome, Me, Actions, Habits, Journal]
  const sectionsToRender = [FocusHomeSection, ...contentSections];

  // Define the section mapping based on the component types or order
  // Since we can't easily introspect the component type name in production builds sometimes,
  // we rely on the order or expected structure passed from ProfilePage/OwnerProfileView.

  // Expected Order in ProfileLayout:
  // 0. Focus Home (New)
  // 1. Bio/Identity (Usually grid) or CoreIdentitySection
  // 2. TargetsSection (Note: In PublicPage these are wrapped, in Owner they are MeSection. We assume MeSection is one block)
  // 3. ActionsSection
  // 4. HabitsSection
  // 5. JournalSection

  // Let's create a ref for each section container to scroll to
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null); // New ref for the scroll container
  const [activeSection, setActiveSection] = useState(0);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  // Helper to get Icon for index (Guestimation based on standard order)
  const getIconForIndex = (index: number) => {
    // Updated mapping based on: [FocusHome, Me, Actions, Habits, Journal]
    const icons = [
      { icon: Sparkles, label: "Focus Mode" },   // Focus Home Section
      { icon: UserCircle, label: "Me" },       // MeSection
      { icon: ListTodo, label: "Actions" },    // ActionsSection
      { icon: Flame, label: "Habits" },        // HabitsSection
      { icon: BookOpen, label: "Journal" }    // JournalSection
    ];

    // Safety fallback if extra children
    return icons[index] || { icon: Target, label: "Section" };
  };

  const scrollToSection = (index: number) => {
    const targetSection = sectionRefs.current[index];
    const container = containerRef.current;

    if (targetSection && container) {
      // Use offsetLeft relative to the container for precise scrolling
      const left = targetSection.offsetLeft;
      container.scrollTo({ left, behavior: "smooth" });
      setActiveSection(index);
    }
  };

  // Intersection Observer to update active state on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveSection(index);
          }
        });
      },
      {
        root: containerRef.current, // Use container as root
        threshold: 0.5 // 50% visibility
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sectionsToRender.length]); // Depend on sectionsToRender length


  return (
    <div className="flex flex-col w-full h-[calc(100dvh-180px)] bg-background mt-4">

      {/* Main Scroll Container - Horizontal */}
      <div
        ref={containerRef}
        className="flex flex-grow w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth no-scrollbar border-y border-border/40"
      >
        {sectionsToRender.map((child, index) => (
          <div
            key={index}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            data-index={index}
            className="min-w-full w-full h-full snap-start overflow-y-auto pt-4 pb-4 px-4 md:px-8 no-scrollbar"
          >
            <div className={cn(
              "w-full max-w-4xl mx-auto flex flex-col min-h-full transition-all duration-500",
              index === 0 && "justify-center" // Center content vertically for the Focus Home section
            )}>
              <div className={cn(
                "flex-grow",
                index === 0 && "flex flex-col justify-center" // Ensure child fills space in centered mode
              )}>
                {child}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dock */}
      {/*
                Static Bottom Center - Placed in normal flow below the scroll container.
                This ensures it sits above the AppFooter without overlapping or blocking.
            */}
      <div className="w-full flex justify-center py-4 z-[60]">
        <TooltipProvider delayDuration={0}>
          <div
            className="flex flex-row items-center gap-2 p-2 rounded-full bg-background/95 backdrop-blur-xl border border-border shadow-sm">
            {sectionsToRender.map((_, index) => {
              const { icon: Icon, label } = getIconForIndex(index);
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => scrollToSection(index)}
                      className={cn(
                        "p-2.5 rounded-full transition-all duration-300 transform hover:scale-110",
                        activeSection === index
                          ? "bg-primary text-primary-foreground shadow-md scale-110"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      aria-label={`Scroll to ${label}`}
                    >
                      <Icon size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={10} className="mb-2">
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};
