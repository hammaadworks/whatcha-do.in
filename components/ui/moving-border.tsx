"use client";
import React, {useEffect, useRef, useState} from "react";
import {motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform,} from "motion/react";
import {cn} from "@/lib/utils";

export function Button({
                           borderRadius = "1.75rem",
                           children,
                           as: Component = "button",
                           containerClassName,
                           borderClassName,
                           duration,
                           className,
                           ...otherProps
                       }: {
    borderRadius?: string;
    children: React.ReactNode;
    as?: any;
    containerClassName?: string;
    borderClassName?: string;
    duration?: number;
    className?: string;
    [key: string]: any;
}) {
    return (<Component
            className={cn("relative h-16 w-40 overflow-hidden bg-transparent p-[1px] text-xl", containerClassName,)}
            style={{
                borderRadius: borderRadius,
            }}
            {...otherProps}
        >
            <div
                className="absolute inset-0"
                style={{borderRadius: `calc(${borderRadius} * 0.96)`}}
            >
                <MovingBorder duration={duration} rx="30%" ry="30%">
                    <div
                        className={cn("h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-[0.8]", borderClassName,)}
                    />
                </MovingBorder>
            </div>

            <div
                className={cn("relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-sm text-white antialiased backdrop-blur-xl", className,)}
                style={{
                    borderRadius: `calc(${borderRadius} * 0.96)`,
                }}
            >
                {children}
            </div>
        </Component>);
}

export const MovingBorder = ({
                                 children, duration = 3000, rx, ry, ...otherProps
                             }: {
    children: React.ReactNode; duration?: number; rx?: string; ry?: string; [key: string]: any;
}) => {
    const pathRef = useRef<SVGPathElement>(null);
    const progress = useMotionValue<number>(0);
    const angle = useMotionValue<number>(0);

    const svgWidth = 100;
    const svgHeight = 100;

    // Change actualSvgDimensions from ref to state for reactivity
    const [actualSvgDimensions, setActualSvgDimensions] = useState({width: 0, height: 0});

    useEffect(() => {
        const pathElement = pathRef.current;
        if (!pathElement) return;
        const svgElement = pathElement.ownerSVGElement;
        if (!svgElement) return;

        const updateActualDimensions = () => {
            const svgRect = svgElement.getBoundingClientRect();
            setActualSvgDimensions({width: svgRect.width, height: svgRect.height});
        };

        updateActualDimensions(); // Set initial dimensions

        const resizeObserver = new ResizeObserver(() => {
            updateActualDimensions();
        });

        resizeObserver.observe(svgElement);

        return () => {
            resizeObserver.disconnect();
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount


    const getPath = React.useCallback(() => {
        const {width: currentWidth, height: currentHeight} = actualSvgDimensions; // Use state for dimensions
        if (currentWidth === 0 || currentHeight === 0) return ""; // Don't draw path if dimensions are zero

        // Interpret rx and ry as pixel values or percentages of actual dimensions
        const radiusPxX = rx ? (rx.includes('%') ? (parseFloat(rx) / 100) * currentWidth : parseFloat(rx)) : 0;
        const radiusPxY = ry ? (ry.includes('%') ? (parseFloat(ry) / 100) * currentHeight : parseFloat(ry)) : 0;

        // Convert pixel radii to viewBox units (0-100)
        const viewBoxRx = (radiusPxX / currentWidth) * svgWidth; // svgWidth is 100
        const viewBoxRy = (radiusPxY / currentHeight) * svgHeight; // svgHeight is 100

        const actualViewBoxRx = Math.min(viewBoxRx, svgWidth / 2);
        const actualViewBoxRy = Math.min(viewBoxRy, svgHeight / 2);

        const d = `
        M ${actualViewBoxRx},0
        L ${svgWidth - actualViewBoxRx},0
        A ${actualViewBoxRx},${actualViewBoxRy} 0 0 1 ${svgWidth},${actualViewBoxRy}
        L ${svgWidth},${svgHeight - actualViewBoxRy}
        A ${actualViewBoxRx},${actualViewBoxRy} 0 0 1 ${svgWidth - actualViewBoxRx},${svgHeight}
        L ${actualViewBoxRx},${svgHeight}
        A ${actualViewBoxRx},${actualViewBoxRy} 0 0 1 0,${svgHeight - actualViewBoxRy}
        L 0,${actualViewBoxRy}
        A ${actualViewBoxRx},${actualViewBoxRy} 0 0 1 ${actualViewBoxRx},0
        Z
      `;
        return d;
    }, [rx, ry, actualSvgDimensions]); // Add actualSvgDimensions to dependency array

    useAnimationFrame((time) => {
        const pathElement = pathRef.current;
        if (!pathElement || typeof pathElement.getTotalLength !== 'function') {
            return;
        }

        const length = pathElement.getTotalLength();
        if (length === 0) {
            return;
        }

        const pxPerMillisecond = length / duration;
        const currentProgress = (time * pxPerMillisecond) % length;
        progress.set(currentProgress);

        const point1 = pathElement.getPointAtLength(currentProgress);
        let point2 = null;

        if (currentProgress + 1 < length) {
            point2 = pathElement.getPointAtLength(currentProgress + 1);
        } else {
            point2 = pathElement.getPointAtLength((currentProgress + 1) % length);
        }

        if (point1 && point2) {
            const scaleX = actualSvgDimensions.width / svgWidth;
            const scaleY = actualSvgDimensions.height / svgHeight;

            const p1x = point1.x * scaleX;
            const p1y = point1.y * scaleY;
            const p2x = point2.x * scaleX;
            const p2y = point2.y * scaleY;

            const angleRad = Math.atan2(p2y - p1y, p2x - p1x);
            angle.set(angleRad * (180 / Math.PI));
        }
    });

    const x = useTransform(progress, (val) => {
        const pathElement = pathRef.current;
        if (!pathElement || pathElement.getTotalLength() === 0) {
            return 0; // Return a default value if path is not ready or empty
        }
        const point = pathElement.getPointAtLength(val);
        return point ? (point.x / svgWidth) * actualSvgDimensions.width : 0;
    },);
    const y = useTransform(progress, (val) => {
        const pathElement = pathRef.current;
        if (!pathElement || pathElement.getTotalLength() === 0) {
            return 0; // Return a default value if path is not ready or empty
        }
        const point = pathElement.getPointAtLength(val);
        return point ? (point.y / svgHeight) * actualSvgDimensions.height : 0;
    },);
    const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%) rotate(${angle}deg)`;

    return (<>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="absolute h-full w-full"
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                {...otherProps}
            >
                <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0"
                    d={getPath()}
                    ref={pathRef}
                />
            </svg>
            <motion.div
                style={{
                    position: "absolute", top: 0, left: 0, display: "inline-block", transform,
                }}
            >
                {children}
            </motion.div>
        </>);
};
