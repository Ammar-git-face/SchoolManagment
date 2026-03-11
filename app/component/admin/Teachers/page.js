"use client"
import { Search, Pencil, Trash2, BookPlus, X, Trash, KeyRound, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidevar"
import { authFetch } from "../utils/api"

// ✅ Outside parent — fixes cursor-jump bug on inputs
const AddEditModal = ({ title, data, setData, banks, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 overflow-y-auto py-8">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-sm p-5 my-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-sm font-bold">{title}</h1>
                <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
            </div>
            {[
                { label: "Full Name", key: "fullname", type: "text", ph: "Teacher full name" },
                { label: "Email", key: "email", type: "email", ph: "teacher@email.com" },
                { label: "Monthly Salary (₦)", key: "salary", type: "number", ph: "e.g 50000" },
                { label: "Subject", key: "subject", type: "text", ph: "e.g Math, Physics" },
                { label: "Account Number", key: "accountNumber", type: "text", ph: "10-digit account number" },
            ].map(f => (
                <div key={f.key}>
                    <p className="mb-1 text-xs font-semibold text-gray-600">{f.label}</p>
                    <input type={f.type} placeholder={f.ph}
                        className="w-full p-2.5 mb-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data[f.key] || ""}
                        onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))} />
                </div>
            ))}
            <p className="text-xs font-semibold mb-1 text-gray-600">Bank</p>
            <select
                className="w-full p-2.5 mb-5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.bankCode || ""}
                onChange={e => setData(d => ({ ...d, bankCode: e.target.value }))}>
                <option value="">— Select bank —</option>
                {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <div className="flex justify-end gap-3">
                <button className="text-xs text-gray-500" onClick={onClose}>Cancel</button>
                <button onClick={onSubmit} className="text-xs bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600">{title.includes("Edit") ? "Update" : "Add Teacher"}</button>
            </div>
        </div>
    </div>
)

const Teachers = () => {
    const [search, setSearch] = useState("")
    const [teachers, setTeachers] = useState([])
    const [banks, setBanks] = useState([])
    const [liveClasses, setLiveClasses] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState("")

    // Add/Edit
    const [addModal, setAddModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [addData, setAddData] = useState({ fullname: "", email: "", salary: "", subject: "", accountNumber: "", bankCode: "" })
    const [editData, setEditData] = useState({ fullname: "", email: "", salary: "", subject: "", accountNumber: "", bankCode: "" })
    const [editId, setEditId] = useState(null)

    // Assign class
    const [assignModal, setAssignModal] = useState(false)
    const [assignTeacher, setAssignTeacher] = useState(null)
    const [assignClass, setAssignClass] = useState("")
    const [assignSubject, setAssignSubject] = useState("")

    // Create account
    const [accountModal, setAccountModal] = useState(false)
    const [accountTeacher, setAccountTeacher] = useState(null)
    const [newPassword, setNewPassword] = useState("")
    const [accountLoading, setAccountLoading] = useState(false)
    const [accountMsg, setAccountMsg] = useState(null)

    const getTeachers = async () => {
        try {
            setLoading(true)
            const res = await authFetch("http://localhost:5000/teacher/getTeachers")
            const data = await res.json()
            setTeachers(Array.isArray(data) ? data : [])
        } catch { setErr("Failed to load teachers") }
        finally { setLoading(false) }
    }

    const getBanks = async () => {
        try {
            const res = await authFetch("http://localhost:5000/fees/banks")
            const data = await res.json()
            setBanks(Array.isArray(data) ? data : [])
        } catch { console.log("banks fetch failed") }
    }

    const fetchClasses = async () => {
        try {
            const res = await authFetch("http://localhost:5000/class")
            const data = await res.json()
            setLiveClasses(Array.isArray(data) ? data : [])
        } catch { console.log("classes fetch failed") }
    }

    useEffect(() => { getTeachers(); getBanks(); fetchClasses() }, [])

    // ── Add Teacher ──────────────────────────────────────
    const handleAdd = async () => {
        if (!addData.fullname || !addData.email) return setErr("Name and email required")
        try {
            const res = await authFetch("http://localhost:5000/teacher", {
                method: "POST",
                body: JSON.stringify({
                    ...addData,
                    salary: Number(addData.salary) || 0,
                    bankName: banks.find(b => b.code === addData.bankCode)?.name || ""
                }),
            })
            const d = await res.json()
            if (!res.ok) return setErr(d.error || "Failed to add teacher")
            setAddData({ fullname: "", email: "", salary: "", subject: "", accountNumber: "", bankCode: "" })
            setAddModal(false); setErr(""); getTeachers()
        } catch { setErr("Failed to add teacher") }
    }

    // ── Edit Teacher ─────────────────────────────────────
    const handleEdit = async () => {
        try {
            const res = await authFetch(`http://localhost:5000/teacher/${editId}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...editData,
                    salary: Number(editData.salary) || 0,
                    bankName: banks.find(b => b.code === editData.bankCode)?.name || ""
                }),
            })
            if (res.ok) { setEditModal(false); getTeachers() }
        } catch { console.log("edit failed") }
    }

    // ── Delete Teacher ───────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm("Delete this teacher?")) return
        const res = await authFetch(`http://localhost:5000/teacher/${id}`, { method: "DELETE" })
        if (res.ok) getTeachers()
    }

    // ── Assign Class ─────────────────────────────────────
    const handleAssign = async () => {
        if (!assignClass || !assignSubject) return alert("Please fill in both class and subject")
        try {
            const res = await authFetch(`http://localhost:5000/teacher/${assignTeacher._id}/assign-class`, {
                method: "PUT",
                body: JSON.stringify({ className: assignClass, subject: assignSubject }),
            })
            if (res.ok) { setAssignModal(false); getTeachers() }
        } catch { console.log("assign failed") }
    }

    const handleRemoveClass = async (teacherId, classId) => {
        try {
            const res = await authFetch(`http://localhost:5000/teacher/${teacherId}/remove-class`, {
                method: "PUT",
                body: JSON.stringify({ classId }),
            })
            if (res.ok) getTeachers()
        } catch { console.log("remove class failed") }
    }

    // ── Create Account ───────────────────────────────────
    const handleCreateAccount = async () => {
        if (!newPassword) return alert("Please enter a password")
        setAccountLoading(true); setAccountMsg(null)
        try {
            const res = await authFetch("http://localhost:5000/auth/teacher/create-account", {
                method: "POST",
                body: JSON.stringify({ teacherId: accountTeacher._id, password: newPassword }),
            })
            const data = await res.json()
            if (!res.ok) return setAccountMsg({ type: "error", text: data.error })
            setAccountMsg({ type: "success", text: "Account created! Teacher can now log in." })
            setNewPassword(""); getTeachers()
        } catch {
            setAccountMsg({ type: "error", text: "Something went wrong" })
        } finally { setAccountLoading(false) }
    }

    const getBankName = (code) => banks.find(b => b.code === code)?.name || code || "—"
    const getInitials = (name = "") => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    const filtered = teachers.filter(t => t.fullname?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile topbar */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-gray-800">Teachers</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-6 pt-8 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
                            <p className="text-xs text-gray-400 mt-1">Manage all teachers</p>
                        </div>
                        <button onClick={() => { setErr(""); setAddModal(true) }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs hover:bg-blue-600">+ Add Teacher</button>
                    </div>

                    <div className="relative max-w-sm mb-6">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search teachers..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {err && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">{err}</div>}

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[950px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Teacher", "Subject", "Salary", "Bank", "Account No", "Status", "Assigned Classes", "Account", "Action"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={9} className="text-center text-xs text-gray-400 py-8">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={9} className="text-center text-xs text-gray-400 py-8">No teachers found</td></tr>
                                ) : filtered.map(t => (
                                    <tr key={t._id} className="border-t border-gray-100 hover:bg-gray-50 text-xs">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0">
                                                    {getInitials(t.fullname)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">{t.fullname}</p>
                                                    <p className="text-gray-400 text-xs">{t.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4"><span className="bg-gray-100 rounded-xl text-xs px-2 py-1">{t.subject || "—"}</span></td>
                                        <td className="px-4 py-4 font-medium text-gray-700">₦{(t.salary || 0).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-gray-500">
                                            {t.bankCode ? getBankName(t.bankCode) : <span className="text-red-400">No bank</span>}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            {t.accountNumber || <span className="text-red-400">No account</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${t.paid === "paid"
                                                ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                                                {t.paid || "unpaid"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {t.assignedClasses?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {t.assignedClasses.map(ac => (
                                                        <span key={ac._id || ac.className} className="bg-blue-100 text-blue-500 text-xs px-2 py-0.5 rounded-full">
                                                            {ac.className}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-gray-400">Not assigned</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            {t.password
                                                ? <span className="flex items-center gap-1 text-green-500"><CheckCircle size={13} /> Active</span>
                                                : <span className="text-yellow-500">No account</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Create account */}
                                                <button title="Create Login Account"
                                                    className={t.password ? "text-gray-300 cursor-not-allowed" : "text-purple-500 hover:text-purple-600"}
                                                    onClick={() => { if (!t.password) { setAccountTeacher(t); setAccountModal(true) } }}>
                                                    <KeyRound size={15} />
                                                </button>
                                                {/* Assign class */}
                                                <button title="Assign Class" className="text-green-500 hover:text-green-600"
                                                    onClick={() => { setAssignTeacher(t); setAssignClass(""); setAssignSubject(""); setAssignModal(true) }}>
                                                    <BookPlus size={15} />
                                                </button>
                                                {/* Edit */}
                                                <button className="text-blue-400 hover:text-blue-600" onClick={() => {
                                                    setEditId(t._id)
                                                    setEditData({ fullname: t.fullname, email: t.email, salary: t.salary, subject: t.subject, accountNumber: t.accountNumber || "", bankCode: t.bankCode || "" })
                                                    setEditModal(true)
                                                }}><Pencil size={15} /></button>
                                                {/* Delete */}
                                                <button className="text-red-400 hover:text-red-600" onClick={() => handleDelete(t._id)}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {addModal && <AddEditModal title="Add New Teacher" data={addData} setData={setAddData} banks={banks} onSubmit={handleAdd} onClose={() => setAddModal(false)} />}

            {/* Edit Modal */}
            {editModal && <AddEditModal title="Edit Teacher" data={editData} setData={setEditData} banks={banks} onSubmit={handleEdit} onClose={() => setEditModal(false)} />}

            {/* Assign Class Modal */}
            {assignModal && assignTeacher && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-5">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-sm font-bold">Assign Class</h1>
                            <button onClick={() => setAssignModal(false)}><X size={16} className="text-gray-400" /></button>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            Assign a class to <span className="font-semibold text-gray-700">{assignTeacher.fullname}</span>
                        </p>

                        <p className="text-xs font-semibold mb-1 text-gray-600">Select Class</p>
                        {/* ✅ Dropdown populated from DB classes */}
                        <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={assignClass} onChange={e => setAssignClass(e.target.value)}>
                            <option value="">— Select a class —</option>
                            {liveClasses.length === 0
                                ? <option disabled>No classes found — add classes first</option>
                                : liveClasses.map(cls => <option key={cls._id} value={cls.name}>{cls.name} ({cls.grade})</option>)
                            }
                        </select>

                        <p className="text-xs font-semibold mb-1 text-gray-600">Subject to Teach</p>
                        <input type="text" placeholder="e.g Mathematics"
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={assignSubject} onChange={e => setAssignSubject(e.target.value)} />

                        {liveClasses.length === 0 && (
                            <div className="mb-4 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs border border-amber-200">
                                ⚠️ No classes found. Go to the <strong>Classes</strong> page and add classes first.
                            </div>
                        )}

                        {assignTeacher.assignedClasses?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Currently Assigned:</p>
                                <div className="flex flex-col gap-2">
                                    {assignTeacher.assignedClasses.map(ac => (
                                        <div key={ac._id || ac.className} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                                            <span className="text-xs text-gray-600">
                                                {ac.className} — <span className="text-blue-500">{ac.subject}</span>
                                            </span>
                                            <button onClick={() => handleRemoveClass(assignTeacher._id, ac._id)} className="text-red-400 hover:text-red-600">
                                                <Trash size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-2">
                            <button className="text-xs text-gray-500" onClick={() => setAssignModal(false)}>Cancel</button>
                            <button onClick={handleAssign} className="text-xs bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600">
                                Assign Class
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Account Modal */}
            {accountModal && accountTeacher && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white shadow-xl rounded-2xl w-full max-w-sm p-5">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-sm font-bold">Create Login Account</h1>
                            <button onClick={() => { setAccountModal(false); setAccountMsg(null); setNewPassword("") }}>
                                <X size={16} className="text-gray-400" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            Set a login password for <span className="font-semibold text-gray-700">{accountTeacher.fullname}</span>
                        </p>
                        {accountMsg && (
                            <div className={`text-xs p-3 rounded-xl mb-4 border ${accountMsg.type === "success"
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-red-50 text-red-600 border-red-200"}`}>
                                {accountMsg.text}
                            </div>
                        )}
                        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                            <p className="text-xs text-gray-500">Login Email</p>
                            <p className="text-sm font-semibold text-gray-700">{accountTeacher.email}</p>
                        </div>
                        <p className="text-xs font-semibold mb-1 text-gray-600">Set Password</p>
                        <input type="text" placeholder="Enter a password for this teacher"
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <div className="flex justify-end gap-3">
                            <button className="text-xs text-gray-500"
                                onClick={() => { setAccountModal(false); setAccountMsg(null); setNewPassword("") }}>Cancel</button>
                            <button onClick={handleCreateAccount} disabled={accountLoading}
                                className="text-xs bg-blue-500 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-blue-600">
                                {accountLoading ? "Creating..." : "Create Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Teachers