// 'use client'

// import { useEffect, useState } from 'react'
// import { ChevronRight, ChevronLeft, Plus, X, Rocket, Check } from 'lucide-react'
// import supabase from '@/lib/supabase'
// import { useRouter } from 'next/navigation'
// // ─── Types ────────────────────────────────────────────────────────────────────

// type Purpose = 'personal' | 'coaching' | 'group' | null

// interface StudentForm {
//   name: string
//   grade: string
//   subject: string
//   contact: string
// }

// interface Student extends StudentForm {
//   id: string
// }

// interface QuickPrefs {
//   instituteName: string
//   city: string
//   feeCycle: string
//   referral: string
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PURPOSE_OPTIONS = [
//   {
//     id: 'personal' as Purpose,
//     icon: '🧑‍🏫',
//     label: 'Personal Tutor',
//     description: 'One-on-one teaching & private lessons',
//   },
//   {
//     id: 'coaching' as Purpose,
//     icon: '🏫',
//     label: 'Coaching Centre',
//     description: 'Manage a full coaching institute or academy',
//   },
//   {
//     id: 'group' as Purpose,
//     icon: '👥',
//     label: 'Group / Batch Classes',
//     description: 'Run batches, group sessions & workshops',
//   },
// ]

// const EMPTY_STUDENT: StudentForm = { name: '', grade: '', subject: '', contact: '' }

// // ─── Input Components ─────────────────────────────────────────────────────────

// function InputField({
//   label,
//   placeholder,
//   value,
//   onChange,
//   error,
// }: {
//   label: string
//   placeholder?: string
//   value: string
//   onChange: (v: string) => void
//   error?: string
// }) {
//   return (
//     <div>
//       <label className="block text-[11px] tracking-[0.1em] font-medium text-white/40 mb-1.5">
//         {label}
//       </label>
//       <input
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className={`w-full px-4 py-3 rounded-[10px] bg-white/[0.04] border text-white text-sm placeholder:text-white/20 outline-none transition-all ${
//           error
//             ? 'border-red-500/50 ring-2 ring-red-500/10'
//             : 'border-white/[0.07] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:bg-indigo-500/[0.04]'
//         }`}
//       />
//       {error && <p className="text-[11px] text-red-400/80 mt-1">{error}</p>}
//     </div>
//   )
// }

// function SelectField({
//   label,
//   value,
//   onChange,
//   options,
//   placeholder,
// }: {
//   label: string
//   value: string
//   onChange: (v: string) => void
//   options: string[]
//   placeholder?: string
// }) {
//   return (
//     <div>
//       <label className="block text-[11px] tracking-[0.1em] font-medium text-white/40 mb-1.5">
//         {label}
//       </label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full px-4 py-3 rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-white text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:bg-indigo-500/[0.04] [&>option]:bg-[#1a1a2e] [&>option]:text-white appearance-none cursor-pointer"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
//           backgroundRepeat: 'no-repeat',
//           backgroundPosition: 'right 14px center',
//         }}
//       >
//         {placeholder && <option value="">{placeholder}</option>}
//         {options.map((o) => (
//           <option key={o} value={o}>
//             {o}
//           </option>
//         ))}
//       </select>
//     </div>
//   )
// }

// // ─── Main Onboarding Component ────────────────────────────────────────────────

// export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
//   const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
//   const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
//   const [animating, setAnimating] = useState(false)

//   // Step 1 state
//   const [purpose, setPurpose] = useState<Purpose>(null)
//   const [purposeError, setPurposeError] = useState(false)

//   // Step 2 state
//   const [students, setStudents] = useState<Student[]>([])
//   const [showAddForm, setShowAddForm] = useState(false)
//   const [studentForm, setStudentForm] = useState<StudentForm>(EMPTY_STUDENT)
//   const [studentFormError, setStudentFormError] = useState(false)
//   const [userid,setuserid]=useState<string|null>()
//   const router=useRouter()
//   // Step 3 state
//   const [prefs, setPrefs] = useState<QuickPrefs>({
//     instituteName: '',
//     city: '',
//     feeCycle: '',
//     referral: '',
//   })

//   const [saving, setSaving] = useState(false)

//   // ── Navigation ────────────────────────────────────────────────────────────
//   function handle(){
//     router.push("/dashboard")
//   }
//   function navigate(to: 1 | 2 | 3 | 4, dir: 'forward' | 'backward') {
//     if (animating) return
//     setAnimating(true)
//     setDirection(dir)
//     setTimeout(() => {
//       setStep(to)
//       setAnimating(false)
//     }, 320)
//   }
//   useEffect(()=>{
//     async function fetchdata(){
//       const data=await supabase.auth.getUser();
//        setuserid(data.data.user?.id)
//     }
//     fetchdata()
//   },[])
//   function handleStep1Continue() {
//     if (!purpose) {
//       setPurposeError(true)
//       return
//     }
//     navigate(2, 'forward')
//   }

//   async function handleStep3Finish() {
//     navigate(4, 'forward')
//     setSaving(true)
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser()
//       if (!user) return

//       // Save to profiles table
//      const {error}= await supabase.from('profiles').insert({
//         purpose,
//         institute_name: prefs.instituteName,
//         city: prefs.city,
//         fee_cycle: prefs.feeCycle,
//         onboarding_complete: true,
//       })
//        if(error){
//         console.log("Error occured",error?.stack,error.details,error.hint,error.message)
//       }
//       // Save students if any

//       if (students.length > 0) {
//       const {error} = await supabase.from('student').insert(
//           students.map((s) => ({
//             name: s.name,
//             studentclass: s.grade,
//             subject: s.subject,
//             email: s.contact,
//             admin_info:userid
//           }))
//         )
//         if(error){
//           console.log("Error is",error?.message)
//         }
//       }
      
//      } catch (err) {
//       console.error('Onboarding save error:', err)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // ── Student management ────────────────────────────────────────────────────

//   function handleAddStudent() {
//     if (!studentForm.name.trim()) {
//       setStudentFormError(true)
//       return
//     }
//     setStudents((prev) => [...prev, { ...studentForm, id: crypto.randomUUID() }])
//     setStudentForm(EMPTY_STUDENT)
//     setStudentFormError(false)
//     setShowAddForm(false)
//   }

//   function handleRemoveStudent(id: string) {
//     setStudents((prev) => prev.filter((s) => s.id !== id))
//   }

//   // ── Animation classes ─────────────────────────────────────────────────────

//   const slideClass = animating
//     ? direction === 'forward'
//       ? 'opacity-0 -translate-x-8'
//       : 'opacity-0 translate-x-8'
//     :   'opacity-100 translate-x-0'

//   // ──────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="min-h-screen bg-[#1c1c35] flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Ambient background orbs */}
//       <div className="pointer-events-none fixed inset-0 overflow-hidden">
//         <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600 opacity-[0.08] blur-[100px] animate-pulse" />
//         <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-amber-500 opacity-[0.07] blur-[100px] animate-pulse [animation-delay:2s]" />
//         <div className="absolute top-1/2 left-2/3 w-[250px] h-[250px] rounded-full bg-emerald-500 opacity-[0.06] blur-[80px] animate-pulse [animation-delay:4s]" />
//       </div>

//       {/* Glass card */}
//       <div className="relative z-10 w-full max-w-[520px] rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-10">
//         {/* Progress bar */}
//         {step < 4 && (
//           <div className="flex gap-1.5 mb-10">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
//                   i < step
//                     ? 'bg-indigo-500'
//                     : i === step
//                     ? 'bg-gradient-to-r from-indigo-500 to-violet-400'
//                     : 'bg-white/10'
//                 }`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Animated content wrapper */}
//         <div className={`transition-all duration-300 ease-in-out ${slideClass}`}>
//           {/* ── STEP 1: Purpose ────────────────────────────────────────── */}
//           {step === 1 && (
//             <div>
//               <p className="text-[11px] tracking-[0.15em] uppercase text-white/30 font-medium mb-3">
//                 Step 1 of 3 · Getting started
//               </p>
//               <h2 className="font-serif text-[28px] font-light text-white leading-snug mb-2">
//                 What's your{' '}
//                 <em className="text-violet-400 not-italic font-light">purpose?</em>
//               </h2>
//               <p className="text-sm text-white/40 mb-8 leading-relaxed">
//                 This helps tailor your dashboard experience.{' '}
//                 <span className="text-red-400/80">Required to continue.</span>
//               </p>

//               <div className="flex flex-col gap-3 mb-2">
//                 {PURPOSE_OPTIONS.map((opt) => (
//                   <button
//                     key={opt.id}
//                     onClick={() => {
//                       setPurpose(opt.id)
//                       setPurposeError(false)
//                     }}
//                     className={`flex items-center gap-4 px-5 py-4 rounded-[14px] border text-left transition-all duration-200 ${
//                       purpose === opt.id
//                         ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_8px_24px_rgba(99,102,241,0.15)]'
//                         : 'border-white/[0.07] bg-white/[0.02] hover:border-indigo-500/40 hover:bg-indigo-500/[0.05] hover:-translate-y-0.5'
//                     }`}
//                   >
//                     <div
//                       className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${
//                         purpose === opt.id ? 'bg-indigo-500/20' : 'bg-white/[0.05]'
//                       }`}
//                     >
//                       {opt.icon}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-white">{opt.label}</p>
//                       <p className="text-xs text-white/40 mt-0.5">{opt.description}</p>
//                     </div>
//                     <div
//                       className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
//                         purpose === opt.id
//                           ? 'bg-indigo-500 border-indigo-500 text-white'
//                           : 'border-white/15'
//                       }`}
//                     >
//                       {purpose === opt.id && <Check size={11} strokeWidth={3} />}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//               {purposeError && (
//                 <p className="text-xs text-red-400/80 mt-3 mb-1 animate-[shake_0.3s_ease]">
//                   ⚠ Please select a purpose to continue
//                 </p>
//               )}

//               <button
//                 onClick={handleStep1Continue}
//                 className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] active:translate-y-0 transition-all duration-200"
//               >
//                 Continue <ChevronRight size={16} />
//               </button>
//             </div>
//           )}

//           {/* ── STEP 2: Add Students ────────────────────────────────────── */}
//           {step === 2 && (
//             <div>
//               <p className="text-[11px] tracking-[0.15em] uppercase text-white/30 font-medium mb-3">
//                 Step 2 of 3 · Your students
//               </p>
//               <h2 className="font-serif text-[28px] font-light text-white leading-snug mb-2">
//                 Add your{' '}
//                 <em className="text-violet-400 not-italic font-light">first students</em>
//               </h2>
//               <p className="text-sm text-white/40 mb-6 leading-relaxed">
//                 Add as many students as you want now. You can always add more later.
//               </p>

//               {/* Students list */}
//               {students.length > 0 && (
//                 <div className="mb-4 max-h-[200px] overflow-y-auto pr-1 space-y-2">
//                   {students.map((s) => (
//                     <div
//                       key={s.id}
//                       className="flex items-center justify-between px-4 py-3 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl"
//                     >
//                       <div>
//                         <p className="text-sm font-medium text-white">
//                           {s.name}{' '}
//                           {s.grade && (
//                             <span className="text-white/40 font-normal">· {s.grade}</span>
//                           )}
//                         </p>
//                         <p className="text-xs text-white/35 mt-0.5">
//                           {s.subject || 'General'}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => handleRemoveStudent(s.id)}
//                         className="text-white/25 hover:text-red-400 transition-colors p-1"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Add student form */}
//               {showAddForm && (
//                 <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-5 mb-4">
//                   <p className="text-xs font-medium text-white/50 mb-4 tracking-wide">
//                     NEW STUDENT
//                   </p>
//                   <div className="grid grid-cols-2 gap-3 mb-3">
//                     <InputField
//                       label="FULL NAME"
//                       placeholder="e.g. Arjun Sharma"
//                       value={studentForm.name}
//                       onChange={(v) => setStudentForm((f) => ({ ...f, name: v }))}
//                       error={
//                         studentFormError && !studentForm.name.trim() ? 'Required' : ''
//                       }
//                     />
//                     <InputField
//                       label="GRADE / CLASS"
//                       placeholder="e.g. Class 10"
//                       value={studentForm.grade}
//                       onChange={(v) => setStudentForm((f) => ({ ...f, grade: v }))}
//                     />
//                     <InputField
//                       label="SUBJECT"
//                       placeholder="e.g. Mathematics"
//                       value={studentForm.subject}
//                       onChange={(v) => setStudentForm((f) => ({ ...f, subject: v }))}
//                     />
//                     <InputField
//                       label="PARENT CONTACT"
//                       placeholder="e.g. 9876543210"
//                       value={studentForm.contact}
//                       onChange={(v) => setStudentForm((f) => ({ ...f, contact: v }))}
//                     />
//                   </div>
//                   <div className="flex gap-2 mt-1">
//                     <button
//                       onClick={handleAddStudent}
//                       className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-medium hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] transition-all"
//                     >
//                       Save Student
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowAddForm(false)
//                         setStudentForm(EMPTY_STUDENT)
//                         setStudentFormError(false)
//                       }}
//                       className="px-4 py-2 rounded-lg border border-white/[0.08] text-white/40 text-xs hover:text-white/70 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Add more button */}
//               {!showAddForm && (
//                 <button
//                   onClick={() => setShowAddForm(true)}
//                   className="w-full py-3 mb-5 flex items-center justify-center gap-2 border border-dashed border-white/15 rounded-xl text-white/35 text-sm hover:border-indigo-500/40 hover:text-violet-400 hover:bg-indigo-500/[0.04] transition-all"
//                 >
//                   <Plus size={16} />
//                   {students.length === 0 ? 'Add a Student' : 'Add Another Student'}
//                 </button>
//               )}

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => navigate(1, 'backward')}
//                   className="flex items-center gap-1.5 px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/50 text-sm font-medium hover:bg-white/[0.07] hover:text-white transition-all"
//                 >
//                   <ChevronLeft size={16} /> Back
//                 </button>
//                 <button
//                   onClick={() => navigate(3, 'forward')}
//                   className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] active:translate-y-0 transition-all duration-200"
//                 >
//                   Continue <ChevronRight size={16} />
//                 </button>
//               </div>
//               <p className="text-center mt-4 text-xs text-white/20">
//                 <button
//                   onClick={() => navigate(3, 'forward')}
//                   className="underline hover:text-white/40 transition-colors"
//                 >
//                   Skip for now
//                 </button>
//               </p>
//             </div>
//           )}

//           {/* ── STEP 3: Quick Prefs ─────────────────────────────────────── */}
//           {step === 3 && (
//             <div>
//               <p className="text-[11px] tracking-[0.15em] uppercase text-white/30 font-medium mb-3">
//                 Step 3 of 3 · Almost done
//               </p>
//               <h2 className="font-serif text-[28px] font-light text-white leading-snug mb-2">
//                 A few{' '}
//                 <em className="text-violet-400 not-italic font-light">quick details</em>
//               </h2>
//               <p className="text-sm text-white/40 mb-8 leading-relaxed">
//                 Help us set up your workspace just right.
//               </p>

//               <div className="space-y-4">
//                 <InputField
//                   label="YOUR INSTITUTE / TUTOR NAME"
//                   placeholder="e.g. Sharma Coaching Classes"
//                   value={prefs.instituteName}
//                   onChange={(v) => setPrefs((p) => ({ ...p, instituteName: v }))}
//                 />
//                 <div className="grid grid-cols-2 gap-3">
//                   <InputField
//                     label="CITY"
//                     placeholder="e.g. Delhi"
//                     value={prefs.city}
//                     onChange={(v) => setPrefs((p) => ({ ...p, city: v }))}
//                   />
//                   <SelectField
//                     label="FEE CYCLE"
//                     value={prefs.feeCycle}
//                     onChange={(v) => setPrefs((p) => ({ ...p, feeCycle: v }))}
//                     options={['Monthly', 'Quarterly', 'Yearly']}
//                     placeholder="Select..."
//                   />
//                 </div>
//                 <SelectField
//                   label="HOW DID YOU HEAR ABOUT US? (OPTIONAL)"
//                   value={prefs.referral}
//                   onChange={(v) => setPrefs((p) => ({ ...p, referral: v }))}
//                   options={[
//                     'Google Search',
//                     'Friend / Colleague',
//                     'Social Media',
//                     'WhatsApp / Community',
//                     'Other',
//                   ]}
//                   placeholder="Select (optional)"
//                 />
//               </div>

//               <div className="flex gap-3 mt-8">
//                 <button
//                   onClick={() => navigate(2, 'backward')}
//                   className="flex items-center gap-1.5 px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/50 text-sm font-medium hover:bg-white/[0.07] hover:text-white transition-all"
//                 >
//                   <ChevronLeft size={16} /> Back
//                 </button>
//                 <button
//                   onClick={handleStep3Finish}
//                   disabled={saving}
//                   className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
//                 >
//                   <Rocket size={16} />
//                   {saving ? 'Launching...' : 'Launch Dashboard'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ── STEP 4: Success ─────────────────────────────────────────── */}
//           {step === 4 && (
//             <div className="text-center">
//               <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl mx-auto mb-6 shadow-[0_16px_40px_rgba(16,185,129,0.3)] animate-[popIn_0.5s_cubic-bezier(0.22,1,0.36,1)]">
//                 ✓
//               </div>
//               <h2 className="font-serif text-[28px] font-light text-white leading-snug mb-2">
//                 You're all{' '}
//                 <em className="text-violet-400 not-italic font-light">set!</em>
//               </h2>
//               <p className="text-sm text-white/40 mb-8 leading-relaxed">
//                 Your coaching workspace is ready. Let's start managing your classes.
//               </p>
//               <div className="flex gap-4 mb-8">
//                 <div className="flex-1 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
//                   <p className="text-2xl font-semibold text-white">{students.length}</p>
//                   <p className="text-xs text-white/35 mt-1">Students Added</p>
//                 </div>
//                 <div className="flex-1 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
//                   <p className="text-2xl mt-1">
//                     {purpose === 'personal'
//                       ? '🧑‍🏫'
//                       : purpose === 'coaching'
//                       ? '🏫'
//                       : '👥'}
//                   </p>
//                   <p className="text-xs text-white/35 mt-1">
//                     {PURPOSE_OPTIONS.find((o) => o.id === purpose)?.label}
//                   </p>
//                 </div>
//               </div>
//                <button
//                 onClick={handle}
//                 className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] active:translate-y-0 transition-all duration-200"
//               >

//                 Go to Dashboard <ChevronRight size={16} />
//               </button>
//              </div>
//           )}
//         </div>
//       </div>

//       {/* Keyframes for animations */}
//       <style jsx global>{`
//         @keyframes shake {
//           0%,
//           100% {
//             transform: translateX(0);
//           }
//           25% {
//             transform: translateX(-4px);
//           }
//           75% {
//             transform: translateX(4px);
//           }
//         }
//         @keyframes popIn {
//           from {
//             transform: scale(0);
//             opacity: 0;
//           }
//           to {
//             transform: scale(1);
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }
