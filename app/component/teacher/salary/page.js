'use client'
import { useState, useEffect } from 'react'
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react'
import Sidebar from '../sidebar'
import { useTeacher, teacherFetch, API_BASE } from '../utils/api'
import { API } from "../../../config/api"

export default function TeacherSalary() {
    const { user } = useTeacher()
    const [teacher,  setTeacher]  = useState(null)
    const [history,  setHistory]  = useState([])
    const [loading,  setLoading]  = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // ✅ Read teacher ID properly — handles both id and _id shapes
    const teacherId = user?.id || user?._id

    // ✅ Fetch teacher profile — correct route is /teacher/:id (NOT /teachers/:id)
    const getSalaryData = async (id) => {
        try {
            const res = await teacherFetch(`${API_BASE}/teacher/${id}`)
            if (!res.ok) return
            const data = await res.json()
            setTeacher(data)
        } catch (err) {
            console.log('getSalaryData error:', err.message)
        }
    }

    // ✅ Fetch salary history — mounted at /teacherSalary in server.js
    const getSalaryHistory = async (id) => {
        try {
            const res = await teacherFetch(`${API}/teacherSalary/history/${id}`)
            if (!res.ok) return
            const data = await res.json()
            setHistory(Array.isArray(data) ? data : [])
        } catch (err) {
            console.log('getSalaryHistory error:', err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!teacherId) { setLoading(false); return }
        getSalaryData(teacherId)
        getSalaryHistory(teacherId)
    }, [teacherId])

    const statusColor = (status) =>
        status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 md:ml-64">
                {/* Mobile header */}
                <div className="md:hidden flex items-center bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black text-sm">My Salary</h1>
                </div>

                <div className="p-4 md:p-8 max-w-4xl mx-auto">
                    <h1 className="hidden md:block text-2xl font-bold text-black mb-6">My Salary</h1>

                    {/* Salary summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-black font-medium">Monthly Salary</p>
                                <DollarSign size={18} className="text-blue-200" />
                            </div>
                            <p className="text-xl font-bold text-black">
                                {loading ? '...' : `₦${Number(teacher?.salary || 0).toLocaleString()}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Base pay</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-black font-medium">Current Status</p>
                                {teacher?.paid === 'paid'
                                    ? <CheckCircle size={18} className="text-green-500" />
                                    : <Clock size={18} className="text-yellow-500" />
                                }
                            </div>
                            <p className={`text-lg font-bold capitalize ${teacher?.paid === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {loading ? '...' : (teacher?.paid || 'unpaid')}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">This month</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-black font-medium">Last Paid</p>
                                <Calendar size={18} className="text-purple-500" />
                            </div>
                            <p className="text-sm font-bold text-black">
                                {loading ? '...' : teacher?.lastPaidAt
                                    ? new Date(teacher.lastPaidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : 'Never'
                                }
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {teacher?.lastPaidAmount ? `₦${Number(teacher.lastPaidAmount).toLocaleString()}` : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Salary history */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-sm text-black">Payment History</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-12 text-xs text-gray-400">Loading...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign size={28} className="text-black mx-auto mb-2" />
                                <p className="text-xs text-gray-400">No payment history yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left">
                                            <th className="px-4 py-3 text-xs text-black font-medium">Month</th>
                                            <th className="px-4 py-3 text-xs text-black font-medium">Amount</th>
                                            <th className="px-4 py-3 text-xs text-black font-medium">Status</th>
                                            <th className="px-4 py-3 text-xs text-black font-medium">Date Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.map((h) => (
                                            <tr key={h._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-black">{h.month}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-black">
                                                    ₦{Number(h.amount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor(h.status)}`}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-black">
                                                    {h.paidDate
                                                        ? new Date(h.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : '—'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}