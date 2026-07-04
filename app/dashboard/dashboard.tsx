'use client'
import {
  Users,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  UserCheck,
  CreditCard,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { SectionHeader } from '../components/sectionheader'
import { StatsCard } from '@/statcard'
import { ActivityItem } from '../components/activityitem'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/supabase.client'

export default function Dashboard() {
  const supabase=createClient()
    const [count,setcount]=useState<number|null>(null)
    const [pendingfee,setpendingfee]=useState<any|null>(null)
    const [attendancepercentage,setattendancepercentage]=useState<number|null>(null)
    const [attendancedata,setattendancedata]=useState<any[]>([])
    const [activity,setactivities]=useState<any[]|null>(null)
    const [showview,setshowview]=useState(false)
    const [scehduleclass,setscheduleclass]=useState({
      title:"",
      date:"",
      time:""
    })
    const [username,setusername]=useState<string|null>()
    const [classes,setclass]=useState(false)
    const [scheduleLength,setschedulelength]=useState<number>()
  const stats = [
  {
    label: 'Total Students',
    value: `${count}`,
    icon: Users,
    trend: { value: 12, isPositive: true },
    color: 'blue' as const,
  },
  {
    label: 'Pending Fees',
    value: `${pendingfee}`,
    icon: CreditCard,
    trend: { value: 8, isPositive: false },
    color: 'orange' as const,
  },
  {
    label: 'Attendance',
    value: `${attendancepercentage}%`,
    icon: CheckCircle2,
    trend: { value: 5, isPositive: true },
    color: 'green' as const,
  },
  {
    label: 'Upcoming Classes',
    value: `${scheduleLength}`,
    icon: BookOpen,
    color: 'blue' as const,
  },
]

    useEffect(()=>{
    async function fetchdata(){
      const {data,error}=await supabase.from("payments").select("*").eq("status","Pending")
      if(error){
        console.error("Error fetching pending fees:", error)
      }
    const total = (data || []).reduce(
    (acc: number, curr: any) => acc + (Number(curr.amount) || 0),
    0
)

    setpendingfee(total)
    }
    fetchdata()
  },[])
  useEffect(()=>{
    async function fetchactivities(){
      const {data,error}=await supabase.from("recent_activities").select("*").limit(5)
      console.log("Fetched recent activities:", data)  
      if(error){
        console.error("Error fetching recent activities:", error)
      }
      setactivities(data)
    }
    fetchactivities()
  },[])

  useEffect(()=>{
    async function fetchdata() {
      {
      const {data,error}=await supabase.from("attendance")
      .select("*")
      console.log("Fetched attendance data:", data) // Debug log
      if(error){
        console.error("Error fetching attendance data:", error)
      }
      const currentmonth=new Date().getMonth()
      const currentyear=new Date().getFullYear()
      const totaldays=data?.filter((record:any)=>{
        const recordDate=new Date(record.date)
        return recordDate.getMonth() === currentmonth && recordDate.getFullYear() === currentyear
      }).length

      const presentdays = data?.filter((record) => {
      const recordDate = new Date(record.date);
      return (
      record.status === "present" &&
      recordDate.getMonth() === currentmonth &&
      recordDate.getFullYear() === currentyear
    );
    }).length;

    const percentage =
  totaldays === 0
    ? 0
    : Math.round((presentdays / totaldays) * 100);

   setattendancepercentage(percentage);
   }
}
    fetchdata()

  },[])
    useEffect(()=>{
      async function fetchdata(){
        const {data,error}=await supabase.from("schedule_data").select("*")
         if(error?.message){
            console.log("SUPABASE ERROR:", error);
        }
         setschedulelength(data?.length)
      }
      fetchdata()
    },[])
    useEffect(()=>{
    async function fetchdata(){
    const {count,error}=await supabase.from("student").select("*", { count: "exact" ,head: true})
      if(error){
        console.log("SUPABASE ERROR:", error);
      }
     setcount(count)
    }  
    fetchdata()
  },[])
  async function setschedule() {
    const {error}=await supabase.from("schedule_data").insert([
    {
    title:scehduleclass.title,
    time:scehduleclass.time,
    date:scehduleclass.date
   }])
    if(error){
        console.error("Error fetching recent schedule:", error)
    }
    alert("scheduled success")
    setclass(false)
  }
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Welcome back, Rahul! 👋"
        description="Here's what's happening with your coaching classes today"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h2>
              <button
                onClick={()=>setshowview(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {activity?.map((activity, index) => (
                <ActivityItem
                  key={index}
                  title={activity.action}
                  description={activity.description}
                  time={activity.created_at}
                />
              ))}
            </div>
          </div>
        </div>
        {showview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  All Activities
                </h2>
                <button
                  onClick={() => setshowview(false)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {activity?.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.action}
                    description={activity.description}
                    time={activity.created_at}
                    type={
                      activity.action === "fees"
                        ? "success"
                        : activity.action === "attendance"
                        ? "warning"
                        : "pending"
                    }
                  />
                )
                )}
              </div>
            </div>
          </div>
        )}
{classes && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-fadeIn">
      
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Schedule New Class
        </h2>
        <button
          onClick={() => setclass(false)}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>
      </div>

      <form className="px-6 py-5 space-y-5">
        
        {/* Class Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Title
          </label>
          <input
            type="text"
            value={scehduleclass.title}
            onChange={(e) =>
              setscheduleclass({
                ...scehduleclass,
                title: e.target.value,
              })
            }
            placeholder="Enter class title..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
                       transition"
          />
        </div>

        {/* Example: Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            onChange={(e)=>
              setscheduleclass({
                ...scehduleclass,
                date:e.target.value
              })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
                       transition"
          />
        </div>

         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
               onChange={(e)=>
              setscheduleclass({
                ...scehduleclass,
                time:e.target.value
              })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
                       transition"
          />
        </div>
      </form>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t px-6 py-4">
        <button
          onClick={() => setclass(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 
                     hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
        onClick={setschedule}
          className="px-5 py-2 rounded-lg bg-black text-white 
                     hover:bg-gray-900 transition"
        >
          Schedule
        </button>
      </div>
    </div>
  </div>
)}

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors">
              <Users size={18} />
              Add Student
            </button>
            <button className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors">
              <TrendingUp size={18} />
              Mark Attendance
            </button>
            <button className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors">
              <CreditCard size={18} />
              Record Payment
            </button>
            <button 
            onClick={()=>setclass(true)}
            className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors">
              <BookOpen size={18} />

              Schedule Class
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
