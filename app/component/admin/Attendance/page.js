'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../sidevar'
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"

const TERMS = ['First Term', 'Second Term', 'Third Term']
const SESSIONS = ['2024/2025', '2025/2026', '2026/2027']
const STATUS_BADGE = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700'
}

export default function AdminAttendance() {
    const [activeTab, setActiveTab] = useState('overview')
    const [term, setTerm] = useState('First Term')
    const [session, setSession] = useState('2024/2025')
    const [filterClass, setFilterClass] = useState('')
    const [filterDate, setFilterDate] = useState('')
    const [classSummary, setClassSummary] = useState([])
    const [records, setRecords] = useState([])
    const [summaryStats, setSummaryStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const fetchClassSummary = useCallback(async () => {
        try {
            const res = await authFetch(`${API}/attendance/summary?term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`)
            const data = await res.json()
            setClassSummary(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
    }, [term, session])

    const fetchRecords = useCallback(async () => {
        setLoading(true)
        try {
            let url = `${API}/attendance/all?term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`
            if (filterClass) url += `&className=${encodeURIComponent(filterClass)}`
            if (filterDate) url += `&date=${filterDate}`
            const res = await authFetch(url)
            const data = await res.json()
            setRecords(data.records || [])
            setSummaryStats(data.summary || null)
        } catch (err) { console.log(err) }
        finally { setLoading(false) }
    }, [term, session, filterClass, filterDate])

    useEffect(() => {
        fetchClassSummary()
        fetchRecords()
    }, [fetchClassSummary, fetchRecords])

    const getRateBarColor = (rate) => {
        if (rate >= 80) return 'bg-green-500'
        if (rate >= 60) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getRateTextColor = (rate) => {
        if (rate >= 80) return 'text-green-600'
        if (rate >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {sidebarOpen && (
                <div className="fixed inset-0   bg-opacity-40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 md:ml-64 min-h-screen">

                {/* Mobile topbar */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black">Attendance</h1>
                    <div className="w-8" />
                </div>

                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    <h1 className="hidden md:block text-2xl font-bold text-black mb-6">Attendance Management</h1>

                    {/* Global filters */}
                    <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-5 flex flex-wrap gap-3 md:gap-4">
                        <div>
                            <label className="text-xs text-black mb-1 block">Term</label>
                            <select value={term} onChange={e => setTerm(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {TERMS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-black mb-1 block">Session</label>
                            <select value={session} onChange={e => setSession(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {SESSIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                        {['overview', 'records'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-4 md:px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${activeTab === tab ? 'bg-blue-200 text-black' : 'bg-white text-black hover:bg-gray-100 shadow'}`}>
                                {tab === 'overview' ? '📊 Class Overview' : '📋 All Records'}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <>
                            {summaryStats && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                    {[
                                        { label: 'Total Records', value: summaryStats.total, color: 'text-black' },
                                        { label: 'Present', value: summaryStats.present, color: 'text-green-600' },
                                        { label: 'Absent', value: summaryStats.absent, color: 'text-red-600' },
                                        { label: 'Late', value: summaryStats.late, color: 'text-yellow-600' },
                                    ].map(card => (
                                        <div key={card.label} className="bg-white rounded-xl shadow p-4 md:p-5 text-center">
                                            <div className={`text-2xl md:text-3xl font-bold ${card.color}`}>{card.value}</div>
                                            <div className="text-xs text-black mt-1">{card.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow overflow-hidden">
                                <div className="px-5 py-4 border-b">
                                    <h2 className="font-semibold text-black">Attendance by Class</h2>
                                </div>
                                {classSummary.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">No attendance data yet for this term</div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {[...classSummary].sort((a, b) => b.attendanceRate - a.attendanceRate).map(cls => (
                                            <div key={cls.className} className="px-4 md:px-5 py-4">
                                                <div className="flex justify-between items-start md:items-center mb-2 gap-2">
                                                    <div>
                                                        <span className="font-medium text-black text-sm md:text-base">{cls.className}</span>
                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                            {cls.present} present · {cls.absent} absent · {cls.late} late
                                                        </div>
                                                    </div>
                                                    <span className={`font-bold text-sm shrink-0 ${getRateTextColor(cls.attendanceRate)}`}>
                                                        {cls.attendanceRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${getRateBarColor(cls.attendanceRate)}`}
                                                        style={{ width: `${cls.attendanceRate}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'records' && (
                        <>
                            <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3">
                                <div>
                                    <label className="text-xs text-black mb-1 block">Filter by Class</label>
                                    <input type="text" placeholder="e.g. JSS 1A" value={filterClass}
                                        onChange={e => setFilterClass(e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none text-black focus:ring-2 focus:ring-blue-500 w-36 md:w-auto" />
                                </div>
                                <div>
                                    <label className="text-xs text-black mb-1 block">Filter by Date</label>
                                    <input type="date" value={filterDate}
                                        onChange={e => setFilterDate(e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm  text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-end">
                                    <button onClick={() => { setFilterClass(''); setFilterDate('') }}
                                        className="px-4 py-2 text-sm bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition">
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow overflow-hidden">
                                <div className="px-5 py-4 border-b flex justify-between items-center">
                                    <h2 className="font-semibold text-black">Attendance Records</h2>
                                    <span className="text-sm text-gray-400">{records.length} records</span>
                                </div>
                                {loading ? (
                                    <div className="text-center py-10 text-gray-400">Loading...</div>
                                ) : records.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">No records found</div>
                                ) : (
                                    <>
                                        {/* Desktop table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        {['Student', 'Class', 'Date', 'Status', 'Teacher', 'Remark'].map(h => (
                                                            <th key={h} className="text-left px-5 py-3 text-sm text-black font-medium">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {records.map(r => (
                                                        <tr key={r._id} className="hover:bg-gray-50">
                                                            <td className="px-5 py-3 font-medium text-black text-sm">{r.studentName}</td>
                                                            <td className="px-5 py-3 text-sm text-black">{r.studentClass}</td>
                                                            <td className="px-5 py-3 text-sm text-black">
                                                                {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[r.status]}`}>
                                                                    {r.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-sm text-black">{r.teacherName}</td>
                                                            <td className="px-5 py-3 text-sm text-gray-400">{r.remark || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile cards */}
                                        <div className="md:hidden divide-y divide-gray-100">
                                            {records.map(r => (
                                                <div key={r._id} className="px-4 py-3">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <div className="font-medium text-black text-sm">{r.studentName}</div>
                                                            <div className="text-xs text-gray-400">{r.studentClass} · {r.teacherName}</div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[r.status]}`}>
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {r.remark ? ` · ${r.remark}` : ''}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}