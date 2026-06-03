"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState("")

  React.useEffect(() => {
    if (errorParam === "oauth_failed") {
      setErrorMessage("Authentication failed. Please try again.")
    } else if (errorParam === "missing_verifier") {
      setErrorMessage("Secure authentication verification failed. Verifier token missing.")
    } else if (errorParam === "exchange_failed") {
      setErrorMessage("Failed to exchange OAuth token. Please try again.")
    }
  }, [errorParam])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setErrorMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          // Email not verified, redirect to sign-up to complete verification
          router.push(`/sign-up?email=${encodeURIComponent(email)}&verify=true`)
          return
        }
        setErrorMessage(result.message || "Invalid credentials.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setErrorMessage("An unexpected network error occurred.")
      setLoading(false)
    }
  }

  const handleOAuth = (provider: string) => {
    setOauthLoading(provider)
    // Redirects directly to the initiation route
    window.location.href = `/api/auth/oauth?provider=${provider}`
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
            <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary/90">AI Studio SaaS</span>
          </div>
        </div>

        <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(250,204,21,0.15)] rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 border-b border-zinc-800/40">
            <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-zinc-50 via-zinc-100 to-primary bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-zinc-400 text-sm">
              Sign in to manage and run your AI generation pipeline.
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

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={loading || oauthLoading !== null}
                onClick={() => handleOAuth("google")}
                className="border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/80 hover:text-zinc-50 rounded-xl py-5 transition-all text-xs flex gap-2"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={loading || oauthLoading !== null}
                onClick={() => handleOAuth("github")}
                className="border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/80 hover:text-zinc-50 rounded-xl py-5 transition-all text-xs flex gap-2"
              >
                {oauthLoading === "github" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                )}
                GitHub
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative z-10 bg-zinc-900/60 px-3 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                Or Continue With
              </span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
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
                    disabled={loading || oauthLoading !== null}
                    className="pl-10 bg-zinc-950/40 border-zinc-800 focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl py-5 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-400 text-xs font-semibold">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || oauthLoading !== null}
                    className="pl-10 bg-zinc-950/40 border-zinc-800 focus-visible:ring-primary/80 focus-visible:border-primary/80 rounded-xl py-5 text-sm transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || oauthLoading !== null}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all text-sm mt-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pb-6 pt-2 border-t border-zinc-800/40 flex justify-center bg-zinc-950/20">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignInForm />
    </React.Suspense>
  )
}
