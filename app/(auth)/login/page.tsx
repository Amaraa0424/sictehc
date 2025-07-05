"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "../../components/providers/SessionProvider"
import AuthLayout from "../../components/auth/AuthLayout"
import AuthInput from "../../components/auth/AuthInput"
import AuthFormError from "../../components/auth/AuthFormError"
import AuthFormSuccess from "../../components/auth/AuthFormSuccess"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user, loading } = useSession()
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      let redirectTo = searchParams.get("redirect") || "/"
      if (redirectTo === "/login" || redirectTo === "/register") {
        redirectTo = "/"
      }
      router.push(redirectTo)
    }
  }, [user, loading, router, searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const result = await signIn(formData.email, formData.password)
      
      if (result.success) {
        setSuccess("Login successful! Redirecting...")
        let redirectTo = searchParams.get("redirect") || "/"
        if (redirectTo === "/login" || redirectTo === "/register") {
          redirectTo = "/"
        }
        router.push(redirectTo)
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-zinc-100">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              required
            />
            
            <AuthInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange("password", value)}
              placeholder="Enter your password"
              required
            />

            {error && <AuthFormError message={error} />}
            {success && <AuthFormSuccess message={success} />}

            <Button 
              type="submit" 
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-zinc-400">
              Don't have an account?{" "}
              <a href="/register" className="text-zinc-200 hover:text-zinc-100 underline">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 