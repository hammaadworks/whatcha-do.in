import PublicAppHeader from "@/components/layout/PublicAppHeader";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MagicCard } from "@/components/ui/magic-card";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { OrbitingCircles } from "@/components/ui/orbiting-circles"; // Import OrbitingCircles
import Link from "next/link";
import { Goal, Brain, Sparkles, Heart } from "lucide-react"; // Import icons

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicAppHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden rounded-none py-16 px-4 bg-gradient-to-br from-[#161616] to-[#222222]">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 py-16">
            <div className="flex-1 text-center md:text-left mb-10 md:mb-0">
              <BlurFade delay={0.2} inView>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-white">
                  <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-gray-300 hover:duration-300 text-white">
                    Unlock Your Full Potential
                  </AnimatedShinyText>
                  : Build Habits, Master Life, Achieve Your Dreams.
                </h1>
              </BlurFade>
              <BlurFade delay={0.4} inView>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  An intuitive, keyboard-first experience that empowers you to build positive routines and reflect on your progress, leading to a more organized and fulfilling life.
                </p>
              </BlurFade>
              <BlurFade delay={0.6} inView>
                <Link href="/login" className="flex justify-center md:justify-start">
                  <ShimmerButton className="shadow-lg"
                    shimmerColor="#ffffff"
                    background="linear-gradient(45deg, #00F5A0, #00D2B8)"
                    borderRadius="9999px"
                  >
                    <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-black lg:text-lg">
                      Start Your Journey
                    </span>
                  </ShimmerButton>
                </Link>
              </BlurFade>
            </div>
            <div className="flex-1 flex items-center justify-center relative h-96 w-full md:w-auto">
              <OrbitingCircles
                className="h-[30px] w-[30px] border-none bg-transparent"
                radius={80}
                duration={20}
                reverse={false}
                delay={20}
              >
                <Goal className="h-5 w-5 text-white" />
              </OrbitingCircles>
              <OrbitingCircles
                className="h-[30px] w-[30px] border-none bg-transparent"
                radius={120}
                duration={20}
                reverse={true}
                delay={20}
              >
                <Brain className="h-5 w-5 text-white" />
              </OrbitingCircles>
              <OrbitingCircles
                className="h-[30px] w-[30px] border-none bg-transparent"
                radius={160}
                duration={20}
                reverse={false}
                delay={20}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </OrbitingCircles>
              <OrbitingCircles
                className="h-[30px] w-[30px] border-none bg-transparent"
                radius={200}
                duration={20}
                reverse={true}
                delay={20}
              >
                <Heart className="h-5 w-5 text-white" />
              </OrbitingCircles>
            </div>
          </div>
        </section>

        {/* What Makes This Special Section */}
        <section className="py-20 bg-white rounded-none mt-0 px-4">
          <div className="container mx-auto">
            <BlurFade delay={0.8} inView>
              <h2 className="text-4xl font-bold text-center mb-12 text-[#212529]">What Makes This Special?</h2>
            </BlurFade>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <BlurFade delay={1.0} inView>
                <div>
                  <p className="text-lg text-[#495057] mb-4">
                    "whatcha-doin" stands out by combining robust habit/todo management with a unique journaling system and novel UX patterns. Its "keyboard-first" design prioritizes efficiency, while features like the "Two-Day Rule," "Grace Period," "Positive Urgency UI," and "Teleport-to-Journal Animation" create an engaging and motivating experience. The focus is on making habit building intuitive, rewarding, and deeply integrated with personal reflection.
                  </p>
                </div>
              </BlurFade>
              <BlurFade delay={1.2} inView>
                <div className="flex justify-center">
                  <MagicCard className="w-64 h-64 flex items-center justify-center text-[#495057] bg-gradient-to-br from-[#F8F9FA] to-[#DEE2E6] rounded-full shadow-xl">
                    <span className="text-xl font-semibold text-[#212529]">Insights & Data</span>
                  </MagicCard>
                </div>
              </BlurFade>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[#F8F9FA] rounded-none mt-0 px-4">
          <div className="container mx-auto">
            <BlurFade delay={1.4} inView>
              <h2 className="text-4xl font-bold text-center mb-12 text-[#212529]">Features</h2>
            </BlurFade>
            <BentoGrid className="mx-auto lg:max-w-4xl">
              <BlurFade delay={1.6} inView>
                <BentoCard
                  name="User & Profile Management"
                  description="Magic Link login, editable bio, shareable public profiles displaying public habits, todos, and journal entries."
                  className="lg:col-span-2"
                  Icon={() => <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white text-xl font-bold">U</div>}
                  background={<MagicCard className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-[#FFD700] to-[#FF8E53] rounded-lg"><span className="text-white text-2xl font-bold">Profiles</span></MagicCard>}
                  href="#"
                  cta="Learn More"
                />
              </BlurFade>
              <BlurFade delay={1.8} inView>
                <BentoCard
                  name="Habit Management"
                  description="Create, edit, delete recurring habits with public/private flags, three-column layout ('Today', 'Yesterday', 'The Pile'), Two-Day Rule, streak counters, quantitative goals."
                  className="lg:col-span-1"
                  Icon={() => <div className="w-10 h-10 bg-[#28A745] rounded-full flex items-center justify-center text-white text-xl font-bold">H</div>}
                  background={<MagicCard className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-[#A3D9B1] to-[#E9F7EC] rounded-lg"><span className="text-[#1E7E34] text-2xl font-bold">Habits</span></MagicCard>}
                  href="#"
                  cta="Learn More"
                />
              </BlurFade>
              <BlurFade delay={2.0} inView>
                <BentoCard
                  name="Todo Management"
                  description="Create, edit, delete one-off todos with public/private flags, Intelligent Notepad concept, 2-level deep sub-todos."
                  className="lg:col-span-1"
                  Icon={() => <div className="w-10 h-10 bg-[#FF8E53] rounded-full flex items-center justify-center text-white text-xl font-bold">T</div>}
                  background={<MagicCard className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-[#FFD700] to-[#FF8E53] rounded-lg"><span className="text-white text-2xl font-bold">Todos</span></MagicCard>}
                  href="#"
                  cta="Learn More"
                />
              </BlurFade>
              <BlurFade delay={2.2} inView>
                <BentoCard
                  name="Journaling & Data Entry"
                  description="Dual-view journal (Public/Private), automatic aggregation of notes from completed items, free-form text, date selector, completion modal with mood, work, duration, and notes."
                  className="lg:col-span-2"
                  Icon={() => <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white text-xl font-bold">J</div>}
                  background={<MagicCard className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-lg"><span className="text-white text-2xl font-bold">Journal</span></MagicCard>}
                  href="#"
                  cta="Learn More"
                />
              </BlurFade>
              <BlurFade delay={2.4} inView>
                <BentoCard
                  name="Novel UX Patterns"
                  description="Positive Urgency UI (Ambient Animated Background for 'Yesterday' column), Teleport-to-Journal Animation for action completion."
                  className="lg:col-span-1"
                  Icon={() => <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white text-xl font-bold">UX</div>}
                  background={<MagicCard className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-lg"><span className="text-white text-2xl font-bold">UX</span></MagicCard>}
                  href="#"
                  cta="Learn More"
                />
              </BlurFade>
              <BlurFade delay={2.6} inView>
                <BentoCard
                  name="Keyboard-First Design"
                  description="Optimized for speed and efficiency with intuitive keyboard shortcuts for core actions."
                  className="lg:col-span-1"
                  Icon={() => <div className="w-10 h-10 bg-[#212529] rounded-full flex items-center justify-center text-white text-xl font-bold">K</div>}
                  background={<MagicCard className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-[#F8F9FA] to-[#DEE2E6] rounded-lg"><span className="text-[#212529] text-2xl font-bold">Keyboard</span></MagicCard>}
                  href="#"
                  cta="Learn More"
                />
              </BlurFade>
            </BentoGrid>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-white rounded-none mt-0 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-10 text-[#212529]">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <MagicCard className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-[#DEE2E6] bg-[#F8F9FA] shadow-lg">
                <p className="text-lg italic mb-4 text-[#495057]">"WhatCha Doin' has transformed my daily routine! I'm more organized and productive than ever before."</p>
                <p className="font-semibold text-[#212529]">- Jane Doe</p>
              </MagicCard>
              <MagicCard className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-[#DEE2E6] bg-[#F8F9FA] shadow-lg">
                <p className="text-lg italic mb-4 text-[#495057]">"The best habit tracker out there. Simple, effective, and beautifully designed."</p>
                <p className="font-semibold text-[#212529]">- John Smith</p>
              </MagicCard>
              <MagicCard className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-[#DEE2E6] bg-[#F8F9FA] shadow-lg">
                <p className="text-lg italic mb-4 text-[#495057]">"I love the progress visualization. It keeps me motivated to achieve my goals."</p>
                <p className="font-semibold text-[#212529]">- Emily White</p>
              </MagicCard>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-[#F8F9FA] rounded-none mt-0 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold text-center mb-10 text-[#212529]">Frequently Asked Questions</h2>
            <div className="mb-6 p-6 border border-[#DEE2E6] rounded-lg bg-white shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-[#212529]">How do I start tracking a new habit?</h3>
              <p className="text-[#495057]">You can easily add a new habit from your dashboard by clicking the "Add Habit" button and filling in the details.</p>
            </div>
            <div className="mb-6 p-6 border border-[#DEE2E6] rounded-lg bg-white shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-[#212529]">Can I set daily reminders for my habits?</h3>
              <p className="text-[#495057]">Yes, our app allows you to set personalized daily reminders for each of your habits to keep you on track.</p>
            </div>
            <div className="p-6 border border-[#DEE2E6] rounded-lg bg-white shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-[#212529]">Is my data secure?</h3>
              <p className="text-[#495057]">Absolutely. We prioritize your data security and use industry-standard encryption to protect your information.</p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] text-center rounded-none mt-0 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <Link href="/login" className="flex justify-center">
              <ShimmerButton className="shadow-2xl"
                shimmerColor="#ffffff"
                background="linear-gradient(45deg, #212529, #495057)"
                borderRadius="9999px"
              >
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                  Sign Up Now
                </span>
              </ShimmerButton>
            </Link>
          </div>
        </section>
      </main>
      <footer className="bg-[#212529] text-white p-4 text-center mt-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">Contact Us</a>
          </div>
          <p>&copy; 2025 whatcha-doin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
