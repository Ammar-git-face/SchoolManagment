"use client"
import { Search, Pencil, Trash2, X } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidevar"
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"

// ✅ Outside parent component to prevent re-render focus loss
const StudentForm = ({ title, data, setData, classes, onSubmit, onClose, showFamilyCode = false, familyCode, setFamilyCode }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">{title}</h2>
                <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-3">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                    <input type="text" placeholder="Student full name"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data.fullname}
                        onChange={(e) => setData(d => ({ ...d, fullname: e.target.value }))} />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Class</label>
                    {/* ✅ Dropdown of classes added by admin */}
                    <select
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data.studentClass}
                        onChange={(e) => setData(d => ({ ...d, studentClass: e.target.value }))}>
                        <option value="">Select class</option>
                        {classes.map(cls => (
                            <option key={cls._id} value={cls.name}>{cls.name} ({cls.grade})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Parent Name</label>
                    <input type="text" placeholder="Parent name"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data.parent}
                        onChange={(e) => setData(d => ({ ...d, parent: e.target.value }))} />
                </div>
                {showFamilyCode && (
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Family Code</label>
                        <input type="text" placeholder="e.g FAM-2024-ABC123"
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={familyCode}
                            onChange={(e) => setFamilyCode(e.target.value)} />
                        <p className="text-xs text-gray-400 mt-1">Share this code with the parent to link their account</p>
                    </div>
                )}
            </div>
            <div className="flex gap-3 mt-5">
                <button onClick={onClose} className="flex-1 text-xs text-gray-500 border border-gray-200 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={onSubmit} className="flex-1 text-xs bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600">Save</button>
            </div>
        </div>
    </div>
)

const Student = () => {
    const [search, setSearch] = useState("")
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
    const [showAdd, setShowAdd] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [addData, setAddData] = useState({ fullname: "", studentClass: "", parent: "" })
    const [editData, setEditData] = useState({ fullname: "", studentClass: "", parent: "" })
    const [editId, setEditId] = useState(null)
    const [familyCode, setFamilyCode] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState("")

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const res = await authFetch(`${API}/student/getStudent`)
            const data = await res.json()
            setStudents(Array.isArray(data) ? data : [])
        } catch { setErr("Failed to load students") }
        finally { setLoading(false) }
    }

    const fetchClasses = async () => {
        try {
            const res = await authFetch(`${API}/class`)
            const data = await res.json()
            setClasses(Array.isArray(data) ? data : [])
        } catch { console.log("Failed to load classes") }
    }

    useEffect(() => {
        fetchStudents()
        fetchClasses()
    }, [])

    const handleAdd = async () => {
        if (!addData.fullname || !addData.studentClass) return setErr("Name and class are required")
        try {
            const res = await authFetch(`${API}/student`, {
                method: "POST",
                body: JSON.stringify({ ...addData, familyCode }),
            })
            const d = await res.json()
            if (!res.ok) return setErr(d.error || "Failed to add student"),
            setAddData({ fullname: "", studentClass: "", parent: "" })
            setFamilyCode("")
            setShowAdd(false); setErr(""); fetchStudents()
        } catch { setErr("Failed to add student") }
    }

    const handleEdit = async () => {
        try {
            const res = await authFetch(`${API}/student/${editId}`, {
                method: "PUT",
                body: JSON.stringify(editData),
            })
            if (res.ok) { setShowEdit(false); fetchStudents() }
        } catch { console.log("edit error") }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this student?")) return
        const res = await authFetch(`${API}/student/${id}`, { method: "DELETE" })
        if (res.ok) fetchStudents()
    }

    const filtered = students.filter(s =>
        s.fullname?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 md:ml-64 min-h-screen">
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-gray-800">Students</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-6 pt-8 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                            <p className="text-xs text-gray-400 mt-1">Manage all students</p>
                        </div>
                        <button onClick={() => { setErr(""); setShowAdd(true) }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs hover:bg-blue-600">+ Add Student</button>
                    </div>

                    <div className="relative max-w-sm mb-6">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search students..." value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {err && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">{err}</div>}

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Student", "Class", "Parent", "Family Code", "Action"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-8">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-8">No students found</td></tr>
                                ) : filtered.map((student) => (
                                    <tr key={student._id} className="border-t border-gray-100 hover:bg-gray-50 text-xs">
                                        <td className="px-5 py-3 font-medium text-gray-700">{student.fullname}</td>
                                        <td className="px-5 py-3 text-gray-500">{student.studentClass}</td>
                                        <td className="px-5 py-3 text-gray-500">{student.parent || "—"}</td>
                                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">{student.familyCode || "—"}</td>
                                        <td className="px-5 py-3 flex items-center gap-3">
                                            <button className="text-blue-400 hover:text-blue-600" onClick={() => {
                                                setEditId(student._id)
                                                setEditData({ fullname: student.fullname, studentClass: student.studentClass, parent: student.parent || "" })
                                                setShowEdit(true)
                                            }}><Pencil size={14} /></button>
                                            <button className="text-red-400 hover:text-red-600" onClick={() => handleDelete(student._id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showAdd && (
                <StudentForm
                    title="Add New Student"
                    data={addData}
                    setData={setAddData}
                    classes={classes}
                    onSubmit={handleAdd}
                    onClose={() => setShowAdd(false)}
                    showFamilyCode={true}
                    familyCode={familyCode}
                    setFamilyCode={setFamilyCode}
                />
            )}
            {showEdit && (
                <StudentForm
                    title="Edit Student"
                    data={editData}
                    setData={setEditData}
                    classes={classes}
                    onSubmit={handleEdit}
                    onClose={() => setShowEdit(false)}
                />
            )}
        </div>
    )
}

export default Student