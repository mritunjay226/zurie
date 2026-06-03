"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, ArrowRight, Sparkles, Loader2, AlertCircle, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const startWithVerify = searchParams.get("verify") === "true"

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState(initialEmail)
  const [password, setPassword] = React.useState("")
  
  // Verification states
  const [showVerification, setShowVerification] = React.useState(startWithVerify)
  const [otp, setOtp] = React.useState("")
  
  const [loading, setLoading] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [successMessage, setSuccessMessage] = React.useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.")
      return
    }

    setErrorMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.message || "Registration failed.")
        setLoading(false)
        return
      }

      if (result.requireEmailVerification) {
        setShowVerification(true)
        setSuccessMessage("Account registered! We have sent a verification code to your email.")
      } else {
        // Verification not required - sign in automatically by redirecting
        router.push("/dashboard")
      }
      setLoading(false)
    } catch (err: any) {
      setErrorMessage("An unexpected network error occurred.")
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP code.")
      return
    }

    setErrorMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.message || "Invalid or expired verification code.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setErrorMessage("An unexpected verification error occurred.")
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) return
    setErrorMessage("")
    setResending(true)

    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const result = await response.json()
        setErrorMessage(result.message || "Failed to resend verification code.")
      } else {
        setSuccessMessage("A fresh verification code has been sent to your email.")
      }
    } catch (err) {
      setErrorMessage("Failed to resend due to a network error.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 overflow-hidden font-sans select-none">
      {/* Futuristic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.79_0.16_80_/_0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.79_0.16_80_/_0.05),transparent_50%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary/90">AI Studio SaaS</span>
          </div>
        </div>

        <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(250,204,21,0.15)] rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 border-b border-zinc-800/40">
            <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-zinc-50 via-zinc-100 to-primary bg-clip-text text-transparent">
              {showVerification ? "Verify Email" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-zinc-400 text-sm">
              {showVerification
                ? `Enter the 6-digit code sent to ${email}`
                : "Join AI Studio to generate and customize models."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {errorMessage && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive-foreground rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Error</AlertTitle>
                <AlertDescription className="text-xs text-destructive-foreground/90">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <AlertTitle className="font-semibold text-emerald-400">Success</AlertTitle>
                <AlertDescription className="text-xs text-emerald-400/90">{successMessage}</AlertDescription>
              </Alert>
            )}

            {!showVerification ? (
              /* Step 1: Sign-Up Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-zinc-400 text-xs font-semibold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="pl-10 bg-zinc-950/40 border-zinc-800 focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl py-5 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-400 text-xs font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10 bg-zinc-950/40 border-zinc-800 focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl py-5 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-zinc-400 text-xs font-semibold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10 bg-zinc-950/40 border-zinc-800 focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl py-5 text-sm transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all text-sm mt-6"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Step 2: OTP Verification Form */
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-zinc-400 text-xs font-semibold block text-center">
                    Verification Code
                  </Label>
                  <div className="relative max-w-xs mx-auto">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      disabled={loading}
                      className="pl-11 bg-zinc-950/40 border-zinc-800 tracking-[0.3em] font-mono text-center text-lg focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl py-5 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center">
                    Please enter the 6-digit numeric code sent to your inbox.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={resending || loading}
                    onClick={handleResendOtp}
                    className="text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5 mx-auto font-medium"
                  >
                    {resending ? (
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    ) : null}
                    Didn&apos;t get the code? Resend
                  </button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="pb-6 pt-2 border-t border-zinc-800/40 flex justify-center bg-zinc-950/20">
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignUpForm />
    </React.Suspense>
  )
}
