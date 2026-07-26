import Link from "next/link";
import { Zap, ArrowRight, BarChart3, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

const highlights = [
  {
    icon: BarChart3,
    title: "Real-time insights",
    description: "Track revenue, sales, and customer trends the moment they happen.",
  },
  {
    icon: Sparkles,
    title: "AI-powered guidance",
    description: "Get daily recommendations tailored to your business performance.",
  },
  {
    icon: ShieldCheck,
    title: "Built for reliability",
    description: "A clean, production-ready foundation your whole team can rely on.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 h-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">PulseOps AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">
              Open Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
          <Sparkles className="h-3.5 w-3.5" /> AI-Powered Business Operations
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl">
          Run your business with clarity, not guesswork.
        </h1>
        <p className="text-muted text-sm sm:text-base mt-4 max-w-xl">
          PulseOps AI brings your revenue, sales, customers, and inventory into a single, intelligent
          dashboard — so you always know what to do next.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <Link href="/dashboard">
            <Button size="md">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="md">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-10 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-card rounded-2xl p-5 text-left">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-3">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
