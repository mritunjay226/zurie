"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { VideoOff } from "lucide-react"

export default function VideoAvatarPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-zinc-50">
            AI Video Avatar Workspace
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
  )
}
