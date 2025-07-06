"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "../providers/SessionProvider"
import AuthInput from "./AuthInput"
import AuthFormError from "./AuthFormError"
import AuthFormSuccess from "./AuthFormSuccess"
import { Button } from "../../../components/ui/button"
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

export default function RegisterForm() {
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
  const [step, setStep] = useState(1)

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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate step 1 fields
    if (step === 1) {
      if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields.")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.")
        return
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.")
        return
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")
    // Validate step 2 fields
    if (!formData.university || !formData.program || !formData.year) {
      setError("Please fill in all fields.")
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
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-zinc-100">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-center mb-4 gap-2">
        <span className={`h-2 w-8 rounded-full transition-all ${step === 1 ? 'bg-blue-600' : 'bg-zinc-700'}`}></span>
        <span className={`h-2 w-8 rounded-full transition-all ${step === 2 ? 'bg-blue-600' : 'bg-zinc-700'}`}></span>
      </div>
      <form
        onSubmit={step === 1 ? handleNext : handleSubmit}
        className="space-y-4 max-h-[60vh] overflow-y-auto w-full"
        autoComplete="off"
      >
        {step === 1 && (
          <>
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
          </>
        )}
        {step === 2 && (
          <>
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
              placeholder="e.g. Computer Science"
              required
            />
            <AuthInput
              label="Year"
              type="number"
              value={formData.year}
              onChange={(value) => handleInputChange("year", value)}
              placeholder="e.g. 3"
              required
            />
          </>
        )}
        {error && <AuthFormError message={error} />}
        {success && <AuthFormSuccess message={success} />}
        <div className="flex w-full gap-2 pt-2 overflow-x-hidden">
          {step === 2 && (
            <Button
              type="button"
              variant="ghost"
              className="w-1/2 h-11 rounded-lg text-zinc-200 border border-zinc-700 hover:bg-zinc-800"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            className="w-1/2 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={isSubmitting}
          >
            {step === 1 ? "Next" : isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  )
} 