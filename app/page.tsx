
'use client'

import Link from 'next/link'
import { BarChart3, IndianRupee, Users } from 'lucide-react'

export default function LandingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-white to-[#e0e7ff] text-gray-800">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 backdrop-blur-xl bg-white/60 border-b border-white/30 sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Coaching Manager
        </h1>

        <div className="flex items-center gap-8">
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">Home</Link>
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">Features</Link>
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">Contact</Link>

          <Link href="/login">
            <button className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
              Login
            </button>
          </Link>

          <Link href="/signup">
            <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-105 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-10 py-20 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left */}
        <div className="max-w-xl space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Manage{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Students
            </span>{' '}
            & Fees Effortlessly
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            A modern system to track attendance, manage fees, and monitor your coaching business — all in one place.
          </p>

          <div className="flex gap-4">
            <button className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-xl hover:scale-105 transition">
              Get Started
            </button>

            <button className="px-7 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
              Demo
            </button>
          </div>
        </div>

        {/* Right - Premium Dashboard Card */}
        <div className="w-full max-w-lg relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 blur-3xl opacity-20 rounded-3xl"></div>

          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-blue-100/70 text-center">
                <Users className="mx-auto mb-1 text-blue-600" size={20} />
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-xl font-bold text-blue-700">120</p>
              </div>

              <div className="p-4 rounded-xl bg-green-100/70 text-center">
                <BarChart3 className="mx-auto mb-1 text-green-600" size={20} />
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-xl font-bold text-green-700">85</p>
              </div>

              <div className="p-4 rounded-xl bg-orange-100/70 text-center">
                <IndianRupee className="mx-auto mb-1 text-orange-600" size={20} />
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-orange-700">₹18k</p>
              </div>
            </div>

            {/* Payments */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Recent Payments</h3>

              <div className="flex justify-between bg-white shadow-sm border rounded-lg px-4 py-3 hover:shadow-md transition">
                <span>Rahul Sharma</span>
                <span className="font-semibold text-green-600">₹2000</span>
              </div>

              <div className="flex justify-between bg-white shadow-sm border rounded-lg px-4 py-3 hover:shadow-md transition">
                <span>Anita Patel</span>
                <span className="font-semibold text-green-600">₹1500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-10 py-20">
        <h2 className="text-4xl font-bold text-center mb-14">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="group bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-xl transition">
            <Users className="text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Attendance Tracking</h3>
            <p className="text-gray-600 text-sm">
              Easily mark and monitor student attendance with one click.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-xl transition">
            <IndianRupee className="text-indigo-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Fee Management</h3>
            <p className="text-gray-600 text-sm">
              Keep track of payments, dues, and financial records seamlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-xl transition">
            <BarChart3 className="text-green-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Dashboard Insights</h3>
            <p className="text-gray-600 text-sm">
              Get real-time analytics and insights to grow your coaching center.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 border-t border-gray-200">
        <p className="text-sm">
          © 2026 Coaching Manager. Crafted with precision.
        </p>
      </footer>

    </div>
  )
}