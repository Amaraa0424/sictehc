"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "../providers/SessionProvider"
import AuthInput from "./AuthInput"
import AuthFormError from "./AuthFormError"
import AuthFormSuccess from "./AuthFormSuccess"
import { Button } from "../../../components/ui/button"

export default function LoginForm() {
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
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-zinc-100">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full bg-zinc-900 rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Sign in to UniConnect</h1>
        <p className="text-zinc-400 mb-6 text-center">Enter your credentials to access your account</p>
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-h-[60vh] overflow-y-auto px-1">
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-150"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
} 