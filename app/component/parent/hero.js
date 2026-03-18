"use client"
import { GraduationCap, TrendingUp, DollarSign, Bell, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import { authFetch } from "../admin/utils/api"  // ✅ reuse the same helper
import { API } from "../../config/api"

const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

const getAvgColor = (avg) => {
    if (avg >= 70) return "text-green-500"
    if (avg >= 50) return "text-yellow-500"
    return "text-orange-400"
}

const ParentDashboard = () => {
    const [user,          setUser]          = useState(null)
    const [children,      setChildren]      = useState([])   // ✅ always array
    const [results,       setResults]       = useState([])
    const [announcements, setAnnouncements] = useState([])
    const [fees,          setFees]          = useState([])

    const getChildren = async (parentId) => {
        try {
            const res  = await authFetch(`${API}/student/parent/${parentId}`)
            const data = await res.json()
            const list = Array.isArray(data) ? data : []  // ✅ guard
            setChildren(list)
            return list
        } catch (err) { console.log(err); return [] }
    }

    const getResults = async () => {
        try {
            const res  = await authFetch(`${API}/result`)
            const data = await res.json()
            setResults(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
    }

    const getAnnouncements = async () => {
        try {
            const res  = await authFetch(`${API}/alert/get`)
            const data = await res.json()
            const list = Array.isArray(data) ? data : []
            setAnnouncements(list.filter(a => a.to === "Parent" || a.to === "All"))
        } catch (err) { console.log(err) }
    }

    const getFees = async (childrenList) => {
        try {
            const allFees = await Promise.all(
                childrenList.map(child =>
                    authFetch(`${API}/fees/parent/${child._id}`)
                        .then(r => r.json())
                        .then(d => Array.isArray(d) ? d : [])
                )
            )
            setFees(allFees.flat())
        } catch (err) { console.log(err) }
    }

    useEffect(() => {
        const stored = localStorage.getItem("user")
        if (!stored) return
        const parsed = JSON.parse(stored)
        setUser(parsed)
        getChildren(parsed.id).then(mine => {
            if (mine.length > 0) getFees(mine)
        })
        getResults()
        getAnnouncements()
    }, [])

    const getStudentAvg = (studentId) => {
        const studentResults = results.filter(r => r.studentId === studentId)
        if (studentResults.length === 0) return 0
        const sum = studentResults.reduce((acc, r) => acc + (r.total || 0), 0)
        return Math.round(sum / studentResults.length)
    }

    // ✅ Array.isArray guard prevents .reduce crash
    const safeChildren = Array.isArray(children) ? children : []

    const overallAvg = safeChildren.length === 0 ? 0 :
        Math.round(safeChildren.reduce((acc, c) => acc + getStudentAvg(c._id), 0) / safeChildren.length)

    const pendingFees = fees
        .filter(f => f.status !== "paid")
        .reduce((acc, f) => acc + Number(f.amount || 0), 0)

    const cards = [
        { title: "My Children",          value: safeChildren.length,     icon: <GraduationCap size={22} className="text-blue-400" />,   bg: "bg-blue-50 border-blue-100",   iconBg: "bg-blue-100",   id: 1 },
        { title: "Average Performance",  value: `${overallAvg}%`,        icon: <TrendingUp size={22} className="text-green-400" />,     bg: "bg-green-50 border-green-100", iconBg: "bg-green-100",  id: 2 },
        { title: "Pending Fees",         value: `₦${pendingFees.toLocaleString()}`, icon: <DollarSign size={22} className="text-orange-400" />, bg: "bg-orange-50 border-orange-100", iconBg: "bg-orange-100", id: 3 },
        { title: "Announcements",        value: announcements.length,    icon: <Bell size={22} className="text-gray-400" />,            bg: "bg-gray-50 border-gray-100",   iconBg: "bg-gray-200",   id: 4 },
    ]

    return (
        <div>
            <Sidebar />
            <div className="md:ml-64 px-6 pt-8 pb-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-black">
                        Welcome, {user?.name?.split(" ")[0] || "Parent"}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">View your children's progress and manage payments</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {cards.map((card) => (
                        <div key={card.id} className={`border rounded-2xl p-5 flex items-center justify-between ${card.bg}`}>
                            <div>
                                <p className="text-xs text-black mb-2">{card.title}</p>
                                <h2 className="text-2xl font-bold text-black">{card.value}</h2>
                            </div>
                            <div className={`p-3 rounded-xl ${card.iconBg}`}>{card.icon}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    {/* Children list */}
                    <div className="w-full lg:w-1/2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <GraduationCap size={16} className="text-blue-200" /> My Children
                        </h2>
                        {safeChildren.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">No children linked to your account</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {safeChildren.map((child) => {
                                    const avg = getStudentAvg(child._id)
                                    const hasPendingFee = fees.some(f => f.studentId === child._id && f.status !== "paid")
                                    return (
                                        <div key={child._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-blue-200">{getInitials(child.fullname)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-black">{child.fullname}</p>
                                                    <p className="text-xs text-gray-400">{child.studentClass}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold ${getAvgColor(avg)}`}>{avg}% avg</span>
                                                {hasPendingFee && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-200">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Announcements */}
                    <div className="w-full lg:w-1/2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Bell size={16} className="text-yellow-500" /> Recent Announcements
                        </h2>
                        {announcements.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">No announcements yet</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {announcements.slice(0, 3).map((a) => (
                                    <div key={a._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold text-black">{a.title}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} />{new Date(a.createdAt).toLocaleDateString("en-CA")}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed">{a.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Fee table */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                    <h2 className="font-bold text-sm p-5 flex items-center gap-2 border-b border-gray-100">
                        <DollarSign size={16} className="text-green-500" /> Recent Fee Payments
                    </h2>
                    <table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Child", "Term", "Amount", "Status", "Due Date"].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs text-black font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fees.length === 0 ? (
                                <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-8">No fee records found</td></tr>
                            ) : fees.slice(0, 5).map((fee) => {
                                const child = safeChildren.find(c => c._id === fee.studentId)
                                return (
                                    <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-black">{child?.fullname || fee.studentName || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-black">{fee.term}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-black">₦{Number(fee.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${fee.status === "paid"
                                                ? "text-green-600 bg-green-50 border-green-200"
                                                : "text-yellow-600 bg-yellow-50 border-yellow-200"}`}>
                                                {fee.status === "paid" ? "Paid" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString("en-CA") : "—"}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ParentDashboard