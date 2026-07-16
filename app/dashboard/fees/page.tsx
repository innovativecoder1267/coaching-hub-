 
'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Phone, Mail } from 'lucide-react'
import { SectionHeader } from '@/app/components/sectionheader'
import { useToast } from '@/app/context/page'

import { createClient } from '@/lib/supabase/supabase.client'
export default function Fees() {
  const supabase=createClient()
  const [students, setstudents] = useState<any[]|any>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [status, setStatus] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [studentid,setstudentid]=useState()
  const [ownerid,setownerid]=useState<string|any>("")
  const [pendingPayments, setPendingPayments] = useState<any[]>([]) // NEW
  const { showToast } = useToast()
  const currentStudent = students.find(
    (s:any) => s.name === selectedStudent
  )

  // NEW: total due for the currently selected student
  const currentStudentDue = pendingPayments
    .filter((p:any) => p.name === selectedStudent)
    .reduce((sum:number, p:any) => sum + Number(p.amount || 0), 0)

  const paymentstatus = [
    { label: 'Paid'},
    { label: 'Pending'},
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    Submitfees()
  }
  useEffect(() => {
    async function fetchPendingPayments() {
      const {data,error}=await supabase.from("payments").select("name,amount").eq("status","Pending")
      if(error){
        console.log("SUPABASE ERROR:", error);
        return
      }
      console.log("Data from the current month is",data)
      setPendingPayments(data || []) // NEW: store in state
    }
    fetchPendingPayments();
  },[])


    useEffect(()=>{
    async function fetchowner(){
      const {data,error}=await supabase.auth.getUser();
      if(error){
        console.log("SUPABASE AUTH ERROR:", error);
      }
      console.log("Current user:", data?.user?.id);
      setownerid(data?.user?.id)
    }
    fetchowner();
  },[])
  async function Submitfees() {
       const {data,error}=await supabase.from("payments").insert({
        name:selectedStudent,
        amount,
        method:paymentMethod,
        owner_id:ownerid,
        status,
        payment_date:new Date().toISOString(),
        month:new Date().toLocaleString('default', { month: 'long' }),
    })
    if(error){
        console.log("SUPABASE ERROR:", error);
        return new Response(JSON.stringify({error:error}), { status: 500 });
    }
    showToast("success","Fees recorded successfully")
    const {data:activityData,error:activityError}=await supabase.from("recent_activities").insert({
        action:"fees",
        description:`Payment of ₹${amount} recorded for student ${selectedStudent} with status ${status}`
      })
      if(activityError){
        console.error("Error recording activity:",activityError)
      }

    // OPTIONAL: refresh pending payments after a new submission
    const { data: refreshed, error: refreshError } = await supabase
      .from("payments")
      .select("name,amount")
      .eq("status", "Pending")
    if (!refreshError) {
      setPendingPayments(refreshed || [])
    }
  }

  useEffect(() => {
    async function fetchdata() {
      try {
      const { data,error}=await supabase.from("student").select("*");
    
      if(error){
        console.log("SUPABASE ERROR:", error);
     }
     console.log("Fetched students:", data);
     setstudents(data)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }
    fetchdata()
  }, [])

 
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Manage Fees"
        description="Record payments and track fee collections"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Fee Payment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                <label className="block text-sm font-medium mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) =>{
                  const selectedname=e.target.value
                  setSelectedStudent(e.target.value)
                  const foundedstudent=students.find((s:any)=>
                   s.name===selectedname
                  )
                  if(foundedstudent){
                    setstudentid(foundedstudent.id)
                  }
                
                  }}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  {students.map((student:any) => (
                    <option
                      key={student.name}
                      value={student.name}
                    >
                      {student.name} - {student.class}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  <option value="">Select status</option>
                  {paymentstatus.map((item) => (
                    <option
                      key={item.label}
                      value={item.label}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {status === 'Paid' && (
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Payment Method
                  </label>

                  <div className="space-y-3">
                    {[
                      { value: 'cash', label: 'Cash' },
                      { value: 'upi', label: 'UPI' },
                      { value: 'card', label: 'Card' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={
                            paymentMethod === method.value
                          }
                          onChange={(e) =>
                            setPaymentMethod(e.target.value)
                          }
                        />
                        <span className="ml-2">
                          {method.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

               <div>
                <label className="block text-sm font-medium mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-black px-4 py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <DollarSign size={20} />
                Record Payment
              </button>
            </form>
          </div>
        </div>

        {currentStudent && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-6">
              Student Details
            </h2>

            <div className="space-y-4">
              <p>
                <strong>Name:</strong> {currentStudent.name}
              </p>
              <p>
                <strong>Class:</strong> {currentStudent.studentclass}
              </p>
              <p>
                <strong>Due:</strong> ₹{currentStudentDue}
              </p>

              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+91 9876543210</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{currentStudent.email}</span>
              </div>
                <div className="flex items-center gap-2">
                <span>{currentStudent.subject}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
