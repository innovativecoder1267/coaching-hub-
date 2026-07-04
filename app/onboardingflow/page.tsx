'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X, Rocket, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/supabase.client'
import { useRouter } from 'next/navigation'
// ─── Types ────────────────────────────────────────────────────────────────────

type Purpose = 'personal' | 'coaching' | 'group' | null

interface StudentForm {
  name: string
  grade: string
  subject: string
  contact: string
}

interface Student extends StudentForm {
  id: string
}

interface QuickPrefs {
  instituteName: string
  city: string
  feeCycle: string
  referral: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPOSE_OPTIONS = [
  {
    id: 'personal' as Purpose,
    icon: '🧑‍🏫',
    label: 'Personal Tutor',
    description: 'One-on-one teaching & private lessons',
  },
  {
    id: 'coaching' as Purpose,
    icon: '🏫',
    label: 'Coaching Centre',
    description: 'Manage a full coaching institute or academy',
  },
  {
    id: 'group' as Purpose,
    icon: '👥',
    label: 'Group / Batch Classes',
    description: 'Run batches, group sessions & workshops',
  },
]

const EMPTY_STUDENT: StudentForm = { name: '', grade: '', subject: '', contact: '' }

// ─── Input Components ─────────────────────────────────────────────────────────

function InputField({
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.1em] font-medium text-white/40 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-[10px] bg-white/[0.04] border text-white text-sm placeholder:text-white/20 outline-none transition-all ${
          error
            ? 'border-red-500/50 ring-2 ring-red-500/10'
            : 'border-white/[0.07] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:bg-indigo-500/[0.04]'
        }`}
      />
      {error && <p className="text-[11px] text-red-400/80 mt-1">{error}</p>}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.1em] font-medium text-white/40 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-white text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:bg-indigo-500/[0.04] [&>option]:bg-[#1a1a2e] [&>option]:text-white appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Main Onboarding Component ────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const supabase=createClient()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animating, setAnimating] = useState(false)

  // Step 1 state
  const [purpose, setPurpose] = useState<Purpose>(null)
  const [purposeError, setPurposeError] = useState(false)

  // Step 2 state
  const [students, setStudents] = useState<Student[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [studentForm, setStudentForm] = useState<StudentForm>(EMPTY_STUDENT)
  const [studentFormError, setStudentFormError] = useState(false)
  const [userid,setuserid]=useState<string|null>()
  const router=useRouter()
  // Step 3 state
  const [prefs, setPrefs] = useState<QuickPrefs>({
    instituteName: '',
    city: '',
    feeCycle: '',
    referral: '',
  })

  const [saving, setSaving] = useState(false)

  // ── Navigation ────────────────────────────────────────────────────────────
  function handle(){
    router.push("/dashboard")
  }
  function navigate(to: 1 | 2 | 3 | 4, dir: 'forward' | 'backward') {
    if (animating) return
    setAnimating(true)
    setDirection(dir)
    setTimeout(() => {
      setStep(to)
      setAnimating(false)
    }, 320)
  }
  useEffect(()=>{
    async function fetchdata(){
      const data=await supabase.auth.getUser();
       setuserid(data.data.user?.id)
    }
    fetchdata()
  },[])
  function handleStep1Continue() {
    if (!purpose) {
      setPurposeError(true)
      return
    }
    navigate(2, 'forward')
  }

  async function handleStep3Finish() {
    navigate(4, 'forward')
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      // Save to profiles table
     const {error}= await supabase.from('profiles').insert({
        owner_info:user.id,
        owner_email:user.email,
        owner_name:user.user_metadata.username,
        purpose,
        institute_name: prefs.instituteName,
        city: prefs.city,
        fee_cycle: prefs.feeCycle,
        onboarding_complete: true,
      })
       if(error){
        console.log("Error occured",error?.stack,error.details,error.hint,error.message)
      }
      // Save students if any

      if (students.length > 0) {
      const {error} = await supabase.from('student').insert(
          students.map((s) => ({
            name: s.name,
            studentclass: s.grade,
            subject: s.subject,
            email: s.contact,
            admin_info:userid
          }))
        )
        if(error){
          console.log("Error is",error?.message)
        }
      }
      
     } catch (err) {
      console.error('Onboarding save error:', err)
    } finally {
      setSaving(false)
    }
  }

  // ── Student management ────────────────────────────────────────────────────

  function handleAddStudent() {
    if (!studentForm.name.trim()) {
      setStudentFormError(true)
      return
    }
    setStudents((prev) => [...prev, { ...studentForm, id: crypto.randomUUID() }])
    setStudentForm(EMPTY_STUDENT)
    setStudentFormError(false)
    setShowAddForm(false)
  }

  function handleRemoveStudent(id: string) {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  // ── Animation classes ─────────────────────────────────────────────────────

  const slideClass = animating
  ? direction === 'forward'
    ? 'opacity-0 translate-x-10 scale-[0.98]'
    : 'opacity-0 -translate-x-10 scale-[0.98]'
  : 'opacity-100 translate-x-0 scale-100'
  // ──────────────────────────────────────────────────────────────────────────

return (
  <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-6 py-10">
    <div className="w-full max-w-7xl bg-white rounded-[32px] border border-[#ececf2] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
      
      <div className="grid lg:grid-cols-[360px_1fr] min-h-[760px]">

        {/* LEFT PANEL */}
        <div className="border-r border-[#f0f0f4] px-10 py-14 flex flex-col justify-center bg-white">
          
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold w-fit mb-8">
            STEP {step > 3 ? 3 : step} OF 3
          </div>

          <h1 className="text-[46px] leading-[1.1] font-semibold text-[#111827] mb-6">
            Let&apos;s build your
            <span className="block text-violet-600">
              coaching journey
            </span>
          </h1>

          <p className="text-[15px] leading-7 text-[#6b7280] mb-12">
            Tell us your primary purpose and we’ll personalize your dashboard experience.
          </p>

          <div className="space-y-8">

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-xl">
                👥
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Personalized for you
                </h3>
                <p className="text-sm text-[#6b7280] leading-6">
                  Get a dashboard tailored to your goals and workflows.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Smart & efficient
                </h3>
                <p className="text-sm text-[#6b7280] leading-6">
                  Access the tools and insights that matter most.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-xl">
                🚀
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Grow with confidence
                </h3>
                <p className="text-sm text-[#6b7280] leading-6">
                  Everything you need to manage and scale your institute.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl">
                🔒
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Secure & private
                </h3>
                <p className="text-sm text-[#6b7280] leading-6">
                  Your data is protected with enterprise-grade security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="px-12 py-12 bg-white overflow-hidden">
          {/* Progress */}
          {step < 4 && (
            <div className="flex items-center gap-3 mb-14 max-w-[500px]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-[4px] flex-1 rounded-full transition-all duration-300 ${
                    i <= step
                      ? 'bg-violet-600'
                      : 'bg-[#515d77]'
                      }
                  }`}
                />
              ))}
            </div>
          )}
      <div
    className={`transition-all duration-300 ease-in-out ${slideClass}`}
  >
          {/* STEP 1 */}
          {step === 1 && (
            <div className="max-w-[760px]">
              
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-violet-600 mb-4">
                Getting Started
              </p>

              <h2 className="text-[42px] font-semibold leading-tight text-[#111827] mb-4">
                What&apos;s your primary purpose?
              </h2>

              <p className="text-[#6b7280] text-[15px] mb-10">
                This helps us customize your dashboard to match your goals.
              </p>

              <div className="space-y-4">

                {PURPOSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPurpose(opt.id)
                      setPurposeError(false)
                    }}
                    className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl border transition-all duration-200 ${
                      purpose === opt.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-[#ececf2] hover:border-violet-300 hover:bg-[#fafaff]'
                    }`}
                  >

                    <div className="w-14 h-14 rounded-2xl bg-[#f4f4f8] flex items-center justify-center text-2xl">
                      {opt.icon}
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-[#111827] text-[17px]">
                        {opt.label}
                      </h3>

                      <p className="text-sm text-[#6b7280] mt-1">
                        {opt.description}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        purpose === opt.id
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'border-[#d1d5db]'
                      }`}
                    >
                      {purpose === opt.id && (
                        <Check size={14} strokeWidth={3} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {purposeError && (
                <p className="text-sm text-red-500 mt-4">
                  Please select a purpose to continue
                </p>
              )}

              <button
                onClick={handleStep1Continue}
                className="mt-10 w-full h-[58px] rounded-2xl bg-violet-600 hover:bg-violet-700 transition-colors text-white font-semibold flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight size={18} />
              </button>

              <p className="mt-5 text-sm text-[#9ca3af] flex items-center gap-2">
                🔒 Your data is secure and private. You can change this anytime.
              </p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="max-w-[760px]">

              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-violet-600 mb-4">
                Your Students
              </p>

              <h2 className="text-[38px] font-semibold leading-tight text-[#111827] mb-4">
                Add your first students
              </h2>

              <p className="text-[#6b7280] text-[15px] mb-8">
                Add students now or skip and do it later.
              </p>

              {students.length > 0 && (
                <div className="space-y-3 mb-6">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-5 rounded-2xl border border-[#ececf2] bg-[#fafafa]"
                    >
                      <div>
                        <p className="font-semibold text-[#111827]">
                          {s.name}
                        </p>

                        <p className="text-sm text-[#6b7280]">
                          {s.subject || 'General'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveStudent(s.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAddForm && (
                <div className="border border-[#ececf2] rounded-3xl p-6 mb-6 bg-[#fafafa]">
                  <div className="grid grid-cols-2 gap-4">

                    <input
                      placeholder="Student Name"
                      value={studentForm.name}
                      onChange={(e) =>
                        setStudentForm((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      className="h-12 px-4 rounded-xl border border-[#e5e7eb] outline-none"
                    />

                    <input
                      placeholder="Grade"
                      value={studentForm.grade}
                      onChange={(e) =>
                        setStudentForm((f) => ({
                          ...f,
                          grade: e.target.value,
                        }))
                      }
                      className="h-12 px-4 rounded-xl border border-[#e5e7eb] outline-none"
                    />

                    <input
                      placeholder="Subject"
                      value={studentForm.subject}
                      onChange={(e) =>
                        setStudentForm((f) => ({
                          ...f,
                          subject: e.target.value,
                        }))
                      }
                      className="h-12 px-4 rounded-xl border border-[#e5e7eb] outline-none"
                    />

                    <input
                      placeholder="Email"
                      value={studentForm.contact}
                      onChange={(e) =>
                        setStudentForm((f) => ({
                          ...f,
                          contact: e.target.value,
                        }))
                      }
                      className="h-12 px-4 rounded-xl border border-[#e5e7eb] outline-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleAddStudent}
                      className="px-5 h-11 rounded-xl bg-violet-600 text-white font-medium"
                    >
                      Save Student
                    </button>

                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-5 h-11 rounded-xl border border-[#e5e7eb]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full h-[56px] border border-dashed border-[#d1d5db] rounded-2xl text-[#6b7280] hover:border-violet-400 hover:text-violet-600 transition-all mb-8"
                >
                  + Add Student
                </button>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => navigate(1, 'backward')}
                  className="h-[56px] px-6 rounded-2xl border border-[#e5e7eb] font-medium"
                >
                  Back
                </button>

                <button
                  onClick={() => navigate(3, 'forward')}
                  className="flex-1 h-[56px] rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  Continue
                </button>
              </div>
 
            </div>
            
          )}
              {step === 3 && (
  <div className="max-w-[760px]">

    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-violet-600 mb-4">
      Final Details
    </p>

    <h2 className="text-[38px] font-semibold leading-tight text-[#111827] mb-4">
      Setup your workspace
    </h2>

    <p className="text-[#6b7280] text-[15px] mb-10">
      Just a few quick details before launching your dashboard.
    </p>

    <div className="space-y-5">

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Institute Name
        </label>

        <input
          type="text"
          placeholder="Enter institute name"
          value={prefs.instituteName}
          onChange={(e) =>
            setPrefs((p) => ({
              ...p,
              instituteName: e.target.value,
            }))
          }
          className="w-full h-[56px] px-5 rounded-2xl border border-[#e5e7eb] outline-none focus:border-violet-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">
            City
          </label>

          <input
            type="text"
            placeholder="Enter city"
            value={prefs.city}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                city: e.target.value,
              }))
            }
            className="w-full h-[56px] px-5 rounded-2xl border border-[#e5e7eb] outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">
            Fee Cycle
          </label>

          <select
            value={prefs.feeCycle}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                feeCycle: e.target.value,
              }))
            }
            className="w-full h-[56px] px-5 rounded-2xl border border-[#e5e7eb] outline-none focus:border-violet-500"
          >
            <option value="">Select</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Referral Source
        </label>

        <select
          value={prefs.referral}
          onChange={(e) =>
            setPrefs((p) => ({
              ...p,
              referral: e.target.value,
            }))
          }
          className="w-full h-[56px] px-5 rounded-2xl border border-[#e5e7eb] outline-none focus:border-violet-500"
        >
          <option value="">Select</option>
          <option value="Google">Google</option>
          <option value="Friend">Friend</option>
          <option value="YouTube">YouTube</option>
          <option value="Instagram">Instagram</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>

    <div className="flex gap-4 mt-10">

      <button
        onClick={() => navigate(2, 'backward')}
        className="h-[56px] px-6 rounded-2xl border border-[#e5e7eb] font-medium"
      >
        Back
      </button>

      <button
        onClick={handleStep3Finish}
        disabled={saving}
        className="flex-1 h-[56px] rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
      >
        {saving ? 'Launching...' : 'Launch Dashboard'}
      </button>
    </div>
  </div>
)}

{/* STEP 4 */}
{step === 4 && (
  <div className="text-center max-w-[560px] mx-auto">

    <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-4xl mx-auto mb-8">
      🎉
    </div>

    <h2 className="text-[42px] font-semibold text-[#111827] mb-4">
      You're all set!
    </h2>

    <p className="text-[#6b7280] text-lg mb-10">
      Your coaching workspace is ready to go.
    </p>

    <div className="grid grid-cols-2 gap-4 mb-10">

      <div className="rounded-3xl border border-[#ececf2] p-6 bg-[#fafafa]">
        <p className="text-4xl font-bold text-violet-600">
          {students.length}
        </p>

        <p className="text-sm text-[#6b7280] mt-2">
          Students Added
        </p>
      </div>

      <div className="rounded-3xl border border-[#ececf2] p-6 bg-[#fafafa]">
        <p className="text-4xl mb-2">
          {purpose === 'personal'
            ? '🧑‍🏫'
            : purpose === 'coaching'
            ? '🏫'
            : '👥'}
        </p>

        <p className="text-sm text-[#6b7280]">
          {PURPOSE_OPTIONS.find((o) => o.id === purpose)?.label}
        </p>
      </div>
    </div>

    <button
      onClick={handle}
      className="w-full h-[58px] rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
    >
      Go to Dashboard
    </button>
  </div>
)}
</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes popIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  </div>
  )
}