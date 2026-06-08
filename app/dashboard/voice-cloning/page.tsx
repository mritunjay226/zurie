"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Plus,
  Play,
  Pause,
  Trash2,
  Volume2,
  Coins,
  Loader2,
  AlertCircle,
  FileAudio,
  Calendar,
  MessageSquare
} from "lucide-react"
import { AddVoiceDialog } from "@/components/add-voice-dialog"
import { GenerateTtsDialog } from "@/components/generate-tts-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Voice {
  id: string
  name: string
  type: 'custom' | 'default'
  sample_url?: string
  voice_url?: string // preview url
  status: 'cloning' | 'active' | 'failed'
  language?: string
  created_at?: string
}

interface TtsRecording {
  id: string
  user_id: string
  voice_id: string
  voice_name: string
  voice_type: string
  text: string
  audio_url?: string
  audio_key?: string
  status: 'generating' | 'completed' | 'failed'
  credits_used: number
  created_at: string
}

interface ActiveRun {
  id: string // Trigger runId
  itemId: string // Voice ID or Recording ID
  name: string
  type: 'cloning' | 'tts'
  progress: number
  status: string
}

const DEFAULT_DEEPGRAM_VOICES: Voice[] = [
  {
    id: "aura-zeus-en",
    name: "The Narrator",
    type: "default",
    voice_url: "https://static.deepgram.com/examples/Aura-2-zeus.wav",
    status: "active",
    language: "en"
  },
  {
    id: "aura-arcas-en",
    name: "Sir Alistair",
    type: "default",
    voice_url: "https://static.deepgram.com/examples/Aura-2-arcas.wav",
    status: "active",
    language: "en"
  },
  {
    id: "aura-athena-en",
    name: "Nova",
    type: "default",
    voice_url: "https://static.deepgram.com/examples/Aura-2-athena.wav",
    status: "active",
    language: "en"
  },
  {
    id: "aura-helios-en",
    name: "Marcus",
    type: "default",
    voice_url: "https://static.deepgram.com/examples/voices/helios.wav",
    status: "active",
    language: "en"
  },
  {
    id: "aura-asteria-en",
    name: "Asteria",
    type: "default",
    voice_url: "https://static.deepgram.com/examples/aura-asteria-en.mp3",
    status: "active",
    language: "en"
  },
  {
    id: "aura-luna-en",
    name: "Luna",
    type: "default",
    voice_url: "https://static.deepgram.com/examples/aura-luna-en.mp3",
    status: "active",
    language: "en"
  }
]

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.35'/%3E%3C/svg%3E")`;

const ALL_GRADIENTS = [
  {
    name: "Midnight Glow",
    css: "radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.65) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.6) 0%, transparent 65%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.45) 0%, transparent 55%), #0a0a0f",
    textColor: "#ffffff"
  },
  {
    name: "Neon Cyber",
    css: "radial-gradient(circle at 90% 10%, rgba(6, 182, 212, 0.7) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(244, 63, 94, 0.6) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.5) 0%, transparent 55%), #030712",
    textColor: "#ffffff"
  },
  {
    name: "Toxic Emerald",
    css: "radial-gradient(circle at 10% 10%, rgba(34, 197, 94, 0.65) 0%, transparent 55%), radial-gradient(circle at 90% 90%, rgba(29, 78, 216, 0.7) 0%, transparent 60%), radial-gradient(circle at 50% 60%, rgba(20, 184, 166, 0.4) 0%, transparent 55%), #020617",
    textColor: "#ffffff"
  },
  {
    name: "Helios Core",
    css: "radial-gradient(circle at 90% 10%, rgba(249, 115, 22, 0.7) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(225, 29, 72, 0.6) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.5) 0%, transparent 55%), #0b040a",
    textColor: "#ffffff"
  },
  {
    name: "Obsidian Velvet",
    css: "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.6) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.6) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.45) 0%, transparent 50%), #08030f",
    textColor: "#ffffff"
  },
  {
    name: "Solar Wind",
    css: "radial-gradient(circle at 50% 0%, rgba(234, 179, 8, 0.65) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(220, 38, 38, 0.6) 0%, transparent 55%), radial-gradient(circle at 0% 80%, rgba(147, 51, 234, 0.55) 0%, transparent 50%), #0f0505",
    textColor: "#ffffff"
  },
  {
    name: "Deep Ocean Glow",
    css: "radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.7) 0%, transparent 55%), radial-gradient(circle at 90% 50%, rgba(20, 184, 166, 0.6) 0%, transparent 55%), radial-gradient(circle at 30% 90%, rgba(67, 56, 202, 0.6) 0%, transparent 60%), #030712",
    textColor: "#ffffff"
  },
  {
    name: "Nebula Mist",
    css: "radial-gradient(circle at 80% 30%, rgba(124, 58, 237, 0.65) 0%, transparent 55%), radial-gradient(circle at 10% 10%, rgba(244, 63, 94, 0.6) 0%, transparent 55%), radial-gradient(circle at 90% 90%, rgba(6, 182, 212, 0.6) 0%, transparent 60%), #090514",
    textColor: "#ffffff"
  },
  {
    name: "Stardust Glow",
    css: "radial-gradient(circle at 90% 90%, rgba(217, 70, 239, 0.7) 0%, transparent 55%), radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.6) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.5) 0%, transparent 50%), #08020f",
    textColor: "#ffffff"
  },
  {
    name: "Bioluminescence",
    css: "radial-gradient(circle at 85% 15%, rgba(34, 197, 94, 0.7) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.6) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(21, 128, 61, 0.45) 0%, transparent 50%), #020804",
    textColor: "#ffffff"
  },
  {
    name: "Supernova Flare",
    css: "radial-gradient(circle at 15% 15%, rgba(236, 72, 153, 0.7) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(124, 58, 237, 0.65) 0%, transparent 55%), radial-gradient(circle at 60% 10%, rgba(249, 115, 22, 0.5) 0%, transparent 50%), #0d020d",
    textColor: "#ffffff"
  },
  {
    name: "Frostbite Mesh",
    css: "radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.65) 0%, transparent 55%), radial-gradient(circle at 20% 40%, rgba(224, 242, 254, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(30, 58, 138, 0.7) 0%, transparent 65%), #040914",
    textColor: "#ffffff"
  },
  {
    name: "Gold Dust",
    css: "radial-gradient(circle at 80% 50%, rgba(234, 179, 8, 0.6) 0%, transparent 50%), radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.5) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(244, 63, 94, 0.55) 0%, transparent 50%), #090906",
    textColor: "#ffffff"
  },
  {
    name: "Interstellar",
    css: "radial-gradient(circle at 85% 15%, rgba(219, 39, 119, 0.65) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(56, 189, 248, 0.6) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.45) 0%, transparent 50%), #07020d",
    textColor: "#ffffff"
  }
];

export default function VoiceCloningPage() {
  const [activeTab, setActiveTab] = React.useState<'cloning' | 'tts'>('cloning')
  const [userCredits, setUserCredits] = React.useState(0)
  const [customVoices, setCustomVoices] = React.useState<Voice[]>([])
  const [recordings, setRecordings] = React.useState<TtsRecording[]>([])
  
  // Loading states
  const [isLoadingCredits, setIsLoadingCredits] = React.useState(true)
  const [isLoadingVoices, setIsLoadingVoices] = React.useState(true)
  const [isLoadingRecordings, setIsLoadingRecordings] = React.useState(true)

  // Dialog states
  const [isAddVoiceOpen, setIsAddVoiceOpen] = React.useState(false)
  const [isGenerateTtsOpen, setIsGenerateTtsOpen] = React.useState(false)
  const [preSelectedVoiceId, setPreSelectedVoiceId] = React.useState<string | undefined>(undefined)

  // Confirmation Delete States
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  const [deleteConfirmType, setDeleteConfirmType] = React.useState<'voice' | 'tts' | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Audio Previews Controller
  const [playingId, setPlayingId] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Background Task Runs tracking
  const [activeRuns, setActiveRuns] = React.useState<ActiveRun[]>([])
  const activeRunsRef = React.useRef<ActiveRun[]>([])

  React.useEffect(() => {
    activeRunsRef.current = activeRuns
  }, [activeRuns])

  // Load User Credits
  const fetchCredits = React.useCallback(async () => {
    try {
      const res = await fetch("/api/user/credits")
      if (res.ok) {
        const data = await res.json()
        setUserCredits(data.credits)
        window.dispatchEvent(new CustomEvent("creditsUpdated", { detail: data.credits }))
      }
    } catch (err) {
      console.error("Failed to load user credits", err)
    } finally {
      setIsLoadingCredits(false)
    }
  }, [])

  // Load Custom Voices
  const fetchCustomVoices = React.useCallback(async () => {
    try {
      const res = await fetch("/api/voice/list")
      if (res.ok) {
        const data = await res.json()
        setCustomVoices(data.voices)
      }
    } catch (err) {
      console.error("Failed to load custom voices", err)
    } finally {
      setIsLoadingVoices(false)
    }
  }, [])

  // Load TTS Recordings
  const fetchRecordings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tts/list")
      if (res.ok) {
        const data = await res.json()
        setRecordings(data.recordings)
      }
    } catch (err) {
      console.error("Failed to load recordings", err)
    } finally {
      setIsLoadingRecordings(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCredits()
    fetchCustomVoices()
    fetchRecordings()
  }, [fetchCredits, fetchCustomVoices, fetchRecordings])

  // Inline audio setup
  React.useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const handleEnded = () => {
      setPlayingId(null)
    }

    const handlePause = () => {
      setPlayingId(null)
    }

    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("pause", handlePause)
      audio.pause()
    }
  }, [])

  const togglePlayAudio = (id: string, url?: string) => {
    if (!url) {
      toast.error("Audio URL not available.")
      return
    }

    if (playingId === id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.play().catch((err) => {
          console.error("Playback failed", err)
          toast.error("Failed to play preview.")
          setPlayingId(null)
        })
        setPlayingId(id)
      }
    }
  }

  // Add Trigger.dev run to poll
  const addActiveRun = (runId: string, itemId: string, name: string, type: 'cloning' | 'tts') => {
    if (runId === 'mock_run') {
      // Direct mock refresh since there's no trigger key
      setTimeout(() => {
        fetchCredits()
        fetchCustomVoices()
        fetchRecordings()
      }, 5000)
      return
    }
    
    setActiveRuns(prev => [
      ...prev,
      { id: runId, itemId, name, type, progress: 5, status: 'Initializing task...' }
    ])
  }

  // Trigger.dev Runs Status Polling Loop
  React.useEffect(() => {
    const hasActive = activeRuns.length > 0
    if (!hasActive) return

    const pollInterval = setInterval(async () => {
      const currentRuns = activeRunsRef.current
      if (currentRuns.length === 0) return

      const updatedRuns = await Promise.all(
        currentRuns.map(async (run) => {
          try {
            const res = await fetch(`/api/avatar/status/${run.id}`)
            if (res.ok) {
              const data = await res.json()
              return {
                ...run,
                progress: data.progress || 0,
                status: data.status || 'Running...'
              }
            }
          } catch (e) {
            console.error(`Error polling run ${run.id}`, e)
          }
          return run
        })
      )

      // Identify finished runs
      const finished = updatedRuns.filter(r => r.progress === 100 || r.status === 'failed')
      
      if (finished.length > 0) {
        finished.forEach(r => {
          if (r.status === 'failed') {
            toast.error(`Background task failed: ${r.name}`)
          } else {
            toast.success(`Completed task: ${r.name}`)
          }
        })
        
        // Refresh data
        fetchCredits()
        fetchCustomVoices()
        fetchRecordings()
      }

      // Update state
      setActiveRuns(updatedRuns.filter(r => r.progress < 100 && r.status !== 'failed'))
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [activeRuns.length > 0, fetchCredits, fetchCustomVoices, fetchRecordings])

  // Handle successful voice creation submit
  const handleVoiceCloneSuccess = (voice: any, runId: string) => {
    fetchCustomVoices() // Add voice to list immediately in cloning state
    addActiveRun(runId, voice.id, `Clone voice: ${voice.name}`, 'cloning')
  }

  // Handle successful TTS generation submit
  const handleTtsGenerateSuccess = (recording: any, runId: string) => {
    fetchCredits()
    fetchRecordings() // Add to recording list in generating state
    addActiveRun(runId, recording.id, `TTS generation: ${recording.voice_name}`, 'tts')
  }

  // Handle Delete Dialog trigger
  const confirmDelete = (id: string, type: 'voice' | 'tts') => {
    setDeleteConfirmId(id)
    setDeleteConfirmType(type)
  }

  const handleDeleteSubmit = async () => {
    if (!deleteConfirmId || !deleteConfirmType) return

    setIsDeleting(true)
    try {
      const endpoint = deleteConfirmType === 'voice'
        ? `/api/voice/delete/${deleteConfirmId}`
        : `/api/tts/delete/${deleteConfirmId}`

      const res = await fetch(endpoint, { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete record")
      }

      toast.success(`${deleteConfirmType === 'voice' ? 'Voice' : 'Speech audio'} deleted successfully.`)
      
      if (playingId === deleteConfirmId) {
        audioRef.current?.pause()
        setPlayingId(null)
      }

      if (deleteConfirmType === 'voice') {
        fetchCustomVoices()
      } else {
        fetchRecordings()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.")
    } finally {
      setIsDeleting(false)
      setDeleteConfirmId(null)
      setDeleteConfirmType(null)
    }
  }

  const handleSelectVoiceForTts = (voiceId: string) => {
    setPreSelectedVoiceId(voiceId)
    setActiveTab('tts')
    setIsGenerateTtsOpen(true)
  }

  const getVoiceThumbnail = React.useCallback((name: string) => {
    let sum = 0
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
    return ALL_GRADIENTS[sum % ALL_GRADIENTS.length]
  }, [])

  const activeCustomVoicesForTts = React.useMemo(() => {
    return customVoices.filter(v => v.status === 'active').map(v => ({
      id: v.id,
      name: v.name,
      type: 'custom' as const,
      language: v.language,
      voice_url: v.voice_url
    }))
  }, [customVoices])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header and Credit Dashboard */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-yellow-400" />
            AI Voice Cloning Hub
          </h2>
          <p className="text-xs text-zinc-400">
            Clone voices from simple 10s audio files and generate studio-quality speech in seconds.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl py-2 px-4 shadow-inner">
          <Coins className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Available Balance</span>
            <span className="text-base font-extrabold text-zinc-100">
              {isLoadingCredits ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : userCredits} credits
            </span>
          </div>
        </div>
      </div> */}

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-800/80">
        <button
          onClick={() => setActiveTab('cloning')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all relative ${
            activeTab === 'cloning'
              ? "border-yellow-500 text-yellow-400 bg-yellow-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          AI Voice Cloning
        </button>
        <button
          onClick={() => setActiveTab('tts')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all relative ${
            activeTab === 'tts'
              ? "border-yellow-500 text-yellow-400 bg-yellow-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Voice Cloning TTS
        </button>
      </div>

      {/* Tab Content: Voice Cloning */}
      {activeTab === 'cloning' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-zinc-100">Voice Library</h3>
              <p className="text-xs text-zinc-500">Select a default system voice or clone a custom voice profile.</p>
            </div>
            <Button
              onClick={() => setIsAddVoiceOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-yellow-500/10 h-10 px-4 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 group/btn"
            >
              <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
              Add New Voice Clone
            </Button>
          </div>

          {/* Grid of Default & Custom Voices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Default Voices */}
            {DEFAULT_DEEPGRAM_VOICES.map((voice) => {
              const thumbnail = getVoiceThumbnail(voice.name)
              return (
                <Card key={voice.id} className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between hover:border-yellow-500/30 hover:bg-zinc-900/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group h-48">
                  <div className="flex items-start gap-4">
                    {/* Gradient Avatar Icon with Noise */}
                    <div 
                      style={{ 
                        background: thumbnail.css,
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.22), 0 4px 12px rgba(0,0,0,0.5)"
                      }} 
                      className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0 flex items-center justify-center font-bold text-sm relative overflow-hidden group-hover:scale-105 group-hover:border-white/25 transition-all duration-300"
                    >
                      {/* Glass Sheen overlay */}
                      <div 
                        style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.25) 100%)",
                          pointerEvents: "none",
                        }} 
                      />
                      {/* Grain Overlay */}
                      <div 
                        style={{
                          position: "absolute", inset: 0,
                          backgroundImage: NOISE_SVG,
                          backgroundSize: "128px 128px",
                          opacity: 0.55,
                          mixBlendMode: "overlay",
                          pointerEvents: "none",
                        }} 
                      />
                      <span style={{ color: thumbnail.textColor }} className="relative z-10 select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                        {voice.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-yellow-400 transition-colors">
                        {voice.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-800 rounded-md text-[9px] font-semibold tracking-wider uppercase">
                          Default
                        </Badge>
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10 rounded-md text-[9px] font-semibold uppercase">
                          EN
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => togglePlayAudio(voice.id, voice.voice_url)}
                      variant="outline"
                      className="flex-1 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/80 text-zinc-300 hover:text-zinc-100 rounded-xl h-9 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 group/btn"
                    >
                      {playingId === voice.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-rose-400 fill-rose-400 group-hover/btn:scale-110 transition-transform duration-200" />
                          Pause Preview
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400 group-hover/btn:scale-110 transition-transform duration-200" />
                          Play Preview
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleSelectVoiceForTts(voice.id)}
                      className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl h-9 text-xs shadow-md hover:shadow-yellow-500/5 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200"
                    >
                      Use Voice
                    </Button>
                  </div>
                </Card>
              )
            })}

            {/* Custom Voices List */}
            {isLoadingVoices ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <span className="text-xs">Loading custom voice library...</span>
              </div>
            ) : (
              customVoices.map((voice) => {
                const activeRun = activeRuns.find(r => r.itemId === voice.id && r.type === 'cloning')
                const thumbnail = getVoiceThumbnail(voice.name)
                return (
                  <Card key={voice.id} className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between hover:border-yellow-500/30 hover:bg-zinc-900/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group relative h-48">
                    
                    {/* Delete button (only for custom voices) */}
                    {voice.status !== 'cloning' && (
                      <button
                        onClick={() => confirmDelete(voice.id, 'voice')}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 hover:scale-110 active:scale-95 transition-all p-1 z-20"
                        title="Delete Voice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Gradient Avatar Icon with Noise */}
                      <div 
                        style={{ 
                          background: thumbnail.css,
                          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.22), 0 4px 12px rgba(0,0,0,0.5)"
                        }} 
                        className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0 flex items-center justify-center font-bold text-sm relative overflow-hidden group-hover:scale-105 group-hover:border-white/25 transition-all duration-300"
                      >
                        {/* Glass Sheen overlay */}
                        <div 
                          style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.25) 100%)",
                            pointerEvents: "none",
                          }} 
                        />
                        {/* Grain Overlay */}
                        <div 
                          style={{
                            position: "absolute", inset: 0,
                            backgroundImage: NOISE_SVG,
                            backgroundSize: "128px 128px",
                            opacity: 0.55,
                            mixBlendMode: "overlay",
                            pointerEvents: "none",
                          }} 
                        />
                        <span style={{ color: thumbnail.textColor }} className="relative z-10 select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                          {voice.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1 pr-6">
                        <h4 className="text-sm font-bold text-zinc-100 group-hover:text-yellow-400 transition-colors truncate max-w-[140px]">
                          {voice.name}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10 rounded-md text-[9px] font-semibold tracking-wider uppercase">
                            Custom
                          </Badge>
                          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-800 rounded-md text-[9px] font-semibold uppercase">
                            {voice.language === "hi" ? "Hi/Multi" : "EN"}
                          </Badge>
                          {voice.status === 'cloning' && (
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10 rounded-md text-[9px] font-semibold uppercase flex items-center gap-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Cloning
                            </Badge>
                          )}
                          {voice.status === 'failed' && (
                            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 rounded-md text-[9px] font-semibold uppercase flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions based on voice cloning status */}
                    {voice.status === 'cloning' ? (
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold">
                          <span className="truncate max-w-[170px]">{activeRun?.status || 'Cloning voice...'}</span>
                          {activeRun && <span>{activeRun.progress}%</span>}
                        </div>
                        <Progress value={activeRun?.progress ?? 15} className="h-1 bg-zinc-950" />
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => togglePlayAudio(voice.id, voice.voice_url)}
                          variant="outline"
                          disabled={voice.status === 'failed' || !voice.voice_url}
                          className="flex-1 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/80 text-zinc-300 hover:text-zinc-100 rounded-xl h-9 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 group/btn"
                        >
                          {playingId === voice.id ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-rose-400 fill-rose-400 group-hover/btn:scale-110 transition-transform duration-200" />
                              Pause Preview
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400 group-hover/btn:scale-110 transition-transform duration-200" />
                              Play Preview
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleSelectVoiceForTts(voice.id)}
                          disabled={voice.status === 'failed'}
                          className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl h-9 text-xs shadow-md hover:shadow-yellow-500/5 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200"
                        >
                          Use Voice
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })
            )}

            {/* Empty State for Custom Voices */}
            {!isLoadingVoices && customVoices.length === 0 && (
              <Card className="col-span-full border border-dashed border-zinc-800 rounded-2xl py-12 flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/20">
                <FileAudio className="w-10 h-10 text-zinc-600" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-300">No custom voices cloned yet</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Upload a 10-second reference file to clone a custom voice.
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddVoiceOpen(true)}
                  variant="outline"
                  className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 rounded-xl h-9 text-xs px-4 mt-2"
                >
                  Clone Your First Voice
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Voice Cloning TTS */}
      {activeTab === 'tts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-zinc-100">TTS Audio Library</h3>
              <p className="text-xs text-zinc-500">Generate, play, and manage your synthesized audio transcripts.</p>
            </div>
            <Button
              onClick={() => {
                setPreSelectedVoiceId(undefined)
                setIsGenerateTtsOpen(true)
              }}
              className="bg-yellow-500 hover:yellow-600 text-zinc-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-yellow-500/10 h-10 px-4"
            >
              <Sparkles className="w-4 h-4" />
              Generate Text to Speech
            </Button>
          </div>

          {/* List of Generated TTS Recordings */}
          {isLoadingRecordings ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              <span className="text-xs">Loading TTS audio recordings...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recordings.map((rec) => {
                const activeRun = activeRuns.find(r => r.itemId === rec.id && r.type === 'tts')
                return (
                  <Card key={rec.id} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 hover:border-zinc-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm group">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-100 flex items-center gap-1 bg-zinc-950/60 border border-zinc-800 rounded-md py-0.5 px-2">
                          <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                          {rec.voice_name}
                        </span>
                        <Badge className="bg-zinc-800 border-zinc-700 text-zinc-400 text-[9px] hover:bg-zinc-800 font-semibold tracking-wide uppercase rounded-md">
                          {rec.voice_type === 'custom' ? 'Custom Cloned' : 'Default'}
                        </Badge>
                        <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 text-[9px] rounded-md font-semibold">
                          -{rec.credits_used} credits
                        </Badge>
                        
                        {rec.status === 'generating' && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 text-[9px] rounded-md font-semibold flex items-center gap-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              {activeRun?.status || 'Generating'}
                            </Badge>
                            {activeRun && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-amber-400 font-extrabold">{activeRun.progress}%</span>
                                <Progress value={activeRun.progress} className="h-1 w-12 bg-zinc-950" />
                              </div>
                            )}
                          </div>
                        )}
                      {rec.status === 'failed' && (
                        <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-[9px] rounded-md font-semibold flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Failed
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-medium line-clamp-2 pr-4">
                      "{rec.text}"
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {rec.text.length} chars
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto border-t border-zinc-800/40 sm:border-0 pt-3 sm:pt-0 justify-end">
                    {rec.status === 'completed' && rec.audio_url && (
                      <Button
                        onClick={() => togglePlayAudio(rec.id, rec.audio_url)}
                        variant="outline"
                        className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 rounded-xl h-10 px-4 text-xs font-semibold flex items-center gap-1.5"
                      >
                        {playingId === rec.id ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
                            Play Audio
                          </>
                        )}
                      </Button>
                    )}

                    {rec.status !== 'generating' && (
                      <Button
                        onClick={() => confirmDelete(rec.id, 'tts')}
                        variant="outline"
                        className="border-zinc-800/80 hover:bg-rose-950/20 hover:border-rose-900/40 text-zinc-500 hover:text-rose-400 rounded-xl h-10 w-10 flex items-center justify-center p-0"
                        title="Delete Recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              )})}

              {/* Empty State for TTS Recordings */}
              {!isLoadingRecordings && recordings.length === 0 && (
                <Card className="border border-dashed border-zinc-800 rounded-2xl py-16 flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/20">
                  <FileAudio className="w-10 h-10 text-zinc-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-300">No generated speech audio found</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Choose a voice and type a prompt to synthesize text-to-speech.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setPreSelectedVoiceId(undefined)
                      setIsGenerateTtsOpen(true)
                    }}
                    variant="outline"
                    className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 rounded-xl h-9 text-xs px-4 mt-2"
                  >
                    Generate Your First Audio
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddVoiceDialog
        isOpen={isAddVoiceOpen}
        onClose={() => setIsAddVoiceOpen(false)}
        onSuccess={handleVoiceCloneSuccess}
      />

      <GenerateTtsDialog
        isOpen={isGenerateTtsOpen}
        onClose={() => setIsGenerateTtsOpen(false)}
        customVoices={activeCustomVoicesForTts}
        defaultVoices={DEFAULT_DEEPGRAM_VOICES}
        preSelectedVoiceId={preSelectedVoiceId}
        userCredits={userCredits}
        onSuccess={handleTtsGenerateSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Delete Confirmation
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Are you sure you want to permanently delete this {deleteConfirmType === 'voice' ? 'custom voice' : 'synthesized speech audio'}? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => {
                setDeleteConfirmId(null)
                setDeleteConfirmType(null)
              }}
              className="border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-zinc-100 font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/10"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
