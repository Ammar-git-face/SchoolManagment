'use client'
import { useState, useEffect } from 'react'
import Sidebar from "../sidebar"
import { useParent, parentFetch } from "../utils/useParent"
import { API } from "../../../config/api"

const TERMS    = ['First Term', 'Second Term', 'Third Term']
const SESSIONS = ['2024/2025', '2025/2026', '2026/2027']
const STATUS_BADGE = {
    present: 'bg-green-100 text-green-700',
    absent:  'bg-red-100 text-red-700',
    late:    'bg-yellow-100 text-yellow-700'
}

export default function ParentAttendance() {
    const { children } = useParent()   // ✅ always array
    const [selectedChild, setSelectedChild] = useState(null)
    const [term,          setTerm]          = useState('First Term')
    const [session,       setSession]       = useState('2024/2025')
    const [records,       setRecords]       = useState([])
    const [summary,       setSummary]       = useState(null)
    const [loading,       setLoading]       = useState(false)
    const [sidebarOpen,   setSidebarOpen]   = useState(false)

    useEffect(() => {
        if (children.length > 0 && !selectedChild) setSelectedChild(children[0])
    }, [children])

    useEffect(() => {
        if (!selectedChild?._id) return
        fetchAttendance()
    }, [selectedChild, term, session])

    const fetchAttendance = async () => {
        setLoading(true)
        try {
            const res  = await parentFetch(
                `${API}/attendance/student/${selectedChild._id}?term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`
            )
            const data = await res.json()
            setRecords(Array.isArray(data.records) ? data.records : [])
            setSummary(data.summary || null)
        } catch (err) { console.log(err) }
        finally { setLoading(false) }
    }

    const getRateColor    = (r) => r >= 80 ? 'text-green-600' : r >= 60 ? 'text-yellow-600' : 'text-red-600'
    const getRateBarColor = (r) => r >= 80 ? 'bg-green-500'  : r >= 60 ? 'bg-yellow-500'  : 'bg-red-500'

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 md:ml-64 min-h-screen">
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-gray-800">Attendance</h1>
                    <div className="w-8" />
                </div>

                <div className="p-4 md:p-8 max-w-4xl mx-auto">
                    <h1 className="hidden md:block text-2xl font-bold text-gray-800 mb-6">Attendance Record</h1>

                    {children.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs p-4 rounded-xl mb-6">
                            No children linked to your account yet.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Child</label>
                                <select onChange={e => setSelectedChild(children.find(c => c._id === e.target.value))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {children.map(c => <option key={c._id} value={c._id}>{c.fullname}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Term</label>
                                <select value={term} onChange={e => setTerm(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {TERMS.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Session</label>
                                <select value={session} onChange={e => setSession(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {SESSIONS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {summary && (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                                <div className="bg-white rounded-xl shadow p-4 text-center col-span-2 md:col-span-1">
                                    <div className={`text-3xl font-bold ${getRateColor(summary.attendanceRate)}`}>{summary.attendanceRate}%</div>
                                    <div className="text-xs text-gray-500 mt-1">Rate</div>
                                </div>
                                {[
                                    { label: 'Total Days', value: summary.total,   color: 'text-gray-700' },
                                    { label: 'Present',    value: summary.present, color: 'text-green-600' },
                                    { label: 'Absent',     value: summary.absent,  color: 'text-red-600' },
                                    { label: 'Late',       value: summary.late,    color: 'text-yellow-600' },
                                ].map(card => (
                                    <div key={card.label} className="bg-white rounded-xl shadow p-4 text-center">
                                        <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                                        <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-5">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Attendance Rate — {selectedChild?.fullname}</span>
                                    <span className={`font-bold ${getRateColor(summary.attendanceRate)}`}>{summary.attendanceRate}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div className={`h-3 rounded-full transition-all ${getRateBarColor(summary.attendanceRate)}`}
                                        style={{ width: `${summary.attendanceRate}%` }} />
                                </div>
                                {summary.attendanceRate < 75 && (
                                    <p className="text-xs text-red-500 mt-2">⚠️ Attendance is below 75%.</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-5 py-4 border-b"><h2 className="font-semibold text-gray-700">Daily Records</h2></div>
                        {loading ? (
                            <div className="text-center py-10 text-gray-400">Loading records...</div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No attendance records found for this term</div>
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                {["Date","Day","Status","Remark"].map(h =>
                                                    <th key={h} className="text-left px-5 py-3 text-sm text-gray-500 font-medium">{h}</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {records.map(r => {
                                                const d = new Date(r.date)
                                                return (
                                                    <tr key={r._id} className="hover:bg-gray-50">
                                                        <td className="px-5 py-3 text-sm text-gray-700">{d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                        <td className="px-5 py-3 text-sm text-gray-500">{d.toLocaleDateString('en-NG', { weekday: 'long' })}</td>
                                                        <td className="px-5 py-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm text-gray-500">{r.remark || '—'}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden divide-y divide-gray-100">
                                    {records.map(r => {
                                        const d = new Date(r.date)
                                        return (
                                            <div key={r._id} className="px-4 py-3 flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">{d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                    <div className="text-xs text-gray-400">{d.toLocaleDateString('en-NG', { weekday: 'short' })}{r.remark ? ` · ${r.remark}` : ''}</div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}