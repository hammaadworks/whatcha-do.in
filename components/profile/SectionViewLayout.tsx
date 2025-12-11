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
    const childrenArray = React.Children.toArray(children);
    
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
        // This is a heuristic. Ideally, we'd pass explicit props, but we are wrapping children.
        // Let's try to map by index for now.
        const icons = [
            { icon: UserCircle, label: "Identity" }, // Bio/Identity
            { icon: Target, label: "Targets" },     // Targets
            { icon: ListTodo, label: "Actions" },   // Actions
            { icon: Flame, label: "Habits" },       // Habits
            { icon: BookOpen, label: "Journal" },   // Journal
            { icon: Quote, label: "Vibe" },         // Motivations
        ];
        return icons[index % icons.length];
    };

    const scrollToSection = (index: number) => {
        sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                threshold: 0.6, // Wait until 60% of the slide is visible to switch active state
            }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [childrenArray.length]);


    return (
        <div className="relative w-full h-[100dvh] bg-background">
            
            {/* Main Scroll Container */}
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
                {childrenArray.map((child, index) => (
                    <div 
                        key={index}
                        ref={(el) => { sectionRefs.current[index] = el; }}
                        data-index={index}
                        className="w-full h-full snap-start flex flex-col justify-start pt-20 pb-24 px-4 md:px-8 overflow-hidden"
                    >
                         {/* 
                            We wrap each child in a container that takes full height.
                            Using 'h-full' and 'overflow-y-auto' to allow internal scrolling 
                            ONLY if content exceeds the viewport slide.
                         */}
                        <div className="w-full max-w-4xl mx-auto h-full overflow-y-auto no-scrollbar pb-10">
                             {child}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Navigation Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                <TooltipProvider delayDuration={0}>
                <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-lg">
                    {childrenArray.map((_, index) => {
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
                                <TooltipContent sideOffset={10} className="mb-2">
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
