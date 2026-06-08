"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sparkles,
  Home as HomeIcon,
  Video,
  User as UserIcon,
  Mic,
  FolderHeart,
  CreditCard,
  Zap,
  LogOut,
  Cpu
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // User Profile
  const [userEmail, setUserEmail] = React.useState("")
  const [userName, setUserName] = React.useState("")
  const [credits, setCredits] = React.useState<number | null>(null)

  React.useEffect(() => {
    async function fetchUserAndCredits() {
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

      try {
        const res = await fetch("/api/user/credits")
        const data = await res.json()
        if (data.success) {
          setCredits(data.credits)
        }
      } catch (err) {
        console.error("Failed to fetch user credits:", err)
      }
    }
    fetchUserAndCredits()

    const handleCreditsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<number>
      setCredits(customEvent.detail)
    }

    window.addEventListener("creditsUpdated", handleCreditsUpdate)
    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate)
    }
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

  // Map pathname to header title
  const getHeaderTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/dashboard/video-agent":
        return "AI Video Agent Workspace"
      case "/dashboard/video-avatar":
        return "AI Video Avatar Studio"
      case "/dashboard/avatar":
        return "Avatar Customizer"
      case "/dashboard/voice-cloning":
        return "AI Voice Cloning Workspace"
      case "/dashboard/library":
        return "Media Library"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex select-none">
      {/* Sidebar Navigation */}
      <aside className="w-64 h-screen sticky top-0 border-r border-zinc-900 bg-zinc-900/20 backdrop-blur-xl flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar shrink-0">
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
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                pathname === "/dashboard"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/dashboard/video-agent"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                pathname === "/dashboard/video-agent"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Cpu className="w-4 h-4" />
              AI Video Agent
            </Link>
            <Link
              href="/dashboard/video-avatar"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                pathname === "/dashboard/video-avatar"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Video className="w-4 h-4" />
              AI Video Avatar
            </Link>
            <Link
              href="/dashboard/avatar"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                pathname === "/dashboard/avatar"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Avatar
            </Link>
            <Link
              href="/dashboard/voice-cloning"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                pathname === "/dashboard/voice-cloning"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <Mic className="w-4 h-4" />
              AI Voice Cloning
            </Link>
            <Link
              href="/dashboard/library"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                pathname === "/dashboard/library"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              My Library
            </Link>
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
              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-zinc-900 my-2" />

          {/* Billing Settings */}
          <div className="px-2">
            <button className="w-full flex items-center gap-2.5 text-zinc-400 hover:text-primary transition-all text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
              <span>Billing Settings</span>
            </button>
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
              {getHeaderTitle()}
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sleek Credit Count Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-bold text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>{credits !== null ? `${credits.toLocaleString()} Credits` : "Loading..."}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
