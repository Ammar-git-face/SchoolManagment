"use client"
import { Search, Pencil, Trash2, BookPlus, X, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../sidevar";

const Student = () => {
    const [search, setSearch] = useState("")
    const [teacher, setTeacher] = useState([])
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [salary, setSalary] = useState('');
    const [subject, setSubject] = useState('')
    const [paid, setPaid] = useState('')
    const [addStudent, setAddStudent] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editData, setEditData] = useState({ fullname: "", email: "", salary: "", subject: "" })
    const [editId, setEditId] = useState(null)

    // Assign class states
    const [assignModal, setAssignModal] = useState(false)
    const [assignTeacher, setAssignTeacher] = useState(null) // teacher being assigned
    const [availableClasses, setAvailableClasses] = useState([])
    const [assignClass, setAssignClass] = useState("")
    const [assignSubject, setAssignSubject] = useState("")

    const getData = async () => {
        try {
            const res = await fetch('http://localhost:5000/teacher/getTeachers')
            const result = await res.json()
            setTeacher(result)
        } catch (err) {
            console.log(err)
        }
    }

    // fetch unique class names from students
    const getClasses = async () => {
        try {
            const res = await fetch('http://localhost:5000/student/getStudent')
            const students = await res.json()
            const unique = [...new Set(students.map(s => s.studentClass).filter(Boolean))]
            setAvailableClasses(unique)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getData()
        getClasses()
    }, []);

    const update = async () => {
        try {
            const res = await fetch(`http://localhost:5000/teacher/${editId}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData)
            })
            if (res.ok) {
                setEdit(false)
                getData()
            }
        } catch (err) {
            console.log(err)
        }
    }

    const sendData = async () => {
        try {
            const res = await fetch('http://localhost:5000/teacher', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, salary, email, fullname, paid })
            })
            if (res.ok) {
                setAddStudent(false)
                getData()
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/teacher/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) getData()
        } catch (err) {
            console.log(err)
        }
    }

    const openAssign = (t) => {
        setAssignTeacher(t)
        setAssignClass(availableClasses[0] || "")
        setAssignSubject("")
        setAssignModal(true)
    }

    const handleAssign = async () => {
        if (!assignClass || !assignSubject) return alert("Please fill in both class and subject")
        try {
            const res = await fetch(`http://localhost:5000/teachers/${assignTeacher._id}/assign-class`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ className: assignClass, subject: assignSubject })
            })
            if (res.ok) {
                setAssignModal(false)
                getData()
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleRemoveClass = async (teacherId, classId) => {
        try {
            const res = await fetch(`http://localhost:5000/teachers/${teacherId}/remove-class`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId })
            })
            if (res.ok) getData()
        } catch (err) {
            console.log(err)
        }
    }

    const filtered = teacher.filter(t =>
        t.fullname?.toLowerCase().includes(search.toLowerCase())
    )

    const getInitials = (name = "") =>
        name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    return (
        <div>
            <Sidebar />
            <div className="ml-0 md:ml-78 mt-10 p-4">
                <h1 className="text-black text-sm font-semibold mb-2 font-sans">Teachers</h1>
                <p className="text-gray-500 text-md -mb-5">Manage All Teachers</p>
                <button className="bg-blue-500 text-white p-1 rounded-xl w-full sm:w-36 h-7 mt-6 sm:float-right text-xs"
                    onClick={() => setAddStudent(true)}>+ Add Teacher</button>
            </div>

            {/* Search */}
            <div className="relative px-4 md:ml-80 max-w-sm mt-4">
                <Search size={18} className="absolute left-6 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search teachers..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Edit Modal */}
            {edit && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-100 shadow-xl rounded-xl w-full max-w-sm p-4">
                        <h1 className="text-md font-bold mb-1">Edit Teacher</h1>
                        <p className="text-gray-500 text-xs mb-4">Update teacher details</p>
                        <p className="mb-2 text-xs font-bold">Full Name</p>
                        <input type="text" className="w-full p-2 mb-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={editData.fullname} onChange={(e) => setEditData({ ...editData, fullname: e.target.value })} />
                        <p className="text-xs mb-1 font-bold">Email</p>
                        <input type="email" className="w-full p-2 mb-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                        <p className="text-xs mb-1 font-bold">Monthly Salary</p>
                        <input type="number" className="w-full p-2 mb-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={editData.salary} onChange={(e) => setEditData({ ...editData, salary: e.target.value })} />
                        <p className="text-xs mb-1 font-bold">Subject</p>
                        <input type="text" className="w-full p-2 mb-4 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })} />
                        <div className="flex justify-end gap-4">
                            <button type="button" className="text-xs" onClick={() => setEdit(false)}>Cancel</button>
                            <button type="button" onClick={update} className="text-xs bg-blue-500 p-2 w-28 rounded-xl text-white">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {addStudent && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-100 shadow-xl rounded-xl w-full max-w-sm p-4">
                        <h1 className="text-md font-bold mb-1">Add New Teacher</h1>
                        <p className="text-gray-500 text-xs mb-4">Enter teacher details below</p>
                        <p className="mb-1 text-xs font-bold">Full Name</p>
                        <input type="text" placeholder="Teacher Name" className="w-full p-2 mb-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={(e) => setFullname(e.target.value)} />
                        <p className="text-xs mb-1 font-bold">Email</p>
                        <input type="email" placeholder="Email address" className="w-full p-2 mb-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={(e) => setEmail(e.target.value)} />
                        <p className="text-xs mb-1 font-bold">Monthly Salary</p>
                        <input type="number" placeholder="e.g 50000" className="w-full p-2 mb-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={(e) => setSalary(e.target.value)} />
                        <p className="text-xs mb-1 font-bold">Subject</p>
                        <input type="text" placeholder="e.g Math, Physics" className="w-full p-2 mb-4 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={(e) => setSubject(e.target.value)} />
                        <div className="flex justify-end gap-4">
                            <button type="button" className="text-xs" onClick={() => setAddStudent(false)}>Cancel</button>
                            <button type="button" onClick={sendData} className="text-xs bg-blue-500 p-2 w-28 rounded-xl text-white">Add Teacher</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Class Modal */}
            {assignModal && assignTeacher && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-5">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-sm font-bold">Assign Class</h1>
                            <button onClick={() => setAssignModal(false)}><X size={16} className="text-gray-400" /></button>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">Assign a class and subject to <span className="font-semibold text-gray-600">{assignTeacher.fullname}</span></p>

                        <p className="text-xs font-semibold mb-1 text-gray-600">Select Class</p>
                        <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={assignClass} onChange={(e) => setAssignClass(e.target.value)}>
                            {availableClasses.length === 0
                                ? <option>No classes found</option>
                                : availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)
                            }
                        </select>

                        <p className="text-xs font-semibold mb-1 text-gray-600">Subject to Teach</p>
                        <input type="text" placeholder="e.g Mathematics"
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} />

                        {/* Already assigned classes */}
                        {assignTeacher.assignedClasses?.length > 0 && (
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Currently Assigned:</p>
                                <div className="flex flex-col gap-2">
                                    {assignTeacher.assignedClasses.map((ac) => (
                                        <div key={ac._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                                            <span className="text-xs text-gray-600">{ac.className} — <span className="text-blue-500">{ac.subject}</span></span>
                                            <button onClick={() => handleRemoveClass(assignTeacher._id, ac._id)}
                                                className="text-red-400 hover:text-red-600">
                                                <Trash size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button type="button" className="text-xs text-gray-500" onClick={() => setAssignModal(false)}>Cancel</button>
                            <button type="button" onClick={handleAssign}
                                className="text-xs bg-blue-500 text-white px-4 py-2 rounded-xl">Assign Class</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="ml-0 md:ml-80 mt-10 md:mt-20 px-4 overflow-x-auto">
                <table className="shadow-md rounded-xl w-full min-w-[700px]">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-6 py-3 text-left text-xs text-gray-600">Teacher</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-600">Subject</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-600">Salary</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-600">Assigned Classes</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t) => (
                            <tr key={t._id} className="border-t text-xs border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xs font-bold">
                                            {getInitials(t.fullname)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium">{t.fullname}</p>
                                            <p className="text-gray-400 text-xs">{t.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 rounded-xl text-xs p-2">{t.subject}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{t.salary}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-yellow-100 p-1 text-xs rounded-xl">{t.paid}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {t.assignedClasses?.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {t.assignedClasses.map(ac => (
                                                <span key={ac._id} className="bg-blue-100 text-blue-500 text-xs px-2 py-0.5 rounded-full">
                                                    {ac.className}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Not assigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <button className="text-green-500 hover:text-green-600" title="Assign Class"
                                        onClick={() => openAssign(t)}>
                                        <BookPlus size={15} />
                                    </button>
                                    <button className="text-blue-500" onClick={() => {
                                        setEditId(t._id)
                                        setEditData({ fullname: t.fullname, email: t.email, salary: t.salary, subject: t.subject })
                                        setEdit(true)
                                    }}>
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Student;