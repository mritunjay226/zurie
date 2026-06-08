"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface VoiceOption {
  id: string
  name: string
  type: 'custom' | 'default'
  language?: string // 'en' or 'hi'
  voice_url?: string
}

interface GenerateTtsDialogProps {
  isOpen: boolean
  onClose: () => void
  customVoices: VoiceOption[]
  defaultVoices: VoiceOption[]
  preSelectedVoiceId?: string
  userCredits: number
  onSuccess: (recording: any, runId: string) => void
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "it", name: "Italian (Italiano)", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese (Português)", flag: "🇵🇹" },
  { code: "pl", name: "Polish (Polski)", flag: "🇵🇱" },
  { code: "tr", name: "Turkish (Türkçe)", flag: "🇹🇷" },
  { code: "ru", name: "Russian (Русский)", flag: "🇷🇺" },
  { code: "nl", name: "Dutch (Nederlands)", flag: "🇳🇱" },
  { code: "cs", name: "Czech (Čeština)", flag: "🇨🇿" },
  { code: "ar", name: "Arabic (العربية)", flag: "🇸🇦" },
  { code: "zh", name: "Chinese (中文)", flag: "🇨🇳" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ko", name: "Korean (한국어)", flag: "🇰🇷" },
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" }
]

const GESTURE_TAGS = [
  "[chuckle]",
  "[laugh]",
  "[sigh]",
  "[gasp]",
  "[cough]",
  "[sniff]",
  "[groan]",
  "[shush]",
  "[clear throat]",
  "[pause]"
]

export function GenerateTtsDialog({
  isOpen,
  onClose,
  customVoices,
  defaultVoices,
  preSelectedVoiceId,
  userCredits,
  onSuccess,
}: GenerateTtsDialogProps) {
  const [selectedVoiceId, setSelectedVoiceId] = React.useState("")
  const [text, setText] = React.useState("")
  const [selectedLanguage, setSelectedLanguage] = React.useState("en") // 'en' or 'hi'
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Autocomplete suggestions states
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestionFilter, setSuggestionFilter] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Merge options
  const allVoices = React.useMemo(() => [...defaultVoices, ...customVoices], [defaultVoices, customVoices])

  // Reset/Pre-select voice on open
  React.useEffect(() => {
    if (isOpen) {
      setText("")
      setShowSuggestions(false)
      if (preSelectedVoiceId) {
        setSelectedVoiceId(preSelectedVoiceId)
        const voice = allVoices.find(v => v.id === preSelectedVoiceId)
        if (voice) {
          setSelectedLanguage(voice.language || "en")
        }
      } else if (allVoices.length > 0) {
        setSelectedVoiceId(allVoices[0].id)
        setSelectedLanguage(allVoices[0].language || "en")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preSelectedVoiceId])

  // When voice selection changes, auto-align language
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedVoiceId(val)
    const voice = allVoices.find(v => v.id === val)
    if (voice) {
      setSelectedLanguage(voice.language || "en")
    }
  }

  // Calculate pricing: 10 credits per 500 characters
  const cost = React.useMemo(() => {
    if (text.length === 0) return 0
    return Math.ceil(text.length / 500) * 10
  }, [text])

  // Filter tags based on characters after '['
  const filteredTags = React.useMemo(() => {
    const searchStr = `[${suggestionFilter.toLowerCase()}`
    return GESTURE_TAGS.filter(tag => tag.toLowerCase().startsWith(searchStr))
  }, [suggestionFilter])

  const applySuggestion = (tag: string) => {
    if (!textareaRef.current) return
    const selectionEnd = textareaRef.current.selectionEnd
    const textBeforeCursor = text.substring(0, selectionEnd)
    const lastOpenBracket = textBeforeCursor.lastIndexOf("[")
    
    if (lastOpenBracket !== -1) {
      const before = text.substring(0, lastOpenBracket)
      const after = text.substring(selectionEnd)
      const newText = before + tag + after
      setText(newText.slice(0, 2000))
      setShowSuggestions(false)
      
      // Position cursor immediately after the completed tag
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = lastOpenBracket + tag.length
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPos, newPos)
        }
      }, 0)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 2000)
    setText(val)

    const selectionEnd = e.target.selectionEnd || 0
    const textBeforeCursor = val.substring(0, selectionEnd)
    
    const lastOpenBracket = textBeforeCursor.lastIndexOf("[")
    const lastCloseBracket = textBeforeCursor.lastIndexOf("]")

    if (lastOpenBracket !== -1 && lastOpenBracket > lastCloseBracket) {
      const filterText = textBeforeCursor.substring(lastOpenBracket + 1)
      if (!filterText.includes(" ") || filterText === "clear") {
        setSuggestionFilter(filterText)
        setShowSuggestions(true)
        setSelectedIndex(0)
        return
      }
    }
    
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredTags.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredTags.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredTags.length) % filteredTags.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        applySuggestion(filteredTags[selectedIndex])
      } else if (e.key === "Escape") {
        e.preventDefault()
        setShowSuggestions(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedVoiceId || !text.trim()) {
      toast.error("Please select a voice and enter some text.")
      return
    }

    if (text.length > 2000) {
      toast.error("Text exceeds 2,000 characters limit.")
      return
    }

    if (userCredits < cost) {
      toast.error(`Insufficient credits. You need ${cost} credits, but you only have ${userCredits}.`)
      return
    }

    const voice = allVoices.find(v => v.id === selectedVoiceId)
    if (!voice) {
      toast.error("Selected voice not found.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId: voice.id,
          voiceName: voice.name,
          voiceType: voice.type,
          text: text.trim(),
          language: selectedLanguage,
          voiceClipUrl: voice.voice_url,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || "Failed to initiate speech generation")
      }

      const resData = await response.json()
      toast.success("Text-to-speech generation task started in background!")
      onSuccess(resData.recording, resData.runId)
      onClose()
    } catch (err: any) {
      console.error("TTS generation initiation failed", err)
      toast.error(err.message || "Failed to start speech generation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedVoice = allVoices.find(v => v.id === selectedVoiceId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary text-emerald-400" />
            Generate Speech from Text
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Synthesize text to speech using cloned or default voices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="voice-select" className="text-zinc-300 text-xs font-semibold">
              Select Voice
            </Label>
            <select
              id="voice-select"
              value={selectedVoiceId}
              onChange={handleVoiceChange}
              disabled={isSubmitting}
              className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl h-10 w-full px-3 text-sm focus:border-zinc-700 outline-none"
            >
              <optgroup label="Default System Voices (Deepgram)">
                {defaultVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Default English)
                  </option>
                ))}
              </optgroup>
              {customVoices.length > 0 && (
                <optgroup label="Custom Cloned Voices">
                  {customVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.language === "hi" ? "Hindi/Multilingual" : "English"})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Language Selection: Enabled for default voices and custom multilingual voices. Locked only for custom English voices. */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-xs font-semibold">
              Language Model
            </Label>
            {selectedVoice?.type === "custom" && selectedVoice.language === "en" ? (
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl py-2 px-3 text-xs text-zinc-400 font-medium">
                Locked to: <span className="text-emerald-400 font-semibold">English (Turbo)</span> (defined during voice cloning)
              </div>
            ) : (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-100 h-10 rounded-xl px-3 text-xs font-medium cursor-pointer focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-zinc-950 text-zinc-200">
                    {lang.flag} &nbsp; {lang.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="tts-text" className="text-zinc-300 text-xs font-semibold">
                Text Prompt
              </Label>
              <span className={`text-[10px] font-semibold ${text.length > 1800 ? "text-amber-500" : "text-zinc-500"}`}>
                {text.length} / 2000
              </span>
            </div>
            
            <div className="relative">
              <Textarea
                id="tts-text"
                ref={textareaRef}
                placeholder="Type or paste the text you want to synthesize into speech. Custom tags like [chuckle], [sigh], or [gasp] can be used with English Turbo model..."
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                maxLength={2000}
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-100 rounded-xl h-32 resize-none text-xs leading-relaxed p-3 focus-visible:ring-0"
                required
              />

              {/* Gesture Autocomplete Popup Overlay */}
              {showSuggestions && filteredTags.length > 0 && (
                <div className="absolute left-3 bottom-full mb-1 z-50 min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 max-h-48 overflow-y-auto">
                  <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/60 mb-1">
                    Gesture Tags
                  </div>
                  {filteredTags.map((tag, idx) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => applySuggestion(tag)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${
                        idx === selectedIndex
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-100"
                      }`}
                    >
                      <span>{tag}</span>
                      {idx === selectedIndex && (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-extrabold uppercase">
                          Enter
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-medium italic">
              Tip: Type <span className="text-emerald-400 font-semibold">[</span> to get gesture suggestions (e.g. [chuckle], [sigh]). Supported by English Turbo voice.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Credit pricing</span>
              <p className="text-xs text-zinc-300 font-medium">10 credits per 500 characters</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Estimated cost</span>
              <p className="text-sm text-emerald-400 font-extrabold">{cost} credits</p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || text.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Generate Speech
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
