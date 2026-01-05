import Link from "next/link";
import { BlurFade } from "../ui/blur-fade";

interface PulseBadgeProps {
  link: string;
  bannerText: string;
  badgeText: string;
}
export function PulseBadge({
  link = "/me",
  bannerText,
  badgeText,
}: PulseBadgeProps) {return(
    <BlurFade delay={0.1} inView>
      <Link href={link}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-mono shadow-sm hover:bg-primary/15 transition-colors cursor-pointer">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {bannerText}
          <span className="text-xs font-mono text-primary-foreground bg-primary rounded-full px-2 py-0.5 ml-2">
            {badgeText}
          </span>
          <span
            className="ml-1 inline-block"
            style={{
              animation: "moveRightFade 1.5s ease-in-out infinite",
            }}
          >
            &gt;
          </span>
        </div>
      </Link>
    </BlurFade>)
}
