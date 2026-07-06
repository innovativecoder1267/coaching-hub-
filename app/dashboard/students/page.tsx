'use client'
import { useEffect, useState } from 'react'
import { Search, MoreVertical } from 'lucide-react'
import { SectionHeader } from '../../components/sectionheader'
import { cn } from '@/lib/utils'
import { useToast } from '../../context/page'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/supabase.client'

interface FullStudent {
  id: string
  name: string
  studentclass: string
  status: 'active' | 'inactive'
  feesDue: string
  email:string
  rollno:string
  studentcourse:string
}

export default function Students() {
    const supabase=createClient()

  const [searchQuery, setSearchQuery] = useState('')
  const { showToast } = useToast()
  const [email,setemail]=useState("")
  const [name,setname]=useState("")
  const [isadding,setisadding]=useState(false)
  const [rollno,setrollno]=useState("")
  const [studentcourse,setstudentcourse]=useState("")
  const [fulldata,setfulldata]=useState<FullStudent[]|any>([])
  const [studentclass,setstudentclass]=useState("")
  const [monthlyFee,setMonthlyFee]=useState("")
  const [admin,setadminid]=useState<string|bigint>()
  const filteredStudents = fulldata.filter((student:any)=>{
    const query=searchQuery.trim().toLowerCase();
    if(!query)return true;
    return student.name.toLowerCase().includes(query)

  })
  const handlestudent=async()=>{
    if(!name || !email||!rollno||!studentcourse||!studentclass||!monthlyFee||!admin){
      return showToast("error","Please provide all required fields")
    }
   const {data,error}=await supabase
  .from("student")
  .insert([{ name, email,rollno,subject:studentcourse,studentclass,monthlyFee,admin_info:admin }]);
  showToast("success","Students inserted success")
   }
  useEffect(()=>{
    async function fetchuser(){
    const {data,error}=await supabase.auth.getUser();
      if(error){
        console.error("Error submitting attendance:", error);
      }
       setadminid(data.user?.id)
      }
    fetchuser()
  },[])
  useEffect(()=>{
    async function fetchdata(){
      try {
         const { data,error}=await supabase.from("student").select("*");
      if(error){
        console.log("SUPABASE ERROR:", error);
     }
     setfulldata(data)
      } catch (error:Error|any) {
        showToast("error",`Failed to fetch students :${error.message}`)
      }
    }
    fetchdata()
  },[])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Students"
        description="Manage all enrolled students and their details"
      />

      <div className="flex flex-col sm:flex-row gap-4 text-black">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
        <Button className="mt-2" onClick={()=>setisadding(true)}>
          Add Student+
        </Button>
      </div>
      
    {isadding && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
      
      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Add New Student
      </h2>

       <div className="space-y-4">
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setname(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="text"
          placeholder="Roll Number"
          value={rollno}
          onChange={(e) => setrollno(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="text"
          placeholder="Course"
          value={studentcourse}
          onChange={(e) => setstudentcourse(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="text"
          placeholder="Class"
          value={studentclass}
          onChange={(e) => setstudentclass(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* ✅ Monthly Fee */}
        <input
          type="number"
          placeholder="Monthly Fee (₹)"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

       <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setisadding(false)}
          className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={handlestudent}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:opacity-90 transition"
        >
          Add Student
        </button>
      </div>
    </div>
  </div>
)} 
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Roll no
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Fees Due
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
            
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {student.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{student.studentclass}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        student.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{student.rollno}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        student.feesDue !== '₹0'
                          ? 'text-orange-600'
                          : 'text-green-600'
                      )}
                    >
                      {student.feesDue}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No students found</p>
          </div>
        )}
   
      </div>
    </div>
  )
}
