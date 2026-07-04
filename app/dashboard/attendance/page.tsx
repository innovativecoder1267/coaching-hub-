'use client'
import { useState,useEffect } from 'react'
import { Check, X, CheckSquare } from 'lucide-react'
import { SectionHeader } from '../../components/sectionheader'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/supabase.client'
interface FullStudent {
  id: string
  name: string
}

export default function Attendance() {
  const supabase=createClient()
   const [selectedClass, setSelectedClass] = useState('Advanced Python')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  
  const [attendance, setattendance]=useState<{[key:string]:boolean}>({})
  const [fulldata,setfulldata]=useState<FullStudent[]|any>([])
  const [ownerid,setownerid]=useState<string|any>("")
  useEffect(()=>{
    async function fetchdata(){
      try {
      const { data,error}=await supabase.from("student").select("*");
      setfulldata(data)
      if(error){
        console.log("SUPABASE ERROR:", error);
      }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }
    fetchdata()
  },[])
  const toggleattendance=(id:any)=>{
    setattendance((prev)=>({
      ...prev,
      [id]:!prev[id]
    }))
  }

  useEffect(()=>{
    async function fetchowner(){
      const {data,error}=await supabase.auth.getUser();
      if(error){
        console.log("SUPABASE AUTH ERROR:", error);
      }
       setownerid(data?.user?.id)
    }
    fetchowner();
  },[])

  async function submitattendance(){
      const Records=Object.entries(attendance).map(([id,isPresent])=>({
        date:selectedDate,
        status:isPresent?"present" : "absent",
        owner_id:ownerid
     }))

    const { data,error}=await supabase.from("attendance").insert(Records)
    if(error){
         return new Response("Error inserting attendance", { status: 500 })
    }
      alert("Attendance submitted successfully!")
      await supabase.from("recent_activities").insert({
        action:"attendance",
        description:`Attendance for ${selectedDate} submitted`,
        admin_id:ownerid
      })
}
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Attendance"
        description="Mark attendance for your classes"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedClass}
            </h2>
          
          </div>
   
        </div>

        <div className="space-y-3">
          {fulldata.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <p className="font-medium text-slate-900">{record.name}</p>
              <button
              onClick={()=>toggleattendance(record.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                  attendance[record.id]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-400 text-gray-100'
                )}
              >
                {attendance[record.id] ? (
                  <>
                    <CheckSquare size={18} />
                    Present                    
                  </>
                ):(
                  <>
                    <X size={18} />
                    Absent
                  </>
                )}
              </button>  
             </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
          onClick={submitattendance}
          className="flex-1 border border-slate-300 text-slate-900 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            Submit Attendance
          </button>

        </div>
      </div>
    </div>
  )
}