"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sparkles,
  LayoutDashboard,
  BrainCircuit,
  Sliders,
  LogOut,
  Zap,
  BarChart3,
  Bot,
  Code,
  Image as ImageIcon,
  Cpu,
  ArrowRight,
  TrendingUp,
  Activity,
  User,
  Settings,
  HelpCircle,
  Copy,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"playground" | "overview" | "settings">("playground")
  
  // User profile state
  const [userEmail, setUserEmail] = React.useState("")
  const [userName, setUserName] = React.useState("")
  
  // Playground state
  const [prompt, setPrompt] = React.useState("")
  const [genType, setGenType] = React.useState<"text" | "image" | "code">("text")
  const [model, setModel] = React.useState("claude-3-5-sonnet")
  const [loading, setLoading] = React.useState(false)
  const [output, setOutput] = React.useState("")
  const [outputImage, setOutputImage] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [genTime, setGenTime] = React.useState(0)
  const [genTokens, setGenTokens] = React.useState(0)

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user")
        if (!res.ok) {
          router.push("/sign-in")
          return
        }
        const data = await res.json()
        setUserEmail(data.user.email)
        setUserName(data.user.profile?.name || data.user.email.split("@")[0])
      } catch (err) {
        router.push("/sign-in")
      }
    }
    fetchUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" })
      router.push("/sign-in")
      router.refresh()
    } catch (err) {
      console.error("Sign out failed")
    }
  }

  const handleGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    setOutput("")
    setOutputImage("")
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, type: genType }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setOutput(data.content)
        setOutputImage(data.imageUrl)
        setGenTime(data.executionTimeMs)
        setGenTokens(data.tokensUsed)
      } else {
        setOutput("Generation failed. Please try again.")
      }
    } catch (err) {
      setOutput("Error connecting to generator.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex select-none">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-900/20 backdrop-blur-xl flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-sm text-zinc-50">AI Studio</h1>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Workspace</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("playground")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "playground"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <BrainCircuit className="w-4.5 h-4.5" />
              Studio Playground
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              Overview Stats
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Sliders className="w-4.5 h-4.5" />
              Studio Settings
            </button>
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-xs uppercase shadow-md shadow-primary/10">
              {userName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-xs text-zinc-100 truncate">{userName}</h2>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950/40 relative overflow-y-auto">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-18 border-b border-zinc-900 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-50 tracking-tight">
              {activeTab === "playground" && "AI Studio Playground"}
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "settings" && "Platform Configuration"}
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              V1.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-semibold text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>Pro Plan</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-8 z-10">
          {activeTab === "playground" && (
            /* TAB 1: AI PLAYGROUND */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Settings</CardTitle>
                    <CardDescription className="text-xs">Configure generation parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Generation Mode */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400">Pipeline Output Type</label>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/40">
                        {(["text", "image", "code"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setGenType(type)}
                            className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                              genType === type
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {type === "text" && <Bot className="w-3.5 h-3.5" />}
                            {type === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                            {type === "code" && <Code className="w-3.5 h-3.5" />}
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Model Selector */}
                    <div className="space-y-2">
                      <label htmlFor="model-select" className="text-xs font-bold text-zinc-400">Base AI Model</label>
                      <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary/80"
                      >
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                        <option value="deepseek-v3">DeepSeek V3</option>
                        <option value="llama-3.1-405b">Llama 3.1 405B</option>
                      </select>
                    </div>

                    {/* Prompt input */}
                    <div className="space-y-2">
                      <label htmlFor="prompt-input" className="text-xs font-bold text-zinc-400">Generation Prompt</label>
                      <Textarea
                        id="prompt-input"
                        placeholder={
                          genType === "image"
                            ? "Describe the visual artwork..."
                            : genType === "code"
                            ? "Write a function to solve..."
                            : "Ask a question or enter text..."
                        }
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-32 bg-zinc-950/60 border-zinc-800 focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl text-xs"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={loading || !prompt}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-5.5 shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5 transition-all text-xs"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Running Generation Pipeline...
                        </>
                      ) : (
                        <>
                          Execute Pipeline
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Output Column */}
              <div className="lg:col-span-3 h-full">
                <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl h-full flex flex-col justify-between shadow-xl min-h-120">
                  <CardHeader className="pb-4 border-b border-zinc-800/40 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Output Console</CardTitle>
                      <CardDescription className="text-xs">Generated result payload</CardDescription>
                    </div>
                    {output && !loading && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 pt-6 overflow-auto">
                    {loading ? (
                      <div className="h-full flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
                        <Cpu className="w-8 h-8 text-primary animate-pulse" />
                        <span className="text-xs font-semibold tracking-wider uppercase">Synthesizing Pipeline Outputs...</span>
                      </div>
                    ) : output || outputImage ? (
                      <div className="space-y-4">
                        {/* Display image output */}
                        {genType === "image" && outputImage && (
                          <div className="relative rounded-xl overflow-hidden border border-zinc-800 max-h-80 flex items-center justify-center bg-zinc-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={outputImage} alt="AI Generation" className="object-contain max-h-80 w-full" />
                          </div>
                        )}
                        {/* Display text/code output */}
                        <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/40">
                          {output}
                        </pre>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 py-16 text-zinc-600">
                        <Cpu className="w-7 h-7" />
                        <span className="text-xs font-semibold">Console empty. Type a prompt and click generate.</span>
                      </div>
                    )}
                  </CardContent>

                  {/* Metadata Footer */}
                  {output && !loading && (
                    <div className="p-4 bg-zinc-950/40 border-t border-zinc-800/40 rounded-b-2xl grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                      <div className="space-y-1">
                        <p className="text-zinc-600">Execution Speed</p>
                        <p className="text-zinc-300 font-bold">{genTime}ms</p>
                      </div>
                      <div className="space-y-1 border-x border-zinc-800/40">
                        <p className="text-zinc-600">Tokens Generated</p>
                        <p className="text-zinc-300 font-bold">{genTokens}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-600">Pipeline Model</p>
                        <p className="text-zinc-300 font-bold">{model}</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            /* TAB 2: OVERVIEW STATS */
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      AI Credits Remaining
                      <Zap className="w-3.5 h-3.5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-3xl font-extrabold tracking-tight text-zinc-50">8,450 <span className="text-sm font-semibold text-zinc-500">/ 10,000</span></p>
                    <div className="w-full bg-zinc-950 rounded-full h-1.5 border border-zinc-800/40">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "84.5%" }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      Tokens Synthesized
                      <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold tracking-tight text-zinc-50">2,421,950</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +14.2% since yesterday
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      Active AI Pipelines
                      <Activity className="w-3.5 h-3.5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold tracking-tight text-zinc-50">14 <span className="text-sm font-semibold text-zinc-500">running</span></p>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-1">Average execution time: 1.25s</p>
                  </CardContent>
                </Card>
              </div>

              {/* Graphic/Section */}
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Pipeline Performance</CardTitle>
                  <CardDescription className="text-xs">Hourly generation load across models</CardDescription>
                </CardHeader>
                <CardContent className="py-8 flex flex-col items-center justify-center gap-4 border-t border-zinc-800/20">
                  {/* Styled Mock Performance Graph Grid */}
                  <div className="w-full grid grid-cols-12 items-end gap-2.5 h-36 max-w-xl">
                    {[40, 55, 30, 45, 80, 65, 90, 75, 45, 60, 85, 100].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div
                          className="w-full bg-zinc-800 group-hover:bg-primary rounded-lg transition-all"
                          style={{ height: `${val}%` }}
                        />
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">{idx * 2}h</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500 font-semibold">Generations peak between 18:00h and 22:00h (Llama & Claude load)</span>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            /* TAB 3: SETTINGS */
            <div className="max-w-xl space-y-6 animate-in fade-in duration-500">
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Workspace Settings</CardTitle>
                  <CardDescription className="text-xs">Manage AI keys and profile context</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 border-t border-zinc-800/20 pt-6">
                  <div className="space-y-1.5">
                    <label htmlFor="owner-name" className="text-xs font-bold text-zinc-400">Workspace Owner</label>
                    <Input id="owner-name" value={userName} disabled className="bg-zinc-950/60 border-zinc-800 text-zinc-300 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="owner-email" className="text-xs font-bold text-zinc-400">Notification Email</label>
                    <Input id="owner-email" value={userEmail} disabled className="bg-zinc-950/60 border-zinc-800 text-zinc-300 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="secret-key" className="text-xs font-bold text-zinc-400">InsForge API Key Prefix</label>
                    <Input id="secret-key" value="ik_f5a98f8fa397****************" disabled className="bg-zinc-950/60 border-zinc-800 text-zinc-500 font-mono rounded-xl text-xs" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
