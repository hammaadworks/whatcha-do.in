import { BlurFade } from "@/components/ui/blur-fade";
import { SparklesText } from "@/components/ui/sparkles-text";
import { IconCloud } from "@/components/ui/icon-cloud";

const slugs = [
    "typescript",
    "javascript",
    "nextjs",
    "react",
    "html5",
    "css3",
    "tailwindcss",
    "shadcnui",
    "supabase",
    "postgresql",
    "git",
    "github",
    "vercel",
    "docker",
    "npm",
    "pnpm",
];

export function TechStackSection() {
    return (
        <section className="py-32 px-4 md:px-8 bg-muted/30 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center space-y-12">
                <BlurFade delay={0.1} inView>
                    <h2 className="text-5xl md:text-6xl font-bold font-mono tracking-tight text-foreground">
                        <SparklesText>The Unyielding Power</SparklesText> Behind Your Progress
                    </h2>
                </BlurFade>

                <BlurFade delay={0.3} inView>
                    <p className="text-xl md:text-2xl font-mono text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                        Built not just for performance, but for{" "}
                        <span className="font-bold text-foreground">uncompromising scalability and an unparalleled, seamless user experience.</span>
                    </p>
                </BlurFade>

                <BlurFade delay={0.5} inView>
                    <div className="relative w-full h-80 flex items-center justify-center">
                        <IconCloud iconSlugs={slugs} />
                    </div>
                </BlurFade>

                <BlurFade delay={0.7} inView>
                    <div className="text-lg md:text-xl font-mono text-muted-foreground max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">Frontend & Styling</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li><span className="font-semibold text-primary">Next.js (React), TypeScript:</span> Blazing-fast, dynamic, and intuitively responsive.</li>
                                <li><span className="font-semibold text-primary">Tailwind CSS, shadcn/ui, Aceternity UI:</span> Aesthetic triumph, "out-of-the-box wow design."</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">Backend & Infrastructure</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li><span className="font-semibold text-primary">Supabase (PostgreSQL, Auth, Realtime):</span> Ironclad security, real-time sync, unyielding reliability.</li>
                                <li><span className="font-semibold text-primary">Gemini CLI, BMAD:</span> Intelligent development, rapid iteration, future-proof foundation.</li>
                            </ul>
                        </div>
                    </div>
                </BlurFade>
            </div>
        </section>
    );
}
