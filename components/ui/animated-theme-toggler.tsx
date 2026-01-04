"use client"

import {useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle} from "react"
import {Moon, Sun} from "lucide-react"
import {flushSync} from "react-dom"
import {useTheme} from "next-themes"

import {cn} from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number
}

export interface AnimatedThemeTogglerRef {
    toggle: () => void;
}

export const AnimatedThemeToggler = forwardRef<AnimatedThemeTogglerRef, AnimatedThemeTogglerProps>(({
                                         className, duration = 400, ...props
                                     }, ref) => {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return
        
        const isDark = resolvedTheme === "dark"
        const newTheme = isDark ? "light" : "dark"

        // Fallback for browsers without View Transitions
        if (!document.startViewTransition) {
            setTheme(newTheme)
            return
        }

        // Use View Transitions API for a smoother animation
        await document.startViewTransition(() => {
            flushSync(() => {
                setTheme(newTheme)
            })
        }).ready

        // Get the position of the button to create a circular reveal animation
        const {top, left, width, height} = buttonRef.current.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(Math.max(left, window.innerWidth - left), Math.max(top, window.innerHeight - top))

        // Animate the clipPath for the view transition
        document.documentElement.animate({
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`,],
        }, {
            duration, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)",
        })
    }, [resolvedTheme, setTheme, duration])

    useImperativeHandle(ref, () => ({
        toggle: toggleTheme,
    }));

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground flex-shrink-0", className)}
                {...props}
            >
                <span className="sr-only">Toggle theme</span>
            </button>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (<button
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-shrink-0", className)}
            {...props}
        >
            {isDark ? (<Sun className="h-6 w-6 transition-all"/>) : (<Moon className="h-6 w-6 transition-all"/>)}
            <span className="sr-only">Toggle theme</span>
        </button>)
})

AnimatedThemeToggler.displayName = "AnimatedThemeToggler";
