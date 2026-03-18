'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from "../sidebar"
// ✅ FIX 1: import API_BASE alongside existing imports
import { useTeacher, teacherFetch, API_BASE } from "../utils/api"
import { API } from "../../../config/api"

const TERMS = ['First Term', 'Second Term', 'Third Term']
const SESSIONS = ['2024/2025', '2025/2026', '2026/2027']
const STATUS_COLORS = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700'
}

export default function TeacherAttendance() {
    const { user } = useTeacher()
    // ✅ FIX 2: useTeacher() returns { user } — not { user, classes }
    //    Read assignedClasses from user object with safe [] fallback
    //    This is what was undefined and crashing on .length at line 132
    const assignedClasses = user?.assignedClasses || []

    const [selectedClass, setSelectedClass] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [term, setTerm] = useState('First Term')
    const [session, setSession] = useState('2024/2025')
    const [students, setStudents] = useState([])
    const [alreadyMarked, setAlreadyMarked] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Set first class once assignedClasses loads from useTeacher
    useEffect(() => {
        if (assignedClasses.length > 0 && !selectedClass)
            setSelectedClass(assignedClasses[0].className)
    }, [assignedClasses])

    const fetchAttendance = useCallback(async () => {
        if (!selectedClass || !selectedDate || !user?.id) return
        setLoading(true)
        try {
            // ✅ FIX 3: API_BASE replaces hardcoded localhost — works on mobile too
            const res = await teacherFetch(
                `${API_BASE}/attendance/class/${encodeURIComponent(selectedClass)}/${selectedDate}?teacherId=${user.id}`
            )
            const data = await res.json()
            setStudents(data.students || [])
            setAlreadyMarked(data.alreadyMarked || false)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }, [selectedClass, selectedDate, user])

    useEffect(() => { fetchAttendance() }, [fetchAttendance])

    const updateStatus = (studentId, status) => {
        setStudents(prev => prev.map(s => s.studentId.toString() === studentId.toString() ? { ...s, status } : s))
    }

    const updateRemark = (studentId, remark) => {
        setStudents(prev => prev.map(s => s.studentId.toString() === studentId.toString() ? { ...s, remark } : s))
    }

    const markAll = (status) => setStudents(prev => prev.map(s => ({ ...s, status })))

    const handleSubmit = async () => {
        if (!user?.id) return setMessage('Teacher ID not found. Please log in again.')
        setSubmitting(true)
        setMessage('')
        try {
            // ✅ FIX 3 (same): API_BASE here too
            const res = await teacherFetch(`${API_BASE}/attendance/mark`, {
                method: 'POST',
                body: JSON.stringify({
                    teacherId: user.id,
                    className: selectedClass,
                    date: selectedDate,
                    term,
                    session,
                    records: students.map(s => ({
                        studentId: s.studentId,
                        status: s.status,
                        remark: s.remark || ''
                    }))
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage('✅ Attendance marked successfully!')
                setAlreadyMarked(true)
            } else {
                setMessage('❌ ' + (data.error || 'Failed to mark attendance'))
            }
        } catch (err) {
            setMessage('❌ Server error')
        } finally {
            setSubmitting(false)
        }
    }

    const presentCount = students.filter(s => s.status === 'present').length
    const absentCount  = students.filter(s => s.status === 'absent').length
    const lateCount    = students.filter(s => s.status === 'late').length

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
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
                    <h1 className="font-semibold text-black">Mark Attendance</h1>
                    <div className="w-8" />
                </div>

                <div className="p-4 md:p-8 max-w-5xl mx-auto">
                    <h1 className="hidden md:block text-2xl font-bold text-black mb-6">Mark Attendance</h1>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div>
                            <label className="text-xs text-black mb-1 block">Class</label>
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {assignedClasses.length === 0 && <option value="">No classes assigned</option>}
                                {assignedClasses.map(c => (
                                    <option key={c.className} value={c.className}>{c.className}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-black mb-1 block">Date</label>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-xs text-black mb-1 block">Term</label>
                            <select value={term} onChange={e => setTerm(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {TERMS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-black mb-1 block">Session</label>
                            <select value={session} onChange={e => setSession(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {SESSIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Summary + quick mark */}
                    {students.length > 0 && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex gap-4 md:gap-6">
                                    {[
                                        { label: 'Present', count: presentCount, color: 'text-green-600' },
                                        { label: 'Absent',  count: absentCount,  color: 'text-red-600'   },
                                        { label: 'Late',    count: lateCount,    color: 'text-yellow-600'},
                                        { label: 'Total',   count: students.length, color: 'text-black'},
                                    ].map(item => (
                                        <div key={item.label} className="text-center">
                                            <div className={`text-xl md:text-2xl font-bold ${item.color}`}>{item.count}</div>
                                            <div className="text-xs text-black">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => markAll('present')}
                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs md:text-sm font-medium hover:bg-green-200 transition">
                                        All Present
                                    </button>
                                    <button onClick={() => markAll('absent')}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs md:text-sm font-medium hover:bg-red-200 transition">
                                        All Absent
                                    </button>
                                </div>
                            </div>
                            {alreadyMarked && (
                                <div className="mt-3 text-sm text-blue-200 bg-blue-50 px-3 py-2 rounded-lg">
                                    ℹ️ Attendance already marked for this date. You can update it below.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Student list */}
                    {loading ? (
                        <div className="text-center py-16 text-gray-400">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            {assignedClasses.length === 0 ? 'No classes assigned to you yet.' : 'No students found in this class.'}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden mb-5">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-sm text-black font-medium">#</th>
                                            <th className="text-left px-5 py-3 text-sm text-black font-medium">Student Name</th>
                                            <th className="text-left px-5 py-3 text-sm text-black font-medium">Status</th>
                                            <th className="text-left px-5 py-3 text-sm text-black font-medium">Remark</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.map((s, i) => (
                                            <tr key={s.studentId} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 text-sm text-gray-400">{i + 1}</td>
                                                <td className="px-5 py-3 font-medium text-black">{s.studentName}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex gap-2">
                                                        {['present', 'absent', 'late'].map(status => (
                                                            <button key={status}
                                                                onClick={() => updateStatus(s.studentId, status)}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all
                                                                    ${s.status === status
                                                                        ? STATUS_COLORS[status] + ' ring-2 ring-offset-1 ring-current'
                                                                        : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <input type="text" placeholder="Optional remark"
                                                        value={s.remark || ''}
                                                        onChange={e => updateRemark(s.studentId, e.target.value)}
                                                        className="border rounded-lg px-3 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden space-y-3 mb-5">
                                {students.map((s, i) => (
                                    <div key={s.studentId} className="bg-white rounded-xl shadow p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-black">{i + 1}</span>
                                                <span className="font-medium text-black text-sm">{s.studentName}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[s.status]}`}>
                                                {s.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            {['present', 'absent', 'late'].map(status => (
                                                <button key={status}
                                                    onClick={() => updateStatus(s.studentId, status)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                                                        ${s.status === status ? STATUS_COLORS[status] : 'bg-gray-100 text-black'}`}>
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                        <input type="text" placeholder="Optional remark"
                                            value={s.remark || ''}
                                            onChange={e => updateRemark(s.studentId, e.target.value)}
                                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {message && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    {students.length > 0 && (
                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full bg-blue-200 text-white py-3 rounded-xl font-semibold hover:bg-blue-200 disabled:opacity-50 transition text-sm md:text-base">
                            {submitting ? 'Saving...' : alreadyMarked ? 'Update Attendance' : 'Submit Attendance'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}