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

const universities = [
  "National University of Mongolia",
  "Mongolian University of Science and Technology",
  "Mongolian National University of Medical Sciences",
  "Mongolian University of Life Sciences",
  "Mongolian State University of Education",
  "Mongolian University of Arts and Culture",
  "Mongolian University of Finance and Economics",
  "Mongolian University of Technology and Education",
  "Mongolian University of Business and Economics",
  "Mongolian University of Humanities and Social Sciences"
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp, user, loading } = useSession()
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    program: "",
    year: "",
    university: "",
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsSubmitting(false)
      return
    }

    try {
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        program: formData.program || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        university: formData.university || undefined,
      }

      const result = await signUp(userData)
      
      if (result.success) {
        setSuccess("Registration successful! Redirecting...")
        let redirectTo = searchParams.get("redirect") || "/"
        if (redirectTo === "/login" || redirectTo === "/register") {
          redirectTo = "/"
        }
        router.push(redirectTo)
      } else {
        setError(result.error || "Registration failed")
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
          <CardTitle className="text-2xl font-bold text-zinc-100">Create account</CardTitle>
          <CardDescription className="text-zinc-400">
            Join UniConnect to start sharing and discovering academic content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              placeholder="Enter your full name"
              required
            />
            
            <AuthInput
              label="Username"
              type="text"
              value={formData.username}
              onChange={(value) => handleInputChange("username", value)}
              placeholder="Choose a username"
              required
            />
            
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
              placeholder="Create a password"
              required
            />
            
            <AuthInput
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange("confirmPassword", value)}
              placeholder="Confirm your password"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">University</label>
              <Select value={formData.university} onValueChange={(value) => handleInputChange("university", value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {universities.map((university) => (
                    <SelectItem key={university} value={university} className="text-zinc-100">
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AuthInput
              label="Program"
              type="text"
              value={formData.program}
              onChange={(value) => handleInputChange("program", value)}
              placeholder="e.g., Computer Science"
            />
            
            <AuthInput
              label="Year"
              type="number"
              value={formData.year}
              onChange={(value) => handleInputChange("year", value)}
              placeholder="e.g., 3"
            />

            {error && <AuthFormError message={error} />}
            {success && <AuthFormSuccess message={success} />}

            <Button 
              type="submit" 
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <a href="/login" className="text-zinc-200 hover:text-zinc-100 underline">
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 