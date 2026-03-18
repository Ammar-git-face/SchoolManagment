"use client"
import { useState, useEffect, useCallback } from "react"
import { Search, Printer, CheckCircle, Clock, AlertCircle, ChevronDown, Eye, Users, RefreshCw } from "lucide-react"
import Sidebar from "../sidevar"
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"

const TERMS    = ["First Term", "Second Term", "Third Term"]
const SESSIONS = ["2024/2025", "2025/2026", "2026/2027"]

const gradeColor = (g) => {
    if (!g || g === "—") return "text-gray-400"
    if (g === "A") return "text-green-600 font-bold"
    if (g === "B") return "text-blue-200 font-bold"
    if (g === "C") return "text-yellow-600 font-bold"
    if (g === "D") return "text-orange-500 font-bold"
    return "text-red-600 font-bold"
}

// Status badge — matches teacher result statuses exactly
const Badge = ({ status }) => {
    const cfg = {
        draft:       { label: "Draft",     cls: "bg-amber-100 text-amber-700" },
        submitted:   { label: "Submitted", cls: "bg-blue-100 text-blue-700"  },
        approved:    { label: "Approved",  cls: "bg-green-100 text-green-700"},
        not_started: { label: "—",         cls: "bg-gray-100 text-gray-400"  },
    }
    const { label, cls } = cfg[status] || cfg.not_started
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

const AdminResults = () => {
    const [tab,              setTab]              = useState("pending")   // "pending" | "student"
    const [pendingGroups,    setPendingGroups]    = useState([])          // submitted batches awaiting approval
    const [students,         setStudents]         = useState([])
    const [allResults,       setAllResults]       = useState([])
    const [selectedStudent,  setSelectedStudent]  = useState(null)
    const [selectedGroup,    setSelectedGroup]    = useState(null)        // batch being approved
    const [search,           setSearch]           = useState("")
    const [term,             setTerm]             = useState("First Term")
    const [session,          setSession]          = useState("2024/2025")
    const [teacherRemark,    setTeacherRemark]    = useState("")
    const [principalRemark,  setPrincipalRemark]  = useState("")
    const [approving,        setApproving]        = useState(null)        // subject key being approved
    const [msg,              setMsg]              = useState(null)
    const [loading,          setLoading]          = useState(false)
    const [sidebarOpen,      setSidebarOpen]      = useState(false)

    const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 5000) }

    // ── Fetch pending (submitted) results grouped by subject+term+session ────
    const fetchPending = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await authFetch(`${API}/result/admin/pending`)
            const data = await res.json()
            setPendingGroups(Array.isArray(data) ? data : [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }, [])

    // ── Fetch all students + all results for per-student view ───────────────
    const fetchAll = useCallback(async () => {
        try {
            const [sRes, rRes] = await Promise.all([
                authFetch(`${API}/student/getStudent`),
                authFetch(`${API}/result`),
            ])
            const sData = await sRes.json()
            const rData = await rRes.json()
            setStudents(Array.isArray(sData) ? sData : [])
            setAllResults(Array.isArray(rData) ? rData : [])
        } catch (e) { console.error(e) }
    }, [])

    useEffect(() => {
        fetchPending()
        fetchAll()
    }, [fetchPending, fetchAll])

    // ── Approve a batch (subject + term + session) ───────────────────────────
    // NEW backend: POST /result/approve with { subject, term, session, teacherRemark, principalRemark }
    const handleApprove = async (subject, term, session) => {
        const key = `${subject}||${term}||${session}`
        setApproving(key)
        try {
            const res  = await authFetch(`${API}/result/approve`, {
                method: "POST",
                body: JSON.stringify({ subject, term, session, teacherRemark, principalRemark })
            })
            const data = await res.json()
            if (!res.ok) return flash("error", data.error || "Approval failed")
            flash("success", data.message || "Results approved — parents can now view them")
            setSelectedGroup(null)
            setTeacherRemark("")
            setPrincipalRemark("")
            fetchPending()
            fetchAll()
        } catch { flash("error", "Something went wrong") }
        finally { setApproving(null) }
    }

    // ── Per-student results filtered by term/session ─────────────────────────
    const studentResults = selectedStudent
        ? allResults.filter(r =>
            r.studentId?.toString() === selectedStudent._id?.toString() &&
            r.term    === term &&
            r.session === session
          )
        : []

    const avg          = studentResults.length === 0 ? 0
        : Math.round(studentResults.reduce((acc, r) => acc + (r.total || 0), 0) / studentResults.length)
    const overallGrade = avg >= 75 ? "A" : avg >= 65 ? "B" : avg >= 55 ? "C" : avg >= 45 ? "D" : "F"
    const allStudentApproved = studentResults.length > 0 && studentResults.every(r => r.status === "approved")

    const filteredStudents = students.filter(s =>
        s.fullname?.toLowerCase().includes(search.toLowerCase())
    )

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
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black text-sm">Results</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-6 pt-8 pb-10">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-black">Results</h1>
                            <p className="text-xs text-gray-400 mt-1">Review teacher submissions · approve for parents to see</p>
                        </div>
                        <div className="flex gap-2">
                            {[
                                { key: "pending", label: "Pending Approval", icon: <Clock size={13}/> },
                                { key: "student", label: "By Student",        icon: <Users size={13}/> },
                            ].map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border font-medium transition-all
                                        ${tab === t.key ? "bg-blue-500 text-white border-blue-500" : "bg-white text-black border-gray-200 hover:bg-gray-50"}`}>
                                    {t.icon} {t.label}
                                    {t.key === "pending" && pendingGroups.length > 0 && (
                                        <span className="bg-white text-blue-200 text-xs w-5 h-5 rounded-full flex items-center justify-center ml-1 font-bold">
                                            {pendingGroups.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                            <button onClick={() => { fetchPending(); fetchAll() }}
                                className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50" title="Refresh">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Flash message */}
                    {msg && (
                        <div className={`text-sm px-4 py-3 rounded-xl mb-5 border flex items-center gap-2
                            ${msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            {msg.type === "success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
                            {msg.text}
                        </div>
                    )}

                    {/* ══════════ PENDING APPROVAL TAB ══════════════════════ */}
                    {tab === "pending" && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-sm text-gray-400">
                                    Loading pending submissions...
                                </div>
                            ) : pendingGroups.length === 0 ? (
                                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                                    <CheckCircle size={40} className="mx-auto mb-3 text-black" />
                                    <p className="text-sm font-medium text-black">No pending submissions</p>
                                    <p className="text-xs text-gray-400 mt-1">Results teachers submit will appear here for approval</p>
                                </div>
                            ) : (
                                pendingGroups.map((g, i) => {
                                    const key      = `${g.subject}||${g.term}||${g.session}`
                                    const isOpen   = selectedGroup === key
                                    const isApproving = approving === key
                                    return (
                                        <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                            {/* Group header */}
                                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-black">{g.subject}</h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {g.term} · {g.session} · {g.teacherName || "Teacher"} · {g.records?.length || 0} students
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-blue-200 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                                                        Submitted {g.submittedAt ? new Date(g.submittedAt).toLocaleDateString() : ""}
                                                    </span>
                                                    <button onClick={() => setSelectedGroup(isOpen ? null : key)}
                                                        className="flex items-center gap-1 text-xs text-black hover:text-black border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                                                        <Eye size={12}/> {isOpen ? "Hide" : "Review"}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded review panel */}
                                            {isOpen && (
                                                <div className="p-5">
                                                    {/* Score table */}
                                                    <div className="overflow-x-auto mb-5">
                                                        <table className="w-full min-w-[580px]">
                                                            <thead>
                                                                <tr className="bg-gray-50">
                                                                    <th className="text-left text-xs text-black font-medium px-4 py-2.5">#</th>
                                                                    <th className="text-left text-xs text-black font-medium px-4 py-2.5">Student</th>
                                                                    <th className="text-center text-xs text-black font-medium px-2 py-2.5">Test/20</th>
                                                                    <th className="text-center text-xs text-black font-medium px-2 py-2.5">Note/20</th>
                                                                    <th className="text-center text-xs text-black font-medium px-2 py-2.5">Assign/10</th>
                                                                    <th className="text-center text-xs text-black font-medium px-2 py-2.5">Exam/50</th>
                                                                    <th className="text-center text-xs text-black font-medium px-2 py-2.5">Total</th>
                                                                    <th className="text-center text-xs text-black font-medium px-2 py-2.5">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(g.records || []).map((r, ri) => (
                                                                    <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                                                                        <td className="px-4 py-2.5 text-xs text-gray-400">{ri + 1}</td>
                                                                        <td className="px-4 py-2.5 text-sm font-medium text-black">{r.studentName}</td>
                                                                        <td className="px-2 py-2.5 text-center text-sm text-blue-200">{r.test ?? "—"}</td>
                                                                        <td className="px-2 py-2.5 text-center text-sm text-blue-200">{r.note ?? "—"}</td>
                                                                        <td className="px-2 py-2.5 text-center text-sm text-purple-500">{r.assignment ?? "—"}</td>
                                                                        <td className="px-2 py-2.5 text-center text-sm text-orange-500">{r.exam ?? "—"}</td>
                                                                        <td className="px-2 py-2.5 text-center text-sm font-bold text-black">{r.total ?? "—"}</td>
                                                                        <td className={`px-2 py-2.5 text-center text-sm ${gradeColor(r.grade)}`}>{r.grade || "—"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Remarks */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                                        <div>
                                                            <label className="text-xs font-semibold text-black mb-1.5 block">Class Teacher's Remark</label>
                                                            <textarea rows={3} placeholder="Enter class teacher remark..."
                                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                                                value={teacherRemark} onChange={e => setTeacherRemark(e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-black mb-1.5 block">Principal's Remark</label>
                                                            <textarea rows={3} placeholder="Enter principal remark..."
                                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                                                value={principalRemark} onChange={e => setPrincipalRemark(e.target.value)} />
                                                        </div>
                                                    </div>

                                                    {/* Approve button */}
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleApprove(g.subject, g.term, g.session)}
                                                            disabled={!!isApproving}
                                                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm px-6 py-2.5 rounded-xl disabled:opacity-50 transition-all">
                                                            <CheckCircle size={15} />
                                                            {isApproving ? "Approving..." : `Approve ${g.records?.length || 0} Results`}
                                                        </button>
                                                        <button onClick={() => setSelectedGroup(null)}
                                                            className="text-sm text-black px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {/* ══════════ BY STUDENT TAB ════════════════════════════ */}
                    {tab === "student" && (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left — student list + filters */}
                            <div className="w-full lg:w-72 flex-shrink-0">
                                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                    {/* Search */}
                                    <div className="relative mb-3">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" placeholder="Search students..."
                                            value={search} onChange={e => setSearch(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    </div>

                                    {/* Student list */}
                                    <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-100 mb-4">
                                        {filteredStudents.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-6">No students found</p>
                                        ) : filteredStudents.map(s => (
                                            <button key={s._id}
                                                onClick={() => { setSelectedStudent(s); setMsg(null) }}
                                                className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-all border-b border-gray-50 last:border-0
                                                    ${selectedStudent?._id === s._id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                                                <p className="text-sm font-semibold text-black">{s.fullname}</p>
                                                <p className="text-xs text-gray-400">{s.studentClass}</p>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Term + Session */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold text-black mb-1 block">Term</label>
                                            <div className="relative">
                                                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                                                    value={term} onChange={e => setTerm(e.target.value)}>
                                                    {TERMS.map(t => <option key={t}>{t}</option>)}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-black mb-1 block">Session</label>
                                            <div className="relative">
                                                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                                                    value={session} onChange={e => setSession(e.target.value)}>
                                                    {SESSIONS.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right — results */}
                            <div className="flex-1 min-w-0">
                                {!selectedStudent ? (
                                    <div className="flex items-center justify-center h-60 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <p className="text-sm text-gray-400">Select a student to view their results</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 mb-5">
                                            {[
                                                { label: "Subjects",       value: studentResults.length },
                                                { label: "Average",        value: `${avg}/100` },
                                                { label: "Overall Grade",  value: overallGrade, color: gradeColor(overallGrade) },
                                            ].map(s => (
                                                <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                                                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                                                    <p className={`text-2xl font-bold ${s.color || "text-black"}`}>{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Results table */}
                                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto mb-5">
                                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-black">
                                                    {selectedStudent.fullname} — {term} {session}
                                                </p>
                                                {studentResults.length === 0 ? (
                                                    <span className="text-xs text-gray-400">No results</span>
                                                ) : allStudentApproved ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                                                        <CheckCircle size={11}/> All Approved
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                                                        <Clock size={11}/> Pending
                                                    </span>
                                                )}
                                            </div>

                                            <table className="w-full min-w-[560px]">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        {["Subject", "Test/20", "Note/20", "Assign/10", "Exam/50", "Total", "Grade", "Status"].map(h => (
                                                            <th key={h} className="px-4 py-3 text-left text-xs text-black font-medium">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentResults.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={8} className="text-center text-xs text-gray-400 py-10">
                                                                No results for {term} · {session}
                                                            </td>
                                                        </tr>
                                                    ) : studentResults.map(r => (
                                                        <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-black">{r.subject}</td>
                                                            <td className="px-4 py-3 text-sm text-blue-200">{r.test ?? "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-blue-200">{r.note ?? "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-purple-500">{r.assignment ?? "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-orange-500">{r.exam ?? "—"}</td>
                                                            <td className="px-4 py-3 text-sm font-bold text-black">{r.total ?? "—"}</td>
                                                            <td className={`px-4 py-3 text-sm ${gradeColor(r.grade)}`}>{r.grade || "—"}</td>
                                                            <td className="px-4 py-3"><Badge status={r.status} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Print button */}
                                        <button onClick={() => window.print()}
                                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl transition-all">
                                            <Printer size={15}/> Print Result Sheet
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminResults