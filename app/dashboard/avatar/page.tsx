"use client"

import * as React from "react"
import { CreateAvatarDialog } from "@/components/create-avatar-dialog"
import { Loader2, Trash2, Sparkles, User as UserIcon, Search, Smartphone, Tv, Calendar, Compass, Info, Play } from "lucide-react"

// Premium Avatar Card for custom user avatars
function AvatarCard({ av, onDelete }: { av: any; onDelete: (id: string) => void }) {
  const [viewMode, setViewMode] = React.useState<"portrait" | "landscape">("portrait")

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-md flex flex-col hover:border-zinc-800/80 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 ease-out">
      {/* Aspect Ratio Container with smooth transition */}
      <div className={`relative bg-zinc-950/40 overflow-hidden transition-all duration-500 ease-in-out ${
        viewMode === "portrait" ? "aspect-[9/16]" : "aspect-[16/9]"
      }`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={viewMode === "portrait" ? av.image_url_9_16 : av.image_url_16_9}
          alt={av.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />

        {/* Aspect Ratio Switcher (Top Left Overlaid) */}
        <div className="absolute top-3.5 left-3.5 flex bg-black/60 backdrop-blur-md border border-white/5 rounded-xl p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md">
          <button
            onClick={() => setViewMode("portrait")}
            title="Portrait View (9:16)"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "portrait"
                ? "bg-zinc-800 text-primary"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("landscape")}
            title="Landscape View (16:9)"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "landscape"
                ? "bg-zinc-800 text-primary"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Overlay delete button */}
        <button
          onClick={() => onDelete(av.id)}
          title="Delete Presenter"
          className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/60 border border-white/5 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer z-30 shadow-md"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Dynamic Hover Details Overlay (Slides up from the bottom) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-zinc-950/40 p-4 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 flex flex-col justify-between min-h-[50%] border-t border-zinc-900">
          <div className="space-y-2">
            <span className="inline-flex text-[8px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              {av.style.replace("-", " ")}
            </span>
            <h4 className="text-xs font-bold text-zinc-100 leading-tight">{av.name}</h4>
            {av.prompt && (
              <p className="text-[10px] text-zinc-400 line-clamp-3 italic leading-relaxed">
                "{av.prompt}"
              </p>
            )}
          </div>
          
          <div className="pt-2 flex items-center justify-between border-t border-zinc-900/60">
            <span className="text-[8px] text-zinc-500 flex items-center gap-1 font-semibold uppercase tracking-wide">
              <Calendar className="w-3 h-3" />
              {av.created_at ? new Date(av.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "Custom"}
            </span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/90 transition-all">
              <Play className="w-2.5 h-2.5 fill-current" />
              Use Actor
            </button>
          </div>
        </div>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300 z-10" />
      </div>

      {/* Static Footer */}
      <div className="p-4 relative z-10 flex items-center justify-between group-hover:opacity-0 transition-opacity duration-300">
        <div className="space-y-0.5 overflow-hidden">
          <h4 className="text-xs font-bold text-zinc-100 truncate">{av.name}</h4>
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold capitalize">
            {av.style.replace("-", " ")}
          </p>
        </div>
        <div className="w-7 h-7 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Info className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}

// Premium Default Avatar Card
function DefaultAvatarCard({ av }: { av: any }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-md flex flex-col hover:border-zinc-800 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 ease-out">
      {/* Aspect Ratio Container */}
      <div className="relative bg-zinc-950/40 overflow-hidden aspect-[9/16]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={av.image}
          alt={av.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />

        {/* Hover Details Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-zinc-950/40 p-4 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 flex flex-col justify-between min-h-[50%] border-t border-zinc-900">
          <div className="space-y-2">
            <span className="inline-flex text-[8px] font-extrabold uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              System Actor
            </span>
            <h4 className="text-xs font-bold text-zinc-100 leading-tight">{av.name}</h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Pre-trained studio presenter. Optimized for high-resolution {av.style.toLowerCase()} streams.
            </p>
          </div>
          
          <div className="pt-2 flex items-center justify-between border-t border-zinc-900/60">
            <span className="text-[8px] text-primary font-bold uppercase tracking-wider">
              Ready for use
            </span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 text-[10px] font-bold hover:bg-zinc-200 transition-all">
              <Play className="w-2.5 h-2.5 fill-current" />
              Select
            </button>
          </div>
        </div>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300 z-10" />
      </div>

      {/* Content Section */}
      <div className="p-4 relative z-10 flex items-center justify-between group-hover:opacity-0 transition-opacity duration-300">
        <div className="space-y-0.5 overflow-hidden">
          <h4 className="text-xs font-bold text-zinc-100 truncate">{av.name}</h4>
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
            {av.style}
          </p>
        </div>
        <div className="w-7 h-7 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
    </div>
  )
}

export default function AvatarPage() {
  // AI Avatars state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [customAvatars, setCustomAvatars] = React.useState<any[]>([])
  const [isLoadingCustom, setIsLoadingCustom] = React.useState(false)

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFilter, setSelectedFilter] = React.useState("all")

  const DEFAULT_AVATARS = [
    { id: "def-1", name: "Adam", image: "/avatars/adam.png", style: "Podcast Host" },
    { id: "def-2", name: "Emma", image: "/avatars/emma.png", style: "Casual Presenter" },
    { id: "def-3", name: "Jack", image: "/avatars/jack.png", style: "3D Cartoon Model" },
    { id: "def-4", name: "Jen", image: "/avatars/jen.png", style: "Stylized Presenter" },
  ]

  const fetchCustomAvatars = React.useCallback(async () => {
    setIsLoadingCustom(true)
    try {
      const res = await fetch("/api/avatar/list")
      if (res.ok) {
        const data = await res.json()
        setCustomAvatars(data.avatars || [])
      }
    } catch (err) {
      console.error("Failed to fetch custom avatars", err)
    } finally {
      setIsLoadingCustom(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCustomAvatars()
  }, [fetchCustomAvatars])

  const handleDeleteAvatar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom avatar?")) return
    try {
      const res = await fetch(`/api/avatar/delete/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCustomAvatars(prev => prev.filter(av => av.id !== id))
      }
    } catch (err) {
      console.error("Failed to delete avatar", err)
    }
  }

  // Filtered Custom Avatars list
  const filteredAvatars = React.useMemo(() => {
    return customAvatars.filter((av) => {
      const matchesSearch = av.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (av.prompt && av.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter = selectedFilter === "all" || av.style === selectedFilter
      return matchesSearch && matchesFilter
    })
  }, [customAvatars, searchQuery, selectedFilter])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-50 tracking-tight">Avatar Studio</h3>
          <p className="text-xs text-zinc-400">Design and manage your custom digital presenter actors</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create New Avatar
        </button>
      </div>

      {/* Filtering & Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search custom presenters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all whitespace-nowrap ${
              selectedFilter === "all"
                ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            All Styles
          </button>
          {["podcast", "casual", "3d-cartoon", "stylized"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all capitalize whitespace-nowrap ${
                selectedFilter === st
                  ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                  : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {st.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Avatars Section */}
      <div className="space-y-4">

        {isLoadingCustom ? (
          <div className="h-48 border border-zinc-900 bg-zinc-900/10 rounded-3xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredAvatars.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-3xl p-10 text-center bg-zinc-900/10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 mx-auto">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-zinc-300">No presenters found</h4>
              <p className="text-[10px] text-zinc-500">
                {searchQuery || selectedFilter !== "all" 
                  ? "Try resetting your search query or filter." 
                  : "Click 'Create New Avatar' to generate or upload your own."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAvatars.map((av) => (
              <AvatarCard key={av.id} av={av} onDelete={handleDeleteAvatar} />
            ))}
          </div>
        )}
      </div>

      {/* Default Avatars Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-900/60">
        <div>
          <h3 className="text-lg font-bold text-zinc-50 tracking-tight">Default System Avatars</h3>
          <p className="text-xs text-zinc-400">Pre-trained high fidelity actors ready for use</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {DEFAULT_AVATARS.map((av) => (
            <DefaultAvatarCard key={av.id} av={av} />
          ))}
        </div>
      </div>

      <CreateAvatarDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={fetchCustomAvatars}
      />
    </div>
  )
}
