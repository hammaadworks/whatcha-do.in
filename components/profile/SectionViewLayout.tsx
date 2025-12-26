"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { 
    Fingerprint, 
    ListTodo, 
    Flame, 
    BookOpen, 
    Quote, 
    Target,
    UserCircle 
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionViewLayoutProps {
    children: React.ReactNode;
}

export const SectionViewLayout: React.FC<SectionViewLayoutProps> = ({ children }) => {
    // We need to identify the children and map them to sections.
    // This assumes the children passed are the Sections themselves.
    // However, children is a ReactNode, which might be a fragment or array.
    
    // Convert children to an array to map them
    const allChildren = React.Children.toArray(children);
    
    // As per requirement: "remove motivations from the nav and place motivations quote inside each of the remaining sections"
    // We assume the LAST child is the Motivations/Vibe section based on standard order.
    // [Me, Actions, Habits, Journal, Motivations]
    const mainSections = allChildren.length > 1 ? allChildren.slice(0, -1) : allChildren;
    const footerQuoteSection = allChildren.length > 1 ? allChildren[allChildren.length - 1] : null;

    // Define the section mapping based on the component types or order
    // Since we can't easily introspect the component type name in production builds sometimes,
    // we rely on the order or expected structure passed from ProfilePage/OwnerProfileView.
    
    // Expected Order in ProfileLayout:
    // 1. Bio/Identity (Usually grid) or CoreIdentitySection
    // 2. TargetsSection
    // 3. ActionsSection
    // 4. HabitsSection
    // 5. JournalSection
    // 6. MotivationsSection
    
    // Let's create a ref for each section container to scroll to
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeSection, setActiveSection] = useState(0);
    const isLargeScreen = useMediaQuery('(min-width: 1024px)');

    // Helper to get Icon for index (Guestimation based on standard order)
    const getIconForIndex = (index: number) => {
        // Updated mapping based on: [Me (Identity+Targets), Actions, Habits, Journal]
        // Removed "Vibe" from nav as it is now embedded in each section
        const icons = [
            { icon: UserCircle, label: "Me" },      // CoreIdentitySection (includes Bio, Identity, Targets)
            { icon: ListTodo, label: "Actions" },   // ActionsSection
            { icon: Flame, label: "Habits" },       // HabitsSection
            { icon: BookOpen, label: "Journal" },   // JournalSection
        ];
        
        // Safety fallback if extra children
        return icons[index] || { icon: Target, label: "Section" };
    };

    const scrollToSection = (index: number) => {
        sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        setActiveSection(index);
    };

    // Intersection Observer to update active state on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActiveSection(index);
                    }
                });
            },
            {
                root: null, // viewport
                threshold: 0.5, // 50% visibility
            }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [mainSections.length]); // Depend on mainSections length


    return (
        <div className="flex flex-col w-full h-[calc(100dvh-180px)] bg-background mt-4">
            
            {/* Main Scroll Container - Horizontal */}
            <div className="flex flex-grow w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth no-scrollbar border-y border-border/40">
                {mainSections.map((child, index) => (
                    <div 
                        key={index}
                        ref={(el) => { sectionRefs.current[index] = el; }}
                        data-index={index}
                        className="min-w-full w-full h-full snap-start overflow-y-auto pt-4 pb-4 px-4 md:px-8 no-scrollbar"
                    >
                        <div className="w-full max-w-4xl mx-auto flex flex-col min-h-full">
                             <div className="flex-grow">
                                 {child}
                             </div>
                             
                             {/* Render the Motivations Quote at the bottom of each section */}
                             {footerQuoteSection && (
                                 <div className="mt-8 pb-8 opacity-80 scale-90 origin-bottom">
                                     {footerQuoteSection}
                                 </div>
                             )}
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
                <div className="flex flex-row items-center gap-2 p-2 rounded-full bg-background/95 backdrop-blur-xl border border-border shadow-sm">
                    {mainSections.map((_, index) => {
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
