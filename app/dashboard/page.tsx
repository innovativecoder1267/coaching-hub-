'use client'

import {
  Users,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  CreditCard,
} from 'lucide-react'
import { SectionHeader } from '../components/sectionheader'
import { StatsCard } from '@/statcard'
import { ActivityItem } from '../components/activityitem'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/supabase.client'
export default function Dashboard() {
  const router = useRouter()
  const supabase=createClient()
  const [count, setcount] = useState<number | null>(null)
  const [pendingfee, setpendingfee] = useState<any | null>(null)
  const [attendancepercentage, setattendancepercentage] =
    useState<number | null>(null)

  const [attendancedata, setattendancedata] = useState<any[]>([])
  const [activity, setactivities] = useState<any[]>([])

  const [showview, setshowview] = useState(false)
  const [classes, setclass] = useState(false)

  const [showAttendance, setShowAttendance] = useState(false)

  const [students, setStudents] = useState<any[]>([])

  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, boolean>
  >({})

  const [scehduleclass, setscheduleclass] = useState({
    title: '',
    date: '',
    time: '',
  })

  const [username, setusername] = useState<string | null>(null)
  const [scheduleLength, setschedulelength] = useState<number>()
  const [ownerid,setownerid]=useState<any>()
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

  useEffect(() => {
    async function fetchPendingFees() {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'Pending')

      if (error) {
        console.error(error)
        return
      }

      const total = (data || []).reduce(
        (acc: number, curr: any) =>
          acc + (Number(curr.amount) || 0),
        0
      )

      setpendingfee(total)
    }

    fetchPendingFees()
  }, [])

  useEffect(() => {
    async function fetchActivities() {
    const { data, error } = await supabase
  .from('recent_activities')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5)

      if (error) {
        console.error(error)
        return
      }

      setactivities(data || [])
    }

    fetchActivities()
  }, [])

  useEffect(() => {
    async function fetchAttendancePercentage() {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')

      if (error) {
        console.error(error)
        return
      }

      const currentmonth = new Date().getMonth()
      const currentyear = new Date().getFullYear()

      const totaldays =
        data?.filter((record: any) => {
          const recordDate = new Date(record.date)

          return (
            recordDate.getMonth() === currentmonth &&
            recordDate.getFullYear() === currentyear
          )
        }).length || 0

      const presentdays =
        data?.filter((record: any) => {
          const recordDate = new Date(record.date)

          return (
            record.status === 'present' &&
            recordDate.getMonth() === currentmonth &&
            recordDate.getFullYear() === currentyear
          )
        }).length || 0

      const percentage =
        totaldays === 0
          ? 0
          : Math.round((presentdays / totaldays) * 100)

      setattendancepercentage(percentage)
    }

    fetchAttendancePercentage()
  }, [])
  useEffect(()=>{
    async function getuser(){
      const userid=await supabase.auth.getUser();
      setownerid(userid.data.user?.id)
    }
    getuser()
  })
  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        console.log(error.message)
        return
      }

      if (!data || data.length === 0) {
        setusername('User')
        return
      }

      setusername(data[0].owner_name)
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    async function fetchScheduleLength() {
      const { data, error } = await supabase
        .from('schedule_data')
        .select('*')

      if (error) {
        console.log(error)
        return
      }

      setschedulelength(data?.length || 0)
    }

    fetchScheduleLength()
  }, [])

  useEffect(() => {
    async function fetchStudentCount() {
      const { count, error } = await supabase
        .from('student')
        .select('*', { count: 'exact' })

      if (error) {
        console.log(error)
        return
      }

      setcount(count)
    }

    fetchStudentCount()
  }, [])

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase
        .from('student')
        .select('*')

      if (error) {
        console.log(error)
        return
      }

      setStudents(data || [])

      const initialAttendance: Record<string, boolean> = {}

      data?.forEach((student: any) => {
        initialAttendance[student.id] = true
      })

      setAttendanceMap(initialAttendance)
    }

    fetchStudents()
  }, [])

  async function setschedule() {
    const { error } = await supabase
      .from('schedule_data')
      .insert([
        {
          title: scehduleclass.title,
          date: scehduleclass.date,
          time: scehduleclass.time,
        },
      ])

    if (error) {
      console.log(error)
      return
    }

    alert('Class Scheduled Successfully')
    setclass(false)
  }

  async function saveAttendance() {
    const payload = students.map((student: any) => ({
      owner_id: ownerid,
      status: attendanceMap[student.id]
        ? 'present'
        : 'absent',
      date: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('attendance')
      .insert(payload)


      if (error) {
      console.log("error for the supabase is",error)
      alert('Failed to save attendance')
      return
    }

    alert('Attendance Saved Successfully')
    setShowAttendance(false)
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Welcome back, ${username}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"></div>
              <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h2>

              <button
                onClick={() => setshowview(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-4">
              {activity.map((activity, index) => (
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
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
                {activity.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.action}
                    description={activity.description}
                    time={activity.created_at}
                    type={
                      activity.action === 'fees'
                        ? 'success'
                        : activity.action === 'attendance'
                        ? 'warning'
                        : 'pending'
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {classes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Schedule New Class
                </h2>

                <button
                  onClick={() => setclass(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <form className="px-6 py-5 space-y-5">
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>

                  <input
                    type="date"
                    onChange={(e) =>
                      setscheduleclass({
                        ...scehduleclass,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>

                  <input
                    type="time"
                    onChange={(e) =>
                      setscheduleclass({
                        ...scehduleclass,
                        time: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  />
                </div>
              </form>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  onClick={() => setclass(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={setschedule}
                  className="px-5 py-2 rounded-lg bg-black text-white"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {showAttendance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-xl font-semibold">
                  Mark Attendance
                </h2>

                <button
                  onClick={() => setShowAttendance(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[450px] overflow-y-auto space-y-3">
                {students.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {student.name ||
                          student.student_name ||
                          student.full_name}
                      </p>
                    </div>

                    <label className="flex items-center gap-3">
                      <span className="font-medium">
                        {attendanceMap[student.id]
                          ? 'Present'
                          : 'Absent'}
                      </span>

                      <input
                        type="checkbox"
                        checked={
                          attendanceMap[student.id] || false
                        }
                        onChange={(e) =>
                          setAttendanceMap((prev) => ({
                            ...prev,
                            [student.id]: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  onClick={() => setShowAttendance(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={saveAttendance}
                  className="px-5 py-2 bg-black text-white rounded-lg"
                >
                  Save Attendance
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

            <button
              onClick={() => setShowAttendance(true)}
              className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
            >
              <TrendingUp size={18} />
              Mark Attendance
            </button>

            <button
              onClick={() => router.push('/dashboard/fees')}
              className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
            >
              <CreditCard size={18} />
              Record Payment
            </button>

            <button
              onClick={() => setclass(true)}
              className="w-full flex items-center justify-start gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
            >
              <BookOpen size={18} />
              Schedule Class
            </button>
          </div>
        </div>
      </div>
  )
}