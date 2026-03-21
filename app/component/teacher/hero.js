"use client"
import { BookOpen, DollarSign, CheckCircle, Calendar1Icon, Clock, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from './sidebar'
import { useTeacher, teacherFetch, API_BASE } from "./utils/api"
import { API } from "../../config/api"
import { EdvanceIcon } from "../EdvanceLogo"

const TeacherDashboard = () => {

    const { user } = useTeacher()

    const [stats, setStats] = useState({
        myClasses: 0,
        totalStudents: 0,
        monthlySalary: 0,
        salaryStatus: "unpaid"
    })

    const [announcements, setAnnouncements] = useState([])
    const [meetings, setMeetings]           = useState([])

    const getStats = async () => {
        try {
            // ✅ Read id from localStorage — same object saved at login
            const stored = localStorage.getItem("user")
            if (!stored) return
            const parsed = JSON.parse(stored)
            const id = parsed.id || parsed._id   // handles both key shapes
            if (!id) return

            // ✅ API_BASE — no more hardcoded localhost
            const res = await teacherFetch(`${API_BASE}/teacher/dashboard-stats/${id}`)
            if (!res.ok) return
            const result = await res.json()
            setStats({
                myClasses:     result.myClasses     || 0,
                totalStudents: result.totalStudents || 0,
                monthlySalary: result.monthlySalary || 0,
                salaryStatus:  result.salaryStatus  || "unpaid"
            })
        } catch (err) {
            console.log("Stats error:", err.message)
        }
    }

    const getAnnouncements = async () => {
        try {
            // ✅ API_BASE
            const res    = await teacherFetch(`${API_BASE}/alert/get`)
            if (!res.ok) return
            const result = await res.json()
            const data   = Array.isArray(result) ? result : []
            setAnnouncements(data.filter(a => a.to === "Teachers" || a.to === "All"))
        } catch (err) {
            console.log("Announcements error:", err.message)
        }
    }

    const getMeetings = async () => {
        try {
            // ✅ API_BASE
            const res    = await teacherFetch(`${API_BASE}/pta/get`)
            if (!res.ok) return
            const result = await res.json()
            const data   = Array.isArray(result) ? result : []
            setMeetings(data.filter(m => m.allTeachers === true).slice(0, 3))
        } catch (err) {
            console.log("Meetings error:", err.message)
        }
    }

    useEffect(() => {
        getStats()
        getAnnouncements()
        getMeetings()
    }, [])

    const cards = [
        {
            title: "My Classes",
            value: stats.myClasses,
            sub:   "Active classes",
            icon:  <BookOpen size={34} className="p-1.5 text-blue-200 bg-blue-100 rounded-xl" />,
            id: 1
        },
        {
            title: "Total Students",
            value: stats.totalStudents,
            sub:   "In your classes",
            icon:  <EdvanceIcon size={34} className="p-1.5 text-green-500 bg-green-100 rounded-xl" />,
            id: 2
        },
        {
            title: "Monthly Salary",
            value: `₦${Number(stats.monthlySalary).toLocaleString()}`,
            sub:   "This month",
            icon:  <DollarSign size={34} className="p-1.5 text-yellow-500 bg-yellow-100 rounded-xl" />,
            id: 3
        },
        {
            title: "Salary Status",
            value: stats.salaryStatus,
            sub:   "Current period",
            icon:  <CheckCircle size={34} className="p-1.5 text-purple-500 bg-purple-100 rounded-xl" />,
            id: 4,
            isStatus: true
        }
    ]

    return (
        <div>
            <Sidebar />

            {/* Top Banner */}
            <div className="fixed top-0 left-0 right-0 md:ml-64 font-sans h-16 border-b border-gray-200 px-4 py-3 bg-white z-10 flex items-center justify-between">
                <div>
                    {/* ✅ user.name from useTeacher hook — updates live on profile change */}
                    <h1 className="text-black font-semibold text-sm">
                        WELCOME BACK, {user?.name || user?.fullname || "Teacher"}
                    </h1>
                    <p className="text-xs text-gray-400">Here's your teaching overview</p>
                </div>
            </div>

            <div className="md:ml-64 pt-20 px-4 pb-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {cards.map((card) => (
                        <div key={card.id} className="p-4 shadow-md rounded-xl bg-gray-100 space-y-1">
                            <p className="flex items-center justify-between text-xs text-black mb-1">
                                {card.title}
                                <span>{card.icon}</span>
                            </p>
                            <h1 className={`text-xl font-bold font-sans mb-1 capitalize
                                ${card.isStatus
                                    ? card.value === "paid"
                                        ? "text-green-500"
                                        : "text-red-500"
                                    : "text-black"
                                }`}>
                                {card.value}
                            </h1>
                            <p className="text-sm text-gray-400">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col lg:flex-row gap-6 mb-6">

                    {/* Upcoming PTA Meetings */}
                    <div className="w-full lg:w-1/2 shadow-md rounded-xl p-4">
                        <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Calendar1Icon size={16} className="text-blue-200" /> Upcoming PTA Meetings
                        </h2>
                        {meetings.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">No upcoming meetings</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {meetings.map((m) => (
                                    <div key={m._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="text-xs font-semibold text-black">{m.title}</p>
                                            <p className="text-xs text-gray-400">{m.agenda}</p>
                                            <span className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar1Icon size={10} />{m.date}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} />{m.time}
                                                </p>
                                            </span>
                                        </div>
                                        <span className="text-xs bg-blue-100 text-blue-200 px-2 py-0.5 rounded-xl capitalize">
                                            {m.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Announcements */}
                    <div className="w-full lg:w-1/2 shadow-md rounded-xl p-4">
                        <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Bell size={16} className="text-blue-200" /> Recent Announcements
                        </h2>
                        {announcements.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">No announcements yet</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {announcements.slice(0, 4).map((a) => (
                                    <div key={a._id} className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-semibold text-black mb-1">{a.title}</p>
                                        <p className="text-xs text-gray-400">{a.message}</p>
                                        <p className="text-xs text-gray-300 mt-1">
                                            {new Date(a.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric", month: "short", day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Salary History placeholder */}
                <div className="shadow-xl p-4 w-full bg-gray-200">
                    <span className="flex items-center gap-2 text-sm">
                        <DollarSign size={20} className="text-green-400/50" />
                        <p>Salary History</p>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TeacherDashboard