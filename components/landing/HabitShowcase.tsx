"use client";

import React from "react";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {Flame, Ghost, History, Sparkles, Zap, Timer} from "lucide-react"; // Added Timer for Grace Period
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"; // For tooltips
import { ChevronDownIcon } from "@radix-ui/react-icons";

// Simplified HabitChip component for illustration purposes
const IllustratedHabitChip = ({
                                  label,
                                  stateIcon: StateIcon,
                                  stateStyles,
                                  streak,
                                  isJunked = false,
                                  description = "",
                              }: {
    label: string;
    stateIcon: React.ElementType;
    stateStyles: string;
    streak: number;
    isJunked?: boolean;
    description?: string;
}) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-xl py-2 px-3 border transition-all w-full justify-between",
                        isJunked
                            ? "bg-muted/30 text-muted-foreground border-dashed border-border/60"
                            : "bg-card text-card-foreground border-border/60 shadow-sm"
                    )}
                >
                    <span className="font-semibold text-sm truncate">{label}</span>
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                        stateStyles
                    )}>
                        <StateIcon size={12} className="shrink-0"/>
                        <span>{streak}</span>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{description}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

// Box component for Today, Yesterday, Pile
const HabitBox = ({
                      title,
                      description,
                      children,
                      className
                  }: { title: string; description: string; children: React.ReactNode; className?: string }) => (
    <div className={cn("flex flex-col gap-4 p-6 rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/50 shadow-lg h-full min-h-[280px]", className)}>
        <h3 className="text-xl font-bold text-foreground font-mono">{title}</h3>
        <p className="text-muted-foreground text-sm flex-grow">{description}</p>
        <div className="flex flex-col gap-2">
            {children}
        </div>
    </div>
);

export function HabitShowcase() {
    return (
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Today Box */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: 0.2, duration: 0.5}}
            >
                <HabitBox
                    title="Today"
                    description="Your active habits that are waiting to be completed today. Keep your streak alive!"
                    className="border-chart-4/50 shadow-chart-4/20"
                >
                    <IllustratedHabitChip label="Meditate" stateIcon={Flame} stateStyles="bg-chart-4/10 text-chart-4"
                                          streak={7} description="Daily meditation for focus."/>
                    <IllustratedHabitChip label="Journal" stateIcon={Flame} stateStyles="bg-chart-4/10 text-chart-4"
                                          streak={3} description="Write 500 words."/>
                </HabitBox>
            </motion.div>

            {/* Yesterday Box */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: 0.4, duration: 0.5}}
            >
                <HabitBox
                    title="Yesterday"
                    description="Habits you completed yesterday. This is where your progress accumulates."
                    className="border-chart-2/50 shadow-chart-2/20"
                >
                    <IllustratedHabitChip label="Read" stateIcon={History} stateStyles="bg-chart-2/10 text-chart-2"
                                          streak={15} description="Read for 30 minutes."/>
                    <IllustratedHabitChip label="Exercise" stateIcon={History} stateStyles="bg-chart-2/10 text-chart-2"
                                          streak={10} description="30 min workout."/>
                </HabitBox>
            </motion.div>

            {/* Pile Box (Lively & Junked) */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: 0.6, duration: 0.5}}
            >
                <HabitBox
                    title="Pile"
                    description="Your current habits that are not due today, or junked habits that need revival."
                    className="border-secondary/50 shadow-secondary/20"
                >
                    <IllustratedHabitChip label="Code" stateIcon={Sparkles} stateStyles="bg-secondary text-secondary-foreground/70"
                                          streak={20} description="Work on project for 1 hour."/>
                    <IllustratedHabitChip label="Learn Italian" stateIcon={Ghost}
                                          stateStyles="bg-destructive/10 text-destructive/70" streak={-2} isJunked={true}
                                          description="Practice Italian for 15 mins."/>
                    <IllustratedHabitChip label="Read News" stateIcon={History}
                                          stateStyles="bg-green-500/10 text-green-500" streak={1} isJunked={false}
                                          description="Read daily news for 10 mins."/>
                    <IllustratedHabitChip label="Meditate (Morning)" stateIcon={Sparkles}
                                          stateStyles="bg-orange-500/10 text-orange-500" streak={10} isJunked={false}
                                          description="Morning meditation for 20 mins."/>
                </HabitBox>
            </motion.div>

            {/* Grace Period Illustration */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: 0.8, duration: 0.5}}
            >
                <HabitBox
                    title="Grace Period"
                    description="Missed a habit yesterday? The Grace Period gives you a chance to complete it today without breaking your streak. Don't let a single miss derail your progress!"
                    className="border-primary/50 bg-gradient-to-tr from-primary/10 to-transparent shadow-xl relative overflow-hidden text-center"
                >
                    {/* The grid background */}
                    <div className="absolute inset-0 bg-grid-small-primary/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] z-0"/>
                    <div className="relative z-10 flex flex-col items-center space-y-4">
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            <IllustratedHabitChip label="Workout" stateIcon={Zap} stateStyles="bg-chart-1/10 text-chart-1"
                                                  streak={5} description="Yesterday's missed workout."/>
                        <ChevronDownIcon className="text-primary animate-pulse h-4 w-4 self-center"/><ChevronDownIcon className="text-primary animate-pulse h-6 w-6 self-center"/><Timer size={48} className="text-primary animate-pulse"/>
                            <ChevronDownIcon className="text-primary animate-pulse h-6 w-6 self-center"/>
                            <ChevronDownIcon className="text-primary animate-pulse h-4 w-4 self-center"/>
                            <IllustratedHabitChip label="Workout (Completed)" stateIcon={Flame}
                                                  stateStyles="bg-chart-4/10 text-chart-4" streak={6}
                                                  description="Workout done in grace period!"/>
                        </div>
                    </div>
                </HabitBox>
            </motion.div>
        </div>
    );
}
