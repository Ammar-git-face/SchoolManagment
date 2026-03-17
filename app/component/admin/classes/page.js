"use client"
import { useState, useEffect } from "react"
import Sidebar from "../sidevar"
import { Pencil, Trash2, Book, X } from "lucide-react"
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"

// ✅ MUST be outside the parent component — fixes the "cursor jumps to next line" bug
const ClassForm = ({ data, setData, onSubmit, onClose, title }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">{title}</h2>
                <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-3">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Class Name</label>
                    <input type="text" placeholder="e.g. JSS 1A, Grade 10, Primary 3"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data.name}
                        onChange={(e) => setData(d => ({ ...d, name: e.target.value }))} />
                </div>

                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Grade / Level</label>
                    <input type="text" placeholder="e.g. Grade 9, JSS 1, SS 2"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data.grade}
                        onChange={(e) => setData(d => ({ ...d, grade: e.target.value }))} />
                </div>
            </div>
            <div className="flex gap-3 mt-5">
                <button onClick={onClose} className="flex-1 text-xs text-gray-500 border border-gray-200 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={onSubmit} className="flex-1 text-xs bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600">Save</button>
            </div>
        </div>
    </div>
)

const Classes = () => {
    const [classes, setClasses] = useState([])
    const [showAdd, setShowAdd] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [formData, setFormData] = useState({ name: "", grade: "" })
    const [editData, setEditData] = useState({ name: "", grade: "" })
    const [editId, setEditId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState("")

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const res = await authFetch(`${API}/class`)
            const data = await res.json()
            setClasses(Array.isArray(data) ? data : [])
        } catch { setErr("Failed to load classes") }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchClasses() }, [])

    const handleAdd = async () => {
        if (!formData.name || !formData.grade) return setErr("All fields required")
        try {
            const res = await authFetch(`${API}/class`, { method: "POST", body: JSON.stringify(formData) })
            const d = await res.json()
            if (!res.ok) return setErr(d.error || "Failed")
            setFormData({ name: "", grade: "" })
            setShowAdd(false); setErr(""); fetchClasses()
        } catch { setErr("Failed to add class") }
    }

    const handleEdit = async () => {
        try {
            const res = await authFetch(`${API}/class/${editId}`, { method: "PUT", body: JSON.stringify(editData) })
            if (res.ok) { setShowEdit(false); fetchClasses() }
        } catch { console.log("edit error") }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this class?")) return
        const res = await authFetch(`${API}/class/${id}`, { method: "DELETE" })
        if (res.ok) fetchClasses()
    }

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
                    <h1 className="font-semibold text-gray-800">Classes</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-6 pt-8 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
                            <p className="text-xs text-gray-400 mt-1">Manage all classes</p>
                        </div>
                        <button onClick={() => { setErr(""); setShowAdd(true) }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs hover:bg-blue-600">+ Add Class</button>
                    </div>

                    {err && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">{err}</div>}

                    {loading ? (
                        <div className="text-center text-xs text-gray-400 py-16">Loading...</div>
                    ) : classes.length === 0 ? (
                        <div className="text-center text-xs text-gray-400 py-16">No classes yet — add one to get started</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classes.map((cls) => (
                                <div key={cls._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="font-bold text-gray-800 text-sm">{cls.name}</h2>
                                        <div className="flex gap-2">
                                            <button className="text-red-400 hover:text-red-600" onClick={() => handleDelete(cls._id)}><Trash2 size={14} /></button>
                                            <button className="text-blue-400 hover:text-blue-600" onClick={() => { setEditId(cls._id); setEditData({ name: cls.name, grade: cls.grade }); setShowEdit(true) }}><Pencil size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                        <Book size={13} />{cls.grade}
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAdd && <ClassForm data={formData} setData={setFormData} onSubmit={handleAdd} onClose={() => setShowAdd(false)} title="Add New Class" />}
            {showEdit && <ClassForm data={editData} setData={setEditData} onSubmit={handleEdit} onClose={() => setShowEdit(false)} title="Edit Class" />}
        </div>
    )
}

export default Classes