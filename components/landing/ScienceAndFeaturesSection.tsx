"use client";

import { BentoGrid } from "@/components/ui/bento-grid";
import { FlipCard } from "@/components/ui/flip-card";
import {
    CalendarDays,
    MousePointerClick,
    Sliders,
    Rss,
    User,
    Quote,
    Brain,
    Zap,
    BookOpen,
    Activity,
    Clock
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";

const features = [
    {
        Icon: CalendarDays,
        name: "Two-Day Rule",
        description: "Miss one day? Cool. Miss two? Streak resets — sustainably.",
        cta: "Flip for the Science",
        background: <div />,
        className: "col-span-3 md:col-span-1",
        science: {
            title: "The Psychology of Consistency",
            description: "The Two-Day Rule is a powerful psychological hack that prevents the 'all-or-nothing' mindset. It allows for a day of rest or imperfection without breaking the chain of consistency, which is crucial for long-term habit formation."
        }
    },
    {
        Icon: MousePointerClick,
        name: "Action Chips",
        description: "Drag. Drop. Done. Brain-friendly productivity.",
        cta: "Flip for the Science",
        background: <div />,
        className: "col-span-3 md:col-span-2",
        science: {
            title: "Reducing Cognitive Load",
            description: "Action Chips turn tasks into tangible objects, reducing the cognitive load of decision-making. This visual, direct-manipulation interface makes it easier to start and complete tasks."
        }
    },
    {
        Icon: Sliders,
        name: "Intensity Slider",
        description: "100% and 20% both count. Effort matters.",
        cta: "Flip for the Science",
        background: <div />,
        className: "col-span-3 md:col-span-2",
        science: {
            title: "Variable Effort, Consistent Identity",
            description: "The Intensity Slider acknowledges that effort is not always 100%. By tracking effort, you reinforce your identity as 'someone who does the thing,' even on low-energy days. This is a core tenet of identity-based habits."
        }
    },
    {
        Icon: Rss,
        name: "Auto-Journal Feed",
        description: "Your growth, captured seamlessly.",
        cta: "Flip for the Science",
        background: <div />,
        className: "col-span-3 md:col-span-1",
        science: {
            title: "Automated Self-Reflection",
            description: "Journaling is a powerful tool for self-awareness, but it's often a habit in itself. By automating the process, we lower the barrier to entry, making it easy to see your progress and connect the dots over time."
        }
    },
    {
        Icon: User,
        name: "Public Profile",
        description: "Your \"Life Resume\" — streaks, habits, reflections.",
        cta: "Flip for the Science",
        background: <div />,
        className: "col-span-3 md:col-span-1",
        science: {
            title: "Social Accountability (The Good Kind)",
            description: "Sharing your progress can be a powerful motivator. Your public profile acts as a 'life resume,' showcasing your dedication and consistency. It's not about comparing yourself to others, but about being accountable to your own goals."
        }
    },
    {
        Icon: Brain,
        name: "Identity Anchoring",
        description: "You align each habit with the identity you want.",
        cta: "Flip for the Science",
        background: <div />,
        className: "col-span-3 md:col-span-2",
        science: {
            title: "The Power of Self-Perception",
            description: "True behavior change is identity change. By anchoring your habits to a desired identity (e.g., 'I am a writer' instead of 'I want to write'), you create a powerful feedback loop that reinforces your new self-image."
        }
    },
];

export function ScienceAndFeaturesSection() {
    return (
        <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-20 text-center">
                <BlurFade delay={0.2} inView>
                    <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tight mb-6">
                        Your identity-building toolkit.
                    </h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
                        Everything you need to turn ambitions into identity, one day at a time. Click on a card to reveal the science behind it.
                    </p>
                </BlurFade>
            </div>
            <BlurFade delay={0.6} inView>
                <BentoGrid>
                    {features.map((feature) => (
                        <div key={feature.name} className={feature.className}>
                            <FlipCard
                                frontContent={
                                    <>
                                        <feature.Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-neutral-300" />
                                        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                                            {feature.name}
                                        </h3>
                                        <p className="max-w-lg text-neutral-500 dark:text-neutral-400">{feature.description}</p>
                                        <p className="text-sm text-primary mt-4">{feature.cta}</p>
                                    </>
                                }
                                backContent={
                                    <>
                                        <h3 className="text-xl font-semibold text-primary">
                                            {feature.science.title}
                                        </h3>
                                        <p className="max-w-lg text-foreground">{feature.science.description}</p>
                                        <p className="text-sm text-primary mt-4">Click to flip back</p>
                                    </>
                                }
                            />
                        </div>
                    ))}
                </BentoGrid>
            </BlurFade>
        </section>
    );
}