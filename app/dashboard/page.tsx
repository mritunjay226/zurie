"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Cpu,
  Video,
  User as UserIcon,
  Mic,
  FolderHeart
} from "lucide-react"

import { BentoFeatureCard } from "@/components/bento-feature-card"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = React.useState("")

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user")
        if (res.ok) {
          const data = await res.json()
          setUserName(data.user.profile?.name || data.user.email.split("@")[0])
        }
      } catch (err) {
        console.error("Failed to fetch user in home page", err)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h3 className="text-2xl font-black tracking-tight text-zinc-50">Welcome back{userName ? `, ${userName}` : ""}!</h3>
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
          onClick={() => router.push("/dashboard/video-agent")}
        />

        {/* AI Video Avatar - Medium card (3 columns) */}
        <BentoFeatureCard
          name="AI Video Avatar"
          description="Generate high-resolution video presentations using customized digital presenters."
          icon={<Video className="w-5 h-5" />}
          videoSrc="/ai-avatar.mp4"
          fallbackImg="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
          className="md:col-span-3"
          onClick={() => router.push("/dashboard/video-avatar")}
        />

        {/* Avatar - Small card (2 columns) */}
        <BentoFeatureCard
          name="Avatar Builder"
          description="Design custom 3D and 2D virtual presenter models."
          icon={<UserIcon className="w-5 h-5" />}
          videoSrc="/avatar.mp4"
          fallbackImg="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
          className="md:col-span-2"
          onClick={() => router.push("/dashboard/avatar")}
        />

        {/* AI Voice Cloning - Medium card (4 columns) */}
        <BentoFeatureCard
          name="AI Voice Cloning"
          description="Synthesize high-fidelity natural voice cloning pipelines in over 40+ languages."
          icon={<Mic className="w-5 h-5" />}
          videoSrc=""
          fallbackImg="/voice-cloning.png"
          className="md:col-span-4"
          onClick={() => router.push("/dashboard/voice-cloning")}
        />

        {/* My Library - Large span card (6 columns) */}
        <BentoFeatureCard
          name="My Media Library"
          description="Explore and export all your completed models, video agents, audio clones, and libraries."
          icon={<FolderHeart className="w-5 h-5" />}
          videoSrc="/my-library.mp4"
          fallbackImg="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
          className="md:col-span-6"
          onClick={() => router.push("/dashboard/library")}
        />
      </div>
    </div>
  )
}
