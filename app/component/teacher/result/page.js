"use client"
import { useState, useEffect, useCallback } from "react"
import { Save, Send, ChevronDown, CheckCircle, Clock, AlertCircle, BookOpen, RefreshCw, Eye } from "lucide-react"
import { authFetch } from "../../admin/utils/api"
import Sidebar from "../sidebar"

const API = "http://localhost:5000"
const TERMS    = ["First Term", "Second Term", "Third Term"]
const SESSIONS = ["2024/2025", "2025/2026", "2026/2027"]

// ── Status badge ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
    const cfg = {
        not_started: { label: "Not Started", cls: "bg-gray-100 text-gray-500" },
        draft:       { label: "Draft Saved", cls: "bg-amber-100 text-amber-700" },
        submitted:   { label: "Submitted",   cls: "bg-blue-100 text-blue-700"  },
        approved:    { label: "Approved",     cls: "bg-green-100 text-green-700"},
    }
    const { label, cls } = cfg[status] || cfg.not_started
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

// ── Number input cell ─────────────────────────────────────────────────────────
const NumCell = ({ value, max, onChange, locked, hint }) => {
    const invalid = value !== null && value !== "" && (Number(value) < 0 || Number(value) > max)
    return (
        <div className="flex flex-col items-center gap-0.5">
            <input
                type="number" min={0} max={max}
                value={value ?? ""}
                onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
                disabled={locked}
                placeholder="—"
                className={`w-14 text-center text-sm rounded-lg border px-1.5 py-1.5 focus:outline-none focus:ring-2 transition-all
                    ${locked    ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" :
                      invalid   ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-200" :
                      hint      ? "border-blue-300 bg-blue-50 focus:ring-blue-200" :
                                  "border-gray-200 bg-white focus:ring-blue-200"}`}
            />
            {hint && !locked && <span className="text-xs text-blue-400">exam</span>}
            {invalid && <span className="text-xs text-red-500">max {max}</span>}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TeacherResults({ Sidebar }) {
    const [teacher,    setTeacher]    = useState(null)
    const [classes,    setClasses]    = useState([])
    const [subjects,   setSubjects]   = useState([])
    const [selClass,   setSelClass]   = useState("")
    const [selSubject, setSelSubject] = useState("")
    const [selTerm,    setSelTerm]    = useState("First Term")
    const [selSession, setSelSession] = useState("2024/2025")
    const [sheet,      setSheet]      = useState([])
    const [overview,   setOverview]   = useState([])
    const [tab,        setTab]        = useState("entry")  // "entry" | "overview"
    const [loading,    setLoading]    = useState(false)
    const [saving,     setSaving]     = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [flash,      setFlash]      = useState(null)

    const showFlash = (type, text) => { setFlash({ type, text }); setTimeout(() => setFlash(null), 5000) }

    // ── Load teacher on mount ─────────────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem("user")
        if (!stored) return
        const parsed = JSON.parse(stored)
        setTeacher(parsed)
        authFetch(`${API}/teacher/${parsed.id}`)
            .then(r => r.json())
            .then(data => {
                const assigned = Array.isArray(data.assignedClasses) ? data.assignedClasses : []
                setClasses(assigned)
                if (assigned.length > 0) setSelClass(assigned[0].className)
            })
            .catch(console.error)
    }, [])

    // ── Load subjects when class changes ──────────────────────────────────────
    useEffect(() => {
        if (!selClass) { setSubjects([]); setSelSubject(""); return }
        authFetch(`${API}/academic/all?className=${encodeURIComponent(selClass)}`)
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : []
                setSubjects(list)
                setSelSubject(list.length > 0 ? list[0].name : "")
            })
            .catch(console.error)
    }, [selClass])

    // ── Load score sheet ──────────────────────────────────────────────────────
    const loadSheet = useCallback(async () => {
        if (!selClass || !selSubject || !selTerm) return
        setLoading(true)
        try {
            const q   = new URLSearchParams({ subject: selSubject, term: selTerm, session: selSession })
            const res = await authFetch(`${API}/result/class/${encodeURIComponent(selClass)}?${q}`)
            const d   = await res.json()
            if (!res.ok) return showFlash("error", d.error || "Failed to load")
            setSheet((d.sheet || []).map(s => ({ ...s })))
        } catch { showFlash("error", "Could not load score sheet") }
        finally  { setLoading(false) }
    }, [selClass, selSubject, selTerm, selSession])

    useEffect(() => { loadSheet() }, [loadSheet])

    // ── Load overview ─────────────────────────────────────────────────────────
    const loadOverview = useCallback(async () => {
        if (!teacher?.id) return
        try {
            const res = await authFetch(`${API}/result/teacher/${teacher.id}`)
            const d   = await res.json()
            setOverview(Array.isArray(d) ? d : [])
        } catch (e) { console.error(e) }
    }, [teacher])

    useEffect(() => { if (tab === "overview") loadOverview() }, [tab, loadOverview])

    // ── Update a score cell ───────────────────────────────────────────────────
    const updateScore = (studentId, field, value) =>
        setSheet(prev => prev.map(s =>
            String(s.studentId) === String(studentId) ? { ...s, [field]: value } : s
        ))

    // ── Validate scores ───────────────────────────────────────────────────────
    const validate = (requireExam = false) => {
        for (const s of sheet) {
            const checks = { test: 20, note: 20, assignment: 10, exam: 50 }
            for (const [f, max] of Object.entries(checks)) {
                if (s[f] !== null && s[f] !== undefined && s[f] !== "") {
                    if (Number(s[f]) < 0 || Number(s[f]) > max)
                        return `${s.studentName}: ${f} must be 0–${max}`
                }
            }
            if (requireExam && (s.exam === null || s.exam === undefined || s.exam === ""))
                return `${s.studentName} is missing exam score`
        }
        return null
    }

    // ── Save draft ────────────────────────────────────────────────────────────
    const saveDraft = async () => {
        const err = validate(false)
        if (err) return showFlash("error", err)
        setSaving(true)
        try {
            const records = sheet
                .filter(s => s.status !== "approved")
                .map(s => ({
                    studentId: s.studentId, studentName: s.studentName,
                    test: s.test, note: s.note, assignment: s.assignment, exam: s.exam,
                    strengths: s.strengths, areasToImprove: s.areasToImprove
                }))
            const res = await authFetch(`${API}/result/save-draft-bulk`, {
                method: "POST",
                body: JSON.stringify({
                    records, subject: selSubject, term: selTerm, session: selSession,
                    teacherId: teacher.id, teacherName: teacher.name
                })
            })
            const d = await res.json()
            if (!res.ok) return showFlash("error", d.error)
            showFlash("success", `Draft saved — ${d.results?.length || 0} students`)
            loadSheet()
        } catch { showFlash("error", "Failed to save draft") }
        finally { setSaving(false) }
    }

    // ── Submit to admin ───────────────────────────────────────────────────────
    const submitToAdmin = async () => {
        const err = validate(true)
        if (err) return showFlash("error", err)
        if (!confirm(`Submit ${selSubject} — ${selTerm} results to admin?`)) return
        setSubmitting(true)
        try {
            const url = `${API}/result/submit/${encodeURIComponent(selSubject)}/${encodeURIComponent(selTerm)}/${encodeURIComponent(selSession)}`
            const res = await authFetch(url, { method: "PUT" })
            const d   = await res.json()
            if (!res.ok) return showFlash("error", d.error)
            showFlash("success", d.message)
            loadSheet()
        } catch { showFlash("error", "Failed to submit") }
        finally { setSubmitting(false) }
    }

    // ── Quick submit from overview ────────────────────────────────────────────
    const quickSubmit = async (subject, term, session) => {
        setSubmitting(true)
        try {
            const url = `${API}/result/submit/${encodeURIComponent(subject)}/${encodeURIComponent(term)}/${encodeURIComponent(session)}`
            const res = await authFetch(url, { method: "PUT" })
            const d   = await res.json()
            if (!res.ok) return showFlash("error", d.error)
            showFlash("success", d.message)
            loadOverview()
        } catch { showFlash("error", "Submit failed") }
        finally { setSubmitting(false) }
    }

    // ── Derived values ────────────────────────────────────────────────────────
    const allApproved  = sheet.length > 0 && sheet.every(s => s.status === "approved")
    const anySubmitted = sheet.some(s => s.status === "submitted")
    const allHaveExam  = sheet.length > 0 && sheet.every(s => s.exam !== null && s.exam !== undefined && s.exam !== "")
    const canSubmit    = allHaveExam && !anySubmitted && !allApproved && sheet.length > 0

    const statusCounts = sheet.reduce((acc, s) => {
        const k = s.status || "not_started"
        acc[k] = (acc[k] || 0) + 1
        return acc
    }, {})

    const liveCalc = (s) => {
        if ([s.test, s.note, s.assignment, s.exam].every(v => v !== null && v !== undefined && v !== "")) {
            const total = [s.test, s.note, s.assignment, s.exam].reduce((a, b) => a + Number(b), 0)
            const grade = total >= 75 ? "A" : total >= 65 ? "B" : total >= 55 ? "C" : total >= 45 ? "D" : "F"
            return { total, grade }
        }
        return { total: null, grade: s.grade || null }
    }

    const gradeClr = { A: "text-green-600 font-bold", B: "text-blue-600 font-bold", C: "text-yellow-600 font-bold", D: "text-orange-500 font-bold", F: "text-red-600 font-bold" }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {Sidebar && <Sidebar />}
            <div className="flex-1 md:ml-64">
                <div className="px-4 md:px-8 pt-8 pb-12 max-w-7xl">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Result Entry</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Save CA scores now · add exam scores later · submit when complete</p>
                        </div>
                        <div className="flex gap-2">
                            {[{ key: "entry", label: "Score Entry" }, { key: "overview", label: "My Submissions" }].map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`text-xs px-4 py-2 rounded-xl border font-medium transition-all
                                        ${tab === t.key ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Flash ──────────────────────────────────────────── */}
                    {flash && (
                        <div className={`mb-5 text-sm px-4 py-3 rounded-xl border flex items-center gap-2
                            ${flash.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            {flash.type === "success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
                            {flash.text}
                        </div>
                    )}

                    {/* ═══════════════ SCORE ENTRY TAB ═══════════════════ */}
                    {tab === "entry" && (
                        <>
                            {/* Filters */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-5">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: "Class",   val: selClass,   set: setSelClass,   opts: classes.map(c => ({ v: c.className, l: c.className })) },
                                        { label: "Subject", val: selSubject, set: setSelSubject, opts: subjects.map(s => ({ v: s.name, l: s.name })) },
                                        { label: "Term",    val: selTerm,    set: setSelTerm,    opts: TERMS.map(t => ({ v: t, l: t })) },
                                        { label: "Session", val: selSession, set: setSelSession, opts: SESSIONS.map(s => ({ v: s, l: s })) },
                                    ].map(f => (
                                        <div key={f.label}>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">{f.label}</label>
                                            <div className="relative">
                                                <select value={f.val} onChange={e => f.set(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300 pr-8 bg-white">
                                                    {f.opts.length === 0
                                                        ? <option value="">None available</option>
                                                        : f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)
                                                    }
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {sheet.length > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                                        {/* Status counts */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {Object.entries(statusCounts).map(([s, n]) => (
                                                <div key={s} className="flex items-center gap-1.5">
                                                    <Badge status={s} />
                                                    <span className="text-xs text-gray-400">{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button onClick={loadSheet} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50" title="Refresh">
                                                <RefreshCw size={13} />
                                            </button>
                                            {!allApproved && (
                                                <button onClick={saveDraft} disabled={saving}
                                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-900 disabled:opacity-50 transition-all">
                                                    <Save size={13} /> {saving ? "Saving..." : "Save Draft"}
                                                </button>
                                            )}
                                            {!allApproved && !anySubmitted && (
                                                <button onClick={submitToAdmin} disabled={submitting || !canSubmit}
                                                    title={!canSubmit ? "Fill ALL exam scores first" : "Send to admin for approval"}
                                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 transition-all">
                                                    <Send size={13} /> {submitting ? "Submitting..." : "Submit to Admin"}
                                                </button>
                                            )}
                                            {anySubmitted && !allApproved && (
                                                <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl flex items-center gap-1">
                                                    <Clock size={11} /> Awaiting admin approval
                                                </span>
                                            )}
                                            {allApproved && (
                                                <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-xl flex items-center gap-1">
                                                    <CheckCircle size={11} /> Approved & published
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Score Sheet */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                {loading ? (
                                    <div className="py-16 text-center text-sm text-gray-400">Loading score sheet...</div>
                                ) : !selSubject ? (
                                    <div className="py-16 text-center">
                                        <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
                                        <p className="text-sm text-gray-400">No subject selected</p>
                                        <p className="text-xs text-gray-300 mt-1">Add subjects to this class on the Subjects page first</p>
                                    </div>
                                ) : sheet.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
                                        <p className="text-sm text-gray-400">No students in this class</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[780px]">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">#</th>
                                                    <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Student</th>
                                                    <th className="text-center text-xs text-gray-500 font-medium px-2 py-3">Test<br/><span className="text-gray-400 font-normal">/20</span></th>
                                                    <th className="text-center text-xs text-gray-500 font-medium px-2 py-3">Note/CA<br/><span className="text-gray-400 font-normal">/20</span></th>
                                                    <th className="text-center text-xs text-gray-500 font-medium px-2 py-3">Assignment<br/><span className="text-gray-400 font-normal">/10</span></th>
                                                    <th className="text-center text-xs text-gray-500 font-medium px-2 py-3">Exam<br/><span className="text-gray-400 font-normal">/50</span></th>
                                                    <th className="text-center text-xs text-gray-500 font-medium px-2 py-3">Total<br/><span className="text-gray-400 font-normal">/100</span></th>
                                                    <th className="text-center text-xs text-gray-500 font-medium px-2 py-3">Grade</th>
                                                    <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sheet.map((s, i) => {
                                                    const locked  = s.status === "approved" || s.status === "submitted"
                                                    const examMissing = !locked && (s.exam === null || s.exam === undefined || s.exam === "")
                                                    const { total, grade } = liveCalc(s)
                                                    return (
                                                        <tr key={String(s.studentId)} className={`border-t border-gray-50 ${locked ? "bg-gray-50/50" : "hover:bg-blue-50/20"} transition-colors`}>
                                                            <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                                                            <td className="px-5 py-3">
                                                                <p className="text-sm font-medium text-gray-800">{s.studentName}</p>
                                                                {s.lastSavedAt && (
                                                                    <p className="text-xs text-gray-400">saved {new Date(s.lastSavedAt).toLocaleDateString()}</p>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <NumCell value={s.test} max={20} locked={locked} onChange={v => updateScore(s.studentId, "test", v)} />
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <NumCell value={s.note} max={20} locked={locked} onChange={v => updateScore(s.studentId, "note", v)} />
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <NumCell value={s.assignment} max={10} locked={locked} onChange={v => updateScore(s.studentId, "assignment", v)} />
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <NumCell value={s.exam} max={50} locked={locked} hint={examMissing} onChange={v => updateScore(s.studentId, "exam", v)} />
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <span className={`text-sm ${total !== null ? "text-gray-800 font-semibold" : "text-gray-300"}`}>
                                                                    {total !== null ? total : "—"}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <span className={`text-sm ${gradeClr[grade] || "text-gray-300"}`}>{grade || "—"}</span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <Badge status={s.status || "not_started"} />
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Score guide */}
                            {sheet.length > 0 && !allApproved && (
                                <p className="mt-3 text-xs text-gray-400 text-center">
                                    {canSubmit
                                        ? "✓ All scores complete — click Submit to Admin when ready"
                                        : "💡 Save draft anytime. Come back after exams to fill exam scores, then submit."}
                                </p>
                            )}
                        </>
                    )}

                    {/* ═══════════════ OVERVIEW TAB ══════════════════════ */}
                    {tab === "overview" && (
                        <div className="space-y-3">
                            {overview.length === 0 ? (
                                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                                    <Eye size={36} className="mx-auto mb-3 text-gray-200" />
                                    <p className="text-sm text-gray-400">No submissions yet</p>
                                    <p className="text-xs text-gray-300 mt-1">Go to Score Entry to start adding results</p>
                                </div>
                            ) : overview.map((g, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">{g.subject}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{g.term} · {g.session}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {g.draft      > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{g.draft} draft</span>}
                                            {g.submitted  > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{g.submitted} submitted</span>}
                                            {g.approved   > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{g.approved} approved</span>}
                                            <span className="text-xs text-gray-400">{g.total} students</span>
                                        </div>
                                    </div>

                                    {/* Progress bar: green=approved, blue=submitted, amber=draft */}
                                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-px">
                                        <div className="bg-green-400 h-full rounded-l-full" style={{ width: `${(g.approved  / g.total) * 100}%` }} />
                                        <div className="bg-blue-400  h-full"                 style={{ width: `${(g.submitted / g.total) * 100}%` }} />
                                        <div className="bg-amber-400 h-full rounded-r-full"  style={{ width: `${(g.draft     / g.total) * 100}%` }} />
                                    </div>

                                    {/* Quick submit if ready */}
                                    {g.canSubmit && (
                                        <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                                            <p className="text-xs text-blue-700">All exam scores filled — ready to submit</p>
                                            <button onClick={() => quickSubmit(g.subject, g.term, g.session)} disabled={submitting}
                                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50">
                                                <Send size={11} /> Submit
                                            </button>
                                        </div>
                                    )}
                                    {g.submitted > 0 && g.approved < g.total && !g.canSubmit && (
                                        <p className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                                            <Clock size={11} /> Waiting for admin approval
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}