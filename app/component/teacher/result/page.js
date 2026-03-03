"use client"
import { Search, Pencil, X, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"

const getGrade = (total) => {
    if (total >= 90) return { grade: "A+", gpa: 4.0, color: "text-green-500 bg-green-100" }
    if (total >= 80) return { grade: "A", gpa: 3.7, color: "text-green-500 bg-green-100" }
    if (total >= 70) return { grade: "B", gpa: 3.0, color: "text-blue-500 bg-blue-100" }
    if (total >= 60) return { grade: "C", gpa: 2.0, color: "text-yellow-500 bg-yellow-100" }
    if (total >= 50) return { grade: "D", gpa: 1.0, color: "text-orange-500 bg-orange-100" }
    return { grade: "F", gpa: 0.0, color: "text-red-500 bg-red-100" }
}

const Results = () => {
    const [search, setSearch] = useState("")
    const [addModal, setAddModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [results, setResults] = useState([])
    const [students, setStudents] = useState([])
    const [editId, setEditId] = useState(null)

    const defaultForm = {
        studentId: "", studentName: "", subject: "",
        test: 0, note: 0, assignment: 0, exam: 0,
        term: "Term 1", strengths: "", areasToImprove: "", comments: ""
    }

    const [form, setForm] = useState(defaultForm)

    const total = Number(form.test) + Number(form.note) + Number(form.assignment) + Number(form.exam)
    const { grade, gpa, color } = getGrade(total)

    const getResults = async () => {
        try {
            const res = await fetch("http://localhost:5000/teacherResult/")
            const data = await res.json()
            setResults(data)
        } catch (err) { console.log(err) }
    }

    const getStudents = async () => {
        try {
            const res = await fetch("http://localhost:5000/student/getStudent")
            const data = await res.json()
            setStudents(data)
        } catch (err) { console.log(err) }
    }

    useEffect(() => {
        getResults()
        getStudents()
    }, [])

    const handleStudentSelect = (e) => {
        const selected = students.find(s => s._id === e.target.value)
        setForm({ ...form, studentId: selected?._id || "", studentName: selected?.fullname || "" })
    }

    const saveResult = async () => {
        try {
            const payload = { ...form, total, grade, gpa }
            const res = await fetch("http://localhost:5000/teacherResult", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (res.ok) { setAddModal(false); setForm(defaultForm); getResults() }
        } catch (err) { console.log(err) }
    }

    const updateResult = async () => {
        try {
            const payload = { ...form, total, grade, gpa }
            const res = await fetch(`http://localhost:5000/teacherResult/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (res.ok) { setEditModal(false); setForm(defaultForm); getResults() }
        } catch (err) { console.log(err) }
    }

    const openEdit = (result) => {
        setEditId(result._id)
        setForm({
            studentId: result.studentId, studentName: result.studentName,
            subject: result.subject, test: result.test, note: result.note,
            assignment: result.assignment, exam: result.exam, term: result.term,
            strengths: result.strengths, areasToImprove: result.areasToImprove, comments: result.comments
        })
        setEditModal(true)
    }

    const closeModal = () => { setAddModal(false); setEditModal(false); setForm(defaultForm) }

    const filtered = results.filter(r =>
        r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.subject?.toLowerCase().includes(search.toLowerCase())
    )

    const gradeColor = (g) => {
        if (g?.startsWith("A")) return "text-green-500 bg-green-100"
        if (g?.startsWith("B")) return "text-blue-500 bg-blue-100"
        if (g?.startsWith("C")) return "text-yellow-500 bg-yellow-100"
        return "text-red-500 bg-red-100"
    }

    const scoreColor = (val) => {
        if (val >= 80) return "text-green-500"
        if (val >= 60) return "text-blue-500"
        if (val >= 40) return "text-yellow-500"
        return "text-red-500"
    }

    return (
        <div>
            <Sidebar />

            <div className="md:ml-64 pt-6 px-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Results</h1>
                        <p className="text-xs text-gray-400 mt-1">Enter and manage student scores (Test 20 + Note 20 + Assignment 10 + Exam 50 = 100)</p>
                    </div>
                    <button
                        onClick={() => { setForm(defaultForm); setAddModal(true) }}
                        className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-600 w-full sm:w-auto justify-center"
                    >
                        + Add Result
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by student or subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">Student</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">Subject</th>
                                <th className="px-6 py-3 text-left text-xs text-blue-500 font-medium">Test /20</th>
                                <th className="px-6 py-3 text-left text-xs text-blue-500 font-medium">Note /20</th>
                                <th className="px-6 py-3 text-left text-xs text-purple-500 font-medium">Assign /10</th>
                                <th className="px-6 py-3 text-left text-xs text-orange-500 font-medium">Exam /50</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">Total /100</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">Grade</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">Term</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center text-xs text-gray-400 py-10">No results found</td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-700">{r.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{r.subject}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${scoreColor((r.test / 20) * 100)}`}>{r.test}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${scoreColor((r.note / 20) * 100)}`}>{r.note}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${scoreColor((r.assignment / 10) * 100)}`}>{r.assignment}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${scoreColor((r.exam / 50) * 100)}`}>{r.exam}</td>
                                        <td className={`px-6 py-4 text-sm font-bold ${scoreColor(r.total)}`}>{r.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gradeColor(r.grade)}`}>
                                                {r.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{r.term}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-blue-500">
                                                <Pencil size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal — inline to prevent focus loss on keystroke */}
            {(addModal || editModal) && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 overflow-y-auto px-4 py-8">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">

                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-100">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">
                                    {editModal ? "Edit Result" : "Add New Result"}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">Total = Test (20) + Note/CA (20) + Assignment (10) + Exam (50)</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Student + Subject */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Student <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.studentId}
                                        onChange={handleStudentSelect}
                                    >
                                        <option value="">Select student</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.fullname}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Subject <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mathematics"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-blue-500 mb-1 block">Test <span className="text-gray-400 font-normal">(max 20)</span></label>
                                    <input type="number" min="0" max="20"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.test}
                                        onChange={(e) => setForm({ ...form, test: Math.min(20, Number(e.target.value)) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-blue-500 mb-1 block">Note / CA <span className="text-gray-400 font-normal">(max 20)</span></label>
                                    <input type="number" min="0" max="20"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.note}
                                        onChange={(e) => setForm({ ...form, note: Math.min(20, Number(e.target.value)) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-purple-500 mb-1 block">Assignment <span className="text-gray-400 font-normal">(max 10)</span></label>
                                    <input type="number" min="0" max="10"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.assignment}
                                        onChange={(e) => setForm({ ...form, assignment: Math.min(10, Number(e.target.value)) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-orange-500 mb-1 block">Exam <span className="text-gray-400 font-normal">(max 50)</span></label>
                                    <input type="number" min="0" max="50"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.exam}
                                        onChange={(e) => setForm({ ...form, exam: Math.min(50, Number(e.target.value)) })}
                                    />
                                </div>
                            </div>

                            {/* Live Total */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <span className="flex items-center gap-2 text-xs text-gray-500">
                                    <BookOpen size={14} /> Live Total
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold ${total >= 50 ? "text-green-500" : "text-red-500"}`}>
                                        {total}<span className="text-xs text-gray-400 font-normal">/100</span>
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{grade}</span>
                                    <span className="text-xs text-gray-400">GPA {gpa.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Term */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Term</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.term}
                                    onChange={(e) => setForm({ ...form, term: e.target.value })}
                                >
                                    <option>Term 1</option>
                                    <option>Term 2</option>
                                    <option>Term 3</option>
                                </select>
                            </div>

                            {/* Strengths */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Strengths</label>
                                <textarea
                                    placeholder="Strong areas..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={form.strengths}
                                    onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                                />
                            </div>

                            {/* Areas to Improve */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Areas to Improve</label>
                                <textarea
                                    placeholder="Needs improvement in..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={form.areasToImprove}
                                    onChange={(e) => setForm({ ...form, areasToImprove: e.target.value })}
                                />
                            </div>

                            {/* Comments */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                    Comments <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    placeholder="Additional remarks..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={form.comments}
                                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={closeModal} className="text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100">
                                    Cancel
                                </button>
                                <button
                                    onClick={editModal ? updateResult : saveResult}
                                    className="bg-blue-500 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-600"
                                >
                                    Save Result
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Results