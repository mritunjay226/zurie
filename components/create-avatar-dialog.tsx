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
import { Input } from "@/components/ui/input"
import { insforge } from "@/app/lib/insforge/client"
import { Loader2, Upload, Sparkles, Check, RefreshCw, X, Image as ImageIcon } from "lucide-react"

interface CreateAvatarDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type StyleType = "podcast" | "casual" | "3d-cartoon" | "stylized"

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

function compressImageToWebP(dataUrl: string, quality: number = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get 2D context"))
        return
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"))
            return
          }
          const file = new File([blob], `avatar_${Date.now()}.webp`, { type: "image/webp" })
          resolve(file)
        },
        "image/webp",
        quality
      )
    }
    img.onerror = (err) => reject(err)
    img.src = dataUrl
  })
}

async function optimizeAndUpload(urlStr: string, nameHint: string): Promise<string> {
  try {
    let fileToUpload: File
    if (urlStr.startsWith("data:")) {
      fileToUpload = await compressImageToWebP(urlStr, 0.85)
    } else {
      // For remote URLs, fetch them, convert to WebP, and upload
      try {
        const response = await fetch(urlStr)
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        fileToUpload = await compressImageToWebP(objectUrl, 0.85)
        URL.revokeObjectURL(objectUrl)
      } catch (corsErr) {
        console.warn("CORS or fetch issue when optimizing remote URL, using original url", corsErr)
        return urlStr
      }
    }

    const bucket = insforge.storage.from("avatars")
    const { data, error } = await bucket.uploadAuto(fileToUpload)
    if (error) throw new Error(error.message)
    return data?.url || urlStr
  } catch (err) {
    console.error("Failed to optimize and upload", err)
    if (urlStr.startsWith("data:")) {
      try {
        const file = dataURLtoFile(urlStr, `${nameHint}.png`)
        const bucket = insforge.storage.from("avatars")
        const { data } = await bucket.uploadAuto(file)
        return data?.url || urlStr
      } catch (fallbackErr) {
        console.error("Raw fallback upload failed too", fallbackErr)
      }
    }
    return urlStr
  }
}

export function CreateAvatarDialog({ isOpen, onClose, onSuccess }: CreateAvatarDialogProps) {
  // Form Configuration States
  const [avatarName, setAvatarName] = React.useState("")
  const [selectedStyle, setSelectedStyle] = React.useState<StyleType>("casual")
  const [customPrompt, setCustomPrompt] = React.useState("")
  
  // Upload States
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadedUrl, setUploadedUrl] = React.useState("")
  const [uploadedKey, setUploadedKey] = React.useState("")

  // Generation / Loading States
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [runId, setRunId] = React.useState("")
  const [progress, setProgress] = React.useState(0)
  const [statusMessage, setStatusMessage] = React.useState("")
  const [generatedUrls, setGeneratedUrls] = React.useState<{ image_url_16_9: string; image_url_9_16: string } | null>(null)

  // Save state
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")

  // Clean states when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setAvatarName("")
      setSelectedStyle("casual")
      setCustomPrompt("")
      setUploadedUrl("")
      setUploadedKey("")
      setIsGenerating(false)
      setRunId("")
      setProgress(0)
      setStatusMessage("")
      setGeneratedUrls(null)
      setErrorMsg("")
    }
  }, [isOpen])

  // Handle source image upload to InsForge Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMsg("")
    try {
      const bucket = insforge.storage.from("avatars")
      const { data, error } = await bucket.uploadAuto(file)
      if (error) {
        throw new Error(error.message || "Failed to upload image")
      }
      if (data?.url) {
        setUploadedUrl(data.url)
        setUploadedKey(data.key)
        // Automatically prefill name if empty
        if (!avatarName) {
          const baseName = file.name.split('.')[0]
          setAvatarName(baseName.substring(0, 20))
        }
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Upload failed. Check your network or permissions.")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Direct Upload (bypass AI)
  const handleUploadAsIs = async () => {
    if (!uploadedUrl) return
    setIsSaving(true)
    setErrorMsg("")
    try {
      const name = avatarName.trim() || `${selectedStyle.toUpperCase()} Avatar`
      const res = await fetch("/api/avatar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          style: selectedStyle,
          prompt: customPrompt,
          image_url_16_9: uploadedUrl,
          image_url_9_16: uploadedUrl, // Use same URL for both in "As Is"
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to save avatar")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save custom avatar.")
    } finally {
      setIsSaving(false)
    }
  }

  // Trigger AI Generation Pipeline
  const handleGenerate = async () => {
    setIsGenerating(true)
    setErrorMsg("")
    setProgress(5)
    setStatusMessage("Submitting generation request...")
    try {
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          prompt: customPrompt,
          uploadedImgUrl: uploadedUrl || undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to trigger generation")
      }

      const { runId } = await res.json()
      setRunId(runId)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate AI generator.")
      setIsGenerating(false)
    }
  }

  // Poll generation status
  React.useEffect(() => {
    if (!runId || !isGenerating) return

    let pollInterval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/avatar/status/${runId}`)
        if (!res.ok) {
          throw new Error("Polling error")
        }
        const data = await res.json()
        setProgress(data.progress || 0)
        setStatusMessage(data.status || "Processing...")

        if (data.progress === 100 && data.output) {
          setGeneratedUrls({
            image_url_16_9: data.output.image_url_16_9,
            image_url_9_16: data.output.image_url_9_16,
          })
          setIsGenerating(false)
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error("Error polling generation status", err)
      }
    }

    pollInterval = setInterval(checkStatus, 1500)
    return () => clearInterval(pollInterval)
  }, [runId, isGenerating])

  // Save the generated avatars to library
  const handleSaveGenerated = async () => {
    if (!generatedUrls) return
    setIsSaving(true)
    setErrorMsg("")
    try {
      const name = avatarName.trim() || `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} AI Avatar`
      
      // Optimize and upload both images to storage as WebP
      const [finalLandscapeUrl, finalPortraitUrl] = await Promise.all([
        optimizeAndUpload(generatedUrls.image_url_16_9, `${name.toLowerCase().replace(/\s+/g, "-")}-16-9`),
        optimizeAndUpload(generatedUrls.image_url_9_16, `${name.toLowerCase().replace(/\s+/g, "-")}-9-16`)
      ])

      const res = await fetch("/api/avatar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          style: selectedStyle,
          prompt: customPrompt,
          image_url_16_9: finalLandscapeUrl,
          image_url_9_16: finalPortraitUrl,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to save generated avatar")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save generated avatar.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create Custom Avatar
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Configure parameters and synthesize photorealistic character presenters using Gemini Nano Banana.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* 1. CONFIGURATION VIEW */}
        {!isGenerating && !generatedUrls && (
          <div className="space-y-5 pt-2">
            {/* Template Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Upload Reference Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center aspect-video sm:h-32 border border-dashed border-zinc-800 hover:border-primary/50 bg-zinc-900/20 rounded-2xl cursor-pointer transition-all group overflow-hidden relative">
                    {uploadedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={uploadedUrl} alt="Uploaded source" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5 text-zinc-500">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                          <Upload className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                        )}
                        <span className="text-xs font-semibold text-zinc-400">
                          {isUploading ? "Uploading to Storage..." : "Upload base template"}
                        </span>
                        <span className="text-[10px] text-zinc-600">PNG, JPG up to 10MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadedUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setUploadedUrl(""); setUploadedKey(""); }}
                    className="border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 rounded-xl"
                  >
                    Clear Image
                  </Button>
                )}
              </div>
            </div>

            {/* Avatar Name */}
            <div className="space-y-2">
              <Label htmlFor="avatar-name" className="text-xs font-bold text-zinc-300">Avatar Name</Label>
              <Input
                id="avatar-name"
                placeholder="e.g. Host John Podcast"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-primary rounded-xl text-xs"
              />
            </div>

            {/* Style Selector */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-zinc-300">Avatar Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["podcast", "casual", "3d-cartoon", "stylized"] as StyleType[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-2xl border text-xs font-bold tracking-wide capitalize transition-all duration-300 ${
                      selectedStyle === style
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {style.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <Label htmlFor="custom-prompt" className="text-xs font-bold text-zinc-300">
                Custom Instructions (Optional)
              </Label>
              <Textarea
                id="custom-prompt"
                placeholder="Describe expression, clothing details, age, background style, etc."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-primary rounded-2xl text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 rounded-2xl text-xs font-bold"
              >
                Cancel
              </Button>

              {uploadedUrl && (
                <Button
                  variant="outline"
                  onClick={handleUploadAsIs}
                  disabled={isSaving || isUploading}
                  className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-50 rounded-2xl text-xs font-bold"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                  Upload as It Is
                </Button>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isUploading || isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 rounded-2xl text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Generate with AI
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* 2. GENERATION PROGRESS VIEW */}
        {isGenerating && !generatedUrls && (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
              <div className="absolute text-sm font-extrabold text-primary">
                {progress}%
              </div>
            </div>

            <div className="w-full max-w-md space-y-2 text-center">
              <p className="text-sm font-bold text-zinc-100">{statusMessage}</p>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">
                Long-running task managed by Trigger.dev. You can wait or close this dialog, and progress will sync.
              </p>
            </div>
          </div>
        )}

        {/* 3. GENERATION COMPLETED VIEW */}
        {generatedUrls && (
          <div className="space-y-6 pt-2">
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2.5 text-xs text-primary font-semibold">
              <Check className="w-4 h-4" />
              <span>Synthesis completed successfully! Previews generated below.</span>
            </div>

            {/* Side by side previews */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* 16:9 Landscape Preview (3 columns) */}
              <div className="md:col-span-3 space-y-2">
                <Label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Landscape Format (16:9)
                </Label>
                <div className="aspect-video relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-lg group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={generatedUrls.image_url_16_9} 
                    alt="16:9 preview" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                </div>
              </div>

              {/* 9:16 Portrait Preview (2 columns) */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Portrait Format (9:16)
                </Label>
                <div className="aspect-[9/16] relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-lg group max-h-56 md:max-h-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={generatedUrls.image_url_9_16} 
                    alt="9:16 preview" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setGeneratedUrls(null)
                  setIsGenerating(false)
                  setProgress(0)
                  setRunId("")
                }}
                className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 rounded-2xl text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Generate New
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                className="border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 rounded-2xl text-xs font-bold"
              >
                Cancel / Close
              </Button>

              <Button
                onClick={handleSaveGenerated}
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 rounded-2xl text-xs font-bold"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Check className="w-3.5 h-3.5 mr-2" />}
                Save to Library
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
