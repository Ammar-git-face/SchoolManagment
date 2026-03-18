"use client"
import { Printer, Download } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"
import { API } from "../../../config/api"
import { useParent, parentFetch } from "../utils/useParent"

const TERMS    = ["First Term", "Second Term", "Third Term"]
const SESSIONS = ["2024/2025", "2025/2026", "2026/2027"]

const getGradeLabel = (total) => {
    if (total >= 90) return { grade: "A+", remark: "Excellent" }
    if (total >= 80) return { grade: "A",  remark: "Very Good" }
    if (total >= 70) return { grade: "B",  remark: "Good" }
    if (total >= 60) return { grade: "C",  remark: "Average" }
    if (total >= 50) return { grade: "D",  remark: "Below Average" }
    return { grade: "F", remark: "Fail" }
}

const gradeColor = (g) =>
    g?.startsWith("A") ? "text-green-500 bg-green-100"
    : g?.startsWith("B") ? "text-blue-200 bg-blue-100"
    : g?.startsWith("C") ? "text-yellow-500 bg-yellow-100"
    : "text-red-500 bg-red-100"

const scoreColor = (val, max) => {
    const pct = (val / max) * 100
    return pct >= 80 ? "text-green-500" : pct >= 60 ? "text-blue-200" : pct >= 40 ? "text-yellow-500" : "text-red-500"
}

const ParentResults = () => {
    const { children }      = useParent()
    const [selectedChild,   setSelectedChild]   = useState(null)
    const [selectedTerm,    setSelectedTerm]    = useState("First Term")
    const [selectedSession, setSelectedSession] = useState("2024/2025")
    const [results,         setResults]         = useState([])
    const [loading,         setLoading]         = useState(false)
    const [sidebarOpen,     setSidebarOpen]     = useState(false)
    const [downloading,     setDownloading]     = useState(false)

    useEffect(() => {
        if (children.length > 0 && !selectedChild) setSelectedChild(children[0])
    }, [children])

    useEffect(() => {
        if (!selectedChild?._id) return
        const fetchResults = async () => {
            setLoading(true)
            try {
                const res  = await parentFetch(`${API}/result/approved`)
                const data = await res.json()
                setResults(Array.isArray(data) ? data : [])
            } catch (err) { console.log(err) }
            finally { setLoading(false) }
        }
        fetchResults()
    }, [selectedChild])

    const childResults = selectedChild
        ? results.filter(r =>
            r.studentId?.toString() === selectedChild._id?.toString() &&
            r.term === selectedTerm)
        : []

    const avg = childResults.length === 0 ? 0 :
        Math.round(childResults.reduce((a, r) => a + (r.total || 0), 0) / childResults.length)
    const { grade } = getGradeLabel(avg)

    const handleDownload = async () => {
        if (!selectedChild || childResults.length === 0) return
        setDownloading(true)
        try {
            const params = new URLSearchParams({ term: selectedTerm, session: selectedSession })
            const res    = await parentFetch(`${API}/result/report-card/${selectedChild._id}?${params}`)
            if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return }
            const blob = await res.blob()
            const url  = URL.createObjectURL(blob)
            const a    = document.createElement("a")
            a.href = url; a.download = `${selectedChild.fullname}_${selectedTerm}_${selectedSession}.pdf`; a.click()
            URL.revokeObjectURL(url)
        } catch (err) { alert("Could not download: " + err.message) }
        finally { setDownloading(false) }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div className="fixed inset-0   bg-opacity-40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 md:ml-64 min-h-screen">

                {/* Mobile header */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black">Results</h1>
                    <div className="w-8" />
                </div>

                <div className="md:px-6 px-4 pt-6 pb-10">
                    <div className="mb-5">
                        <h1 className="text-xl md:text-2xl font-bold text-black">My Child's Results</h1>
                        <p className="text-xs text-gray-400 mt-1">View and download approved result sheets</p>
                    </div>

                    {/* No children warning */}
                    {children.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs p-4 rounded-xl mb-6">
                            No children linked to your account yet. Contact the school admin.
                        </div>
                    ) : (
                        // FIX: stack selects vertically on mobile, row on desktop
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
                            <select
                                className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={selectedChild?._id || ""}
                                onChange={e => setSelectedChild(children.find(c => c._id === e.target.value))}>
                                {children.map(c => <option key={c._id} value={c._id}>{c.fullname}</option>)}
                            </select>
                            <select
                                className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
                                {TERMS.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <select
                                className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
                                {SESSIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: "Student", value: selectedChild?.fullname || "—" },
                            { label: "Class",   value: selectedChild?.studentClass || "—" },
                            { label: "Average", value: `${avg}/100` },
                        ].map(c => (
                            <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                                <p className="text-sm font-bold text-black truncate">{c.value}</p>
                            </div>
                        ))}
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                            <p className="text-xs text-gray-400">Grade</p>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradeColor(grade)}`}>{grade}</span>
                        </div>
                    </div>

                    {/* Results heading */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-5">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-black">
                                Results — {selectedTerm} · {selectedSession}
                            </h2>
                        </div>

                        {/* DESKTOP: table view — hidden on mobile */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Subject","Test/20","Note/20","Assign/10","Exam/50","Total/100","Grade","Remark"].map(h =>
                                            <th key={h} className="px-6 py-3 text-left text-xs text-black font-medium">{h}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={8} className="text-center text-xs text-gray-400 py-8">Loading...</td></tr>
                                    ) : childResults.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center text-xs text-gray-400 py-8">No approved results for {selectedTerm} · {selectedSession}</td></tr>
                                    ) : childResults.map(r => {
                                        const { grade: g, remark } = getGradeLabel(r.total)
                                        return (
                                            <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-black">{r.subject}</td>
                                                <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.test, 20)}`}>{r.test}</td>
                                                <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.note, 20)}`}>{r.note}</td>
                                                <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.assignment, 10)}`}>{r.assignment}</td>
                                                <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.exam, 50)}`}>{r.exam}</td>
                                                <td className={`px-6 py-4 text-sm font-bold ${scoreColor(r.total, 100)}`}>{r.total}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gradeColor(g)}`}>{g}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-black">{remark}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE: card view — hidden on desktop */}
                        <div className="md:hidden">
                            {loading ? (
                                <p className="text-center text-xs text-gray-400 py-8">Loading...</p>
                            ) : childResults.length === 0 ? (
                                <p className="text-center text-xs text-gray-400 py-8">
                                    No approved results for {selectedTerm} · {selectedSession}
                                </p>
                            ) : childResults.map(r => {
                                const { grade: g, remark } = getGradeLabel(r.total)
                                return (
                                    <div key={r._id} className="border-t border-gray-100 px-4 py-4">
                                        {/* Subject + grade row */}
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-semibold text-black">{r.subject}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gradeColor(g)}`}>{g}</span>
                                                <span className={`text-sm font-bold ${scoreColor(r.total, 100)}`}>{r.total}/100</span>
                                            </div>
                                        </div>
                                        {/* Score breakdown grid */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { label: "Test",   val: r.test,       max: 20 },
                                                { label: "Note",   val: r.note,       max: 20 },
                                                { label: "Assign", val: r.assignment, max: 10 },
                                                { label: "Exam",   val: r.exam,       max: 50 },
                                            ].map(s => (
                                                <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center">
                                                    <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                                                    <p className={`text-xs font-bold ${scoreColor(s.val, s.max)}`}>
                                                        {s.val}/{s.max}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">{remark}</p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Teacher + principal remarks */}
                        {childResults.length > 0 && childResults[0]?.teacherRemark && (
                            <div className="px-4 md:px-6 py-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-b-2xl">
                                <div>
                                    <p className="text-xs font-semibold text-black mb-1">Class Teacher's Remark</p>
                                    <p className="text-sm text-black">{childResults[0].teacherRemark}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-black mb-1">Principal's Remark</p>
                                    <p className="text-sm text-black">{childResults[0].principalRemark}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button onClick={() => window.print()}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-3 rounded-2xl flex items-center justify-center gap-2">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={handleDownload} disabled={downloading || childResults.length === 0}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                            <Download size={16} />
                            {downloading ? "Generating..." : "Download PDF"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ParentResults