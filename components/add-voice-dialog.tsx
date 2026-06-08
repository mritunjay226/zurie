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
import { Input } from "@/components/ui/input"
import { insforge } from "@/app/lib/insforge/client"
import { Loader2, Upload, Volume2 } from "lucide-react"
import { toast } from "sonner"

interface AddVoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (voice: any, runId: string) => void
}

export function AddVoiceDialog({ isOpen, onClose, onSuccess }: AddVoiceDialogProps) {
  const [voiceName, setVoiceName] = React.useState("")
  const [selectedLanguage, setSelectedLanguage] = React.useState("en") // 'en' or 'hi'
  const [file, setFile] = React.useState<File | null>(null)
  
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset state when opening/closing
  React.useEffect(() => {
    if (isOpen) {
      setVoiceName("")
      setSelectedLanguage("en")
      setFile(null)
      setUploadProgress(0)
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Verify audio duration roughly or restrict file type
    if (!selectedFile.type.startsWith("audio/")) {
      toast.error("Please upload an audio file (WAV or MP3).")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.warning("This file is quite large. Shorter 10-second clips (< 2MB) work best and upload faster without timing out.")
    }

    setFile(selectedFile)
    if (!voiceName) {
      const baseName = selectedFile.name.split(".")[0]
      setVoiceName(baseName.substring(0, 30))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !voiceName.trim()) {
      toast.error("Please fill in all fields and upload a voice sample.")
      return
    }

    setIsSubmitting(true)
    setIsUploading(true)
    setUploadProgress(15)

    try {
      // 1. Upload sample to InsForge storage 'audio' bucket
      const bucket = insforge.storage.from("audio")
      setUploadProgress(40)
      
      const { data, error } = await bucket.uploadAuto(file)
      if (error || !data?.url) {
        throw new Error(error?.message || "Failed to upload voice sample to storage")
      }

      setUploadProgress(80)

      // 2. Trigger cloning endpoint
      const response = await fetch("/api/voice/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: voiceName.trim(),
          sampleUrl: data.url,
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || "Failed to submit cloning request")
      }

      const resData = await response.json()
      toast.success("Voice cloning task initiated in background!")
      onSuccess(resData.voice, resData.runId)
      onClose()
    } catch (err: any) {
      console.error("Cloning submission failed", err)
      toast.error(err.message || "Failed to start voice cloning.")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary text-emerald-400" />
            Clone a New Voice
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Upload a short 10-second audio clip of the target voice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="voice-name" className="text-zinc-300 text-xs font-semibold">
              Voice Name
            </Label>
            <Input
              id="voice-name"
              placeholder="e.g. My Podcast Voice"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              maxLength={40}
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-100 h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-zinc-300 text-xs font-semibold">
              Language Model
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedLanguage("en")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedLanguage === "en"
                    ? "bg-zinc-900 border-emerald-500 text-emerald-400"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                English Only (Turbo)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage("hi")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedLanguage === "hi"
                    ? "bg-zinc-900 border-emerald-500 text-emerald-400"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                Multilingual (Hindi/23+ Lg)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-xs font-semibold">Voice Sample (approx. 10s)</Label>
            <div className="border border-dashed border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/30 relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <Upload className="w-8 h-8 text-zinc-500" />
              <span className="text-xs text-zinc-300 font-medium">
                {file ? file.name : "Click to upload voice sample"}
              </span>
              <span className="text-[10px] text-zinc-500">
                WAV, MP3, or M4A (Max 10MB)
              </span>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>Uploading to InsForge...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

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
              disabled={isSubmitting || !file}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Start Cloning
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
