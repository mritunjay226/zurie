import Link from "next/link"
import { Sparkles, ArrowRight, Bot, Cpu, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.76_0.17_75_/_0.08),transparent_50%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-100">AI Studio</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">
            Sign In
          </Link>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center z-10 flex-1 flex flex-col justify-center items-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md animate-bounce-slow">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Now Live: Llama 3.1 & DeepSeek V3</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-450 bg-clip-text text-transparent">
            Synthesize Next-Gen <br />
            <span className="bg-gradient-to-r from-primary via-amber-400 to-amber-500 bg-clip-text text-transparent">
              AI Generation Pipelines
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-zinc-400 text-sm sm:text-base leading-relaxed">
            Run text completion, image generation, and code playground tasks through a single integrated workflow interface, powered by InsForge.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8 shadow-lg shadow-primary/20 text-sm">
            <Link href="/sign-up" className="flex items-center gap-2">
              Launch Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/80 hover:text-zinc-50 rounded-xl px-8 text-sm text-zinc-300">
            <Link href="/sign-in">Developer Console</Link>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-16 max-w-3xl">
          <div className="p-5 rounded-2xl border border-zinc-900/60 bg-zinc-900/20 backdrop-blur-sm text-left space-y-2">
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm text-zinc-100">LLM Chat Playground</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Engage with state-of-the-art models including Claude 3.5 & GPT-4o.</p>
          </div>
          <div className="p-5 rounded-2xl border border-zinc-900/60 bg-zinc-900/20 backdrop-blur-sm text-left space-y-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm text-zinc-100">Code Optimization</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Generate structured modules and scripts instantly with code synthesis.</p>
          </div>
          <div className="p-5 rounded-2xl border border-zinc-900/60 bg-zinc-900/20 backdrop-blur-sm text-left space-y-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm text-zinc-100">InsForge RLS Sec</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Enterprise-grade security using advanced Row-Level Security checks.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600 font-semibold uppercase tracking-wider">
          <p>© 2026 AI Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-400">Terms</a>
            <a href="#" className="hover:text-zinc-400">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
