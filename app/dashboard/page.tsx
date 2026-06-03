"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sparkles,
  Home as HomeIcon,
  Video,
  User as UserIcon,
  Mic,
  FolderHeart,
  CreditCard,
  Settings,
  LogOut,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  VideoOff
} from "lucide-react"

import { BentoFeatureCard } from "@/components/bento-feature-card"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"home" | "video-agent" | "video-avatar" | "avatar" | "voice-cloning" | "library">("home")
  
  // User Profile
  const [userEmail, setUserEmail] = React.useState("")
  const [userName, setUserName] = React.useState("")

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
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Dashboard</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "home"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab("video-agent")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "video-agent"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Cpu className="w-4 h-4" />
              AI Video Agent
            </button>
            <button
              onClick={() => setActiveTab("video-avatar")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "video-avatar"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Video className="w-4 h-4" />
              AI Video Avatar
            </button>
            <button
              onClick={() => setActiveTab("avatar")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "avatar"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Avatar
            </button>
            <button
              onClick={() => setActiveTab("voice-cloning")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "voice-cloning"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Mic className="w-4 h-4" />
              AI Voice Cloning
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "library"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              My Library
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Section */}
        <div className="space-y-4">
          {/* User Profile & Sign Out */}
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden">
              <h2 className="font-semibold text-xs text-zinc-100 truncate">{userName}</h2>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-zinc-900 my-2" />

          {/* Billing & Available Credits */}
          <div className="space-y-3 px-2">
            <button className="w-full flex items-center gap-2.5 text-zinc-400 hover:text-primary transition-all text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
              <span>Billing Settings</span>
            </button>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <span>Available Credits</span>
                <Zap className="w-3 h-3 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-extrabold text-zinc-50">
                8,450 <span className="text-[10px] text-zinc-500 font-semibold">/ 10,000</span>
              </p>
              <div className="w-full bg-zinc-950 rounded-full h-1">
                <div className="bg-primary h-full rounded-full" style={{ width: "84.5%" }} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col bg-zinc-950/40 relative overflow-y-auto min-w-0">
        {/* Glow Ambient Gradients */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-18 border-b border-zinc-900 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-50 tracking-tight">
              {activeTab === "home" && "Dashboard"}
              {activeTab === "video-agent" && "AI Video Agent Workspace"}
              {activeTab === "video-avatar" && "AI Video Avatar Studio"}
              {activeTab === "avatar" && "Avatar Customizer"}
              {activeTab === "voice-cloning" && "AI Voice Cloning Workspace"}
              {activeTab === "library" && "Media Library"}
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 z-10">
          {activeTab === "home" ? (
            /* BENTO GRID HOME PAGE */
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight text-zinc-50">Welcome back, {userName}!</h3>
                <p className="text-xs text-zinc-400">Launch any of the AI pipelines below to start building.</p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 pt-2">
                {/* AI Video Agent - Large card (3 columns) */}
                <BentoFeatureCard
                  name="AI Video Agent"
                  description="Build conversational, photorealistic interactive AI agents that chat with clients in real-time."
                  icon={<Cpu className="w-5 h-5" />}
                  videoSrc="/ai-video-agent.mp4"
                  fallbackImg="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
                  className="md:col-span-3 md:row-span-2"
                  onClick={() => setActiveTab("video-agent")}
                />

                {/* AI Video Avatar - Medium card (3 columns) */}
                <BentoFeatureCard
                  name="AI Video Avatar"
                  description="Generate high-resolution video presentations using customized digital presenters."
                  icon={<Video className="w-5 h-5" />}
                  videoSrc="/ai-avatar.mp4"
                  fallbackImg="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
                  className="md:col-span-3"
                  onClick={() => setActiveTab("video-avatar")}
                />

                {/* Avatar - Small card (2 columns) */}
                <BentoFeatureCard
                  name="Avatar Builder"
                  description="Design custom 3D and 2D virtual presenter models."
                  icon={<UserIcon className="w-5 h-5" />}
                  videoSrc="/avatar.mp4"
                  fallbackImg="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
                  className="md:col-span-2"
                  onClick={() => setActiveTab("avatar")}
                />

                {/* AI Voice Cloning - Medium card (4 columns) */}
                <BentoFeatureCard
                  name="AI Voice Cloning"
                  description="Synthesize high-fidelity natural voice cloning pipelines in over 40+ languages."
                  icon={<Mic className="w-5 h-5" />}
                  videoSrc=""
                  fallbackImg="/voice-cloning.png"
                  className="md:col-span-4"
                  onClick={() => setActiveTab("voice-cloning")}
                />

                {/* My Library - Large span card (6 columns) */}
                <BentoFeatureCard
                  name="My Media Library"
                  description="Explore and export all your completed models, video agents, audio clones, and libraries."
                  icon={<FolderHeart className="w-5 h-5" />}
                  videoSrc="/my-library.mp4"
                  fallbackImg="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
                  className="md:col-span-6"
                  onClick={() => setActiveTab("library")}
                />
              </div>
            </div>
          ) : (
            /* SUB PAGES (Video Agent, Video Avatar, Avatar, Voice Cloning, Library) */
            <div className="animate-in fade-in duration-500">
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-3xl p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-zinc-50">
                    {activeTab === "video-agent" && "AI Video Agent Workspace"}
                    {activeTab === "video-avatar" && "AI Video Avatar Workspace"}
                    {activeTab === "avatar" && "Avatar Customization Studio"}
                    {activeTab === "voice-cloning" && "Voice Cloning Console"}
                    {activeTab === "library" && "Media Library & Exports"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Create, test, and manage pipeline runs here.
                  </p>
                </div>

                {/* Simulated workspace canvas */}
                <div className="h-96 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3 text-zinc-500 bg-zinc-950/40">
                  <VideoOff className="w-8 h-8 text-zinc-600 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Workspace canvas loading...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
