"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"

interface FeatureCardProps {
  name: string
  description: string
  icon: React.ReactNode
  videoSrc: string
  fallbackImg: string
  className?: string
  onClick?: () => void
}

export function BentoFeatureCard({ name, description, icon, videoSrc, fallbackImg, className = "", onClick }: FeatureCardProps) {
  const [videoError, setVideoError] = React.useState(!videoSrc)

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md cursor-pointer transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] hover:border-primary/40 flex flex-col justify-end p-6 min-h-64 ${className}`}
    >
      {/* Background Video/Image Container */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fallbackImg}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/10 z-10" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 space-y-2">
        <div className="inline-flex p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-110 mb-2">
          {icon}
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-50 tracking-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  )
}
