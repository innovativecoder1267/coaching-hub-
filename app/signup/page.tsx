"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/supabase.client"
import { useToast } from "../context/page"
 
export default function SignupPage() {
  const supabase=createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [username,setusername]=useState<string|any>("")
  const {showToast}=useToast()
  const router = useRouter()

  const handleSignup = async (e:any) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options:{
      emailRedirectTo: "http://localhost:3000/onboardingflow",
        data:{
         username
        },
        
      }
    })
    if (error) {
      console.log(JSON.stringify(error, null, 2))
      showToast("error","User name already exists")
      setLoading(false)
      return
    }
    console.log("Signup successful:", data)

    router.push("/verifypage")
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
        <input
            type="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Creating account..." : "Sign Up"}
         
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}
