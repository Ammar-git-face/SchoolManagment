"use client";
import { Search, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../sidevar";

const Student = () => {

    const [search, setSearch] = useState("");
    const [fullname, setFullname] = useState("");
    const [parent, setParent] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [addStudent, setAddStudent] = useState(false);
    const [Names, setNames] = useState([]);
    const [edit, setEdit] = useState(false)
    const [editData, setEditData] = useState({ fullname: "", studentClass: "", parent: "" })
    const [editId, setEditId] = useState(null)

    const getData = async () => {
        const res = await fetch("http://localhost:5000/student/getStudent")
        const data = await res.json()
        setNames(data)
    }

    useEffect(() => {
        getData()
    }, [])

    const updateStudent = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`http://localhost:5000/student/${editId}`, {
                method: 'put',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            })
            if (res.ok) {
                setEdit(false)
                getData()
            }

        } catch (err) {

        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/student/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                getData() // ✅ now accessible
            }
        } catch (err) {
            console.log(err)
        }
    }

    const submitData = async (e) => {
        e.preventDefault()

        const res = await fetch("http://localhost:5000/student", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parent, studentClass, fullname }),
        })
        const data = await res.json()

        await getData()
        setAddStudent(false);
        setFullname("");
        setStudentClass("");
        setParent("");
        getData();

    }

    return (
        <div>
            <Sidebar className="bg-white" />
            <div className="ml-0 md:ml-78 mt-10 p-4">
                <h1 className="text-black text-sm font-semibold mb-2 font-sans">
                    STUDENT
                </h1>
                <p className="text-gray-500 text-md -mb-5">Manage All student</p>
                <button
                    className="bg-blue-500 text-white p-1 rounded-xl w-full sm:w-36 h-7 mt-6 sm:float-right text-xs"
                    onClick={() => setAddStudent(true)}
                >
                    + Add Student
                </button>
            </div>

            {/* Search */}
            <div className="relative px-4 md:ml-80 max-w-sm mt-4">
                <Search
                    size={18}
                    className="absolute left-6 md:left-5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Add Student */}
            {addStudent && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-100 shadow-xl rounded-xl w-full max-w-sm p-4">
                        <form onSubmit={submitData}>
                            <h1 className="text-md">Add New Student</h1>
                            <p className="text-gray-500 text-xs mb-10">
                                Enter Student Details Below
                            </p>

                            <p className="mb-2 text-xs">Full Name</p>
                            <input
                                type="text"
                                id="fullname"
                                name="fullname"
                                placeholder="Student Name"
                                className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500"
                                value={fullname}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setFullname(e.target.value);
                                }}
                            />

                            <p className="text-xs p-2">Class</p>
                            <input
                                type="text"
                                id="studentClass"
                                name="studentClass"
                                placeholder="Class"
                                className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-blue-500"
                                value={studentClass}
                                onChange={(e) => setStudentClass(e.target.value)}
                            />

                            <p className=" text-xs p-2">Parent</p>
                            <input
                                type="text"
                                id="parent"
                                name="parent"
                                placeholder="Parent Name"
                                className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500"
                                value={parent}
                                onChange={(e) => setParent(e.target.value)}
                            />

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    className="text-xs"
                                    onClick={() => setAddStudent(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="text-xs bg-blue-500 p-1 w-28 rounded-xl text-white"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* edit student */}
            {edit && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-100 shadow-xl rounded-xl w-full max-w-sm p-4">
                    <form onSubmit={updateStudent}>
                            <h1 className="text-md">Add New Student</h1>
                            <p className="text-gray-500 text-xs mb-10">
                                Enter Student Details Below
                            </p>

                            <p className="mb-2 text-xs">Full Name</p>
                            <input
                                type="text"
                                id="fullname"
                                name="fullname"
                                placeholder="Student Name"
                                className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500"
                                value={editData.fullname}
                                onChange={(e) => setEditData({ ...editData, fullname: e.target.value })}
                            />

                            <p className="text-xs p-2">Class</p>
                            <input
                                type="text"
                                id="studentClass"
                                name="studentClass"
                                placeholder="Class"
                                className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-blue-500"
                                value={editData.studentClass}
                                onChange={(e) => setEditData({ ...editData, studentClass: e.target.value })}
                            />

                            <p className=" text-xs p-2">Parent</p>
                            <input
                                type="text"
                                id="parent"
                                name="parent"
                                placeholder="Parent Name"
                                className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500"
                                value={editData.parent}
                                onChange={(e) => setEditData({ ...editData, parent: e.target.value })}
                            />

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    className="text-xs"
                                    onClick={() => setEdit(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={updateStudent}
                                    className="text-xs bg-blue-500 p-1 w-28 rounded-xl text-white"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )

            }

            {/* Table */}
            <div className="ml-0 md:ml-80 mt-10 md:mt-20 px-4 overflow-x-auto">
                <table className="shadow-md rounded-xl w-full min-w-[500px]">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-6 py-3 text-left text-xs text-gray-600">
                                Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                Parent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Names.map((student => (
                            <tr key={student._id}
                                className="border-t text-xs border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <span className="text-xs">{student.fullname}</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-700">
                                    {student.studentClass}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-700">
                                    {student.parent}
                                </td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <button className="text-blue-500" onClick={() => {
                                        setEditId(student._id)
                                        setEditData({ 
                                            fullname: student.fullname, 
                                            studentClass: student.studentClass, 
                                            parent: student.parent 
                                        })
                                        setEdit(true)
                                    }}>
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => handleDelete(student._id)} className="  text-red-500 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Student;