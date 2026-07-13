"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/supabase.client"
import { useToast } from "../context/page"
import { NextRequest } from "next/server"
export default function SignupPage(request:NextRequest) {
  const [email, setEmail] = useState("")
const supabase = createClient()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const {showToast}=useToast();
  const handleSignup = async (e:any) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      showToast("error" , error.message)
      setLoading(false)
      return
    }
    console.log("Session:", data.session)
    showToast("success","Logged in successfully!")
    router.push("/onboardingflow")
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
        Login into your account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        {/* Redirect to login */}
        <p className="text-sm text-center mt-4">
            Don't have an account?{" "} 
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  )
}
