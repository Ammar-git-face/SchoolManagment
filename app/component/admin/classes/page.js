"use client"
import { useState, useEffect } from "react";
import Sidebar from "../sidevar";
import { User2, Pencil, Trash2, Book } from "lucide-react";

const Classes = () => {
    const [aji, setAji] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", teacher: "", grade: "" });
    const [edit, setEdit] = useState(false)
const [editData, setEditData] = useState({ name: "", teacher: "", grade: "" })
const [editId, setEditId] = useState(null)




    const fetchClasses = async () => {
        try {
            const res = await fetch("http://localhost:5000/class");
            const data = await res.json();
            setAji(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);


    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/class/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchClasses() // ✅ now accessible
            }
        } catch (err) {
            console.log(err)
        }
    }
    const handleAddClass = async () => {
        // if (!formData.name || !formData.teacher || !formData.grade) return;
        try {
            const res = await fetch("http://localhost:5000/class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const newClass = await res.json();
            setAji((prev) => [newClass, ...prev]);
            setShowForm(false);
            setFormData({ name: "", teacher: "", grade: "" });
        } catch (err) {
            console.error(err);
        }
    };

    const Update = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`http://localhost:5000/class/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            })
            if (res.ok) {
                setEdit(false)
                fetchClasses()
            }
        } catch (err) {
            console.log(err)
        }
    }
    


    return (
        <div>
            <Sidebar />

            <div className="mt-10 px-4 md:ml-70">
                <h1 className="text-black text-xl font-semibold mb-2 font-sans">Classes</h1>
                <p className="text-gray-500 text-md -mb-5">Manage All classes</p>
                <button
                    className="bg-blue-500 text-white p-1 rounded-xl w-full sm:w-36 h-7 text-xs mt-6 md:float-right"
                    onClick={() => setShowForm(true)}
                >
                    + Add class
                </button>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-100 p-6 rounded-xl w-full max-w-sm font-sans">
                        <h2 className="text-lg font-semibold mb-4">Add New Class</h2>

                        <label className="block text-xs font-semibold mb-1">Class Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-1 mb-3 text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <label className="block text-xs font-semibold mb-1">Teacher</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-1 mb-3 text-sm"
                            value={formData.teacher}
                            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                        />

                        <label className="block text-xs font-semibold mb-1">Grade</label>
                        <select
                            className="w-full border border-gray-300 rounded p-1 mb-4 text-sm"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        >
                            <option value="">Select Grade</option>
                            <option value="Grade 9">Grade 9</option>
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 text-black px-3 py-1 rounded"
                                onClick={() => setShowForm(false)}
                            >Cancel</button>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                                onClick={handleAddClass}
                            >Add</button>
                        </div>
                    </div>
                </div>
            )}


{/* {class edit} */}

{edit && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-100 p-6 rounded-xl w-full max-w-sm font-sans">
                        <h2 className="text-lg font-semibold mb-4">Add New Class</h2>

                        <label className="block text-xs font-semibold mb-1">Class Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-1 mb-3 text-sm"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />

                        <label className="block text-xs font-semibold mb-1">Teacher</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-1 mb-3 text-sm"
                            value={editData.teacher}
                            onChange={(e) => setEditData({ ...editData, teacher: e.target.value })}
                        />

                        <label className="block text-xs font-semibold mb-1">Grade</label>
                        <select
                            className="w-full border border-gray-300 rounded p-1 mb-4 text-sm"
                            value={editData.grade}
                            onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                        >
                            <option value="">Select Grade</option>
                            <option value="Grade 9">Grade 9</option>
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 text-black px-3 py-1 rounded"
                                onClick={() => setEdit(false)}
                            >Cancel</button>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                                onClick={Update}
                            >Add</button>
                        </div>
                    </div>
                </div>
                 )}



            

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:ml-70 mt-10">
                {aji.map((list) => (
                    <div key={list._id} className="font-sans bg-white shadow-xl rounded-xl">

                        <span className="flex justify-between p-2 font-bold">
                            {list.name}
                            <div className="flex gap-5">
                                <button className="text-red-500" onClick={() => handleDelete(list._id)}>
                                    <Trash2 size={15} />
                                </button>
                                <button className="text-blue-500" onClick={() => {
                                    setEditId(list._id)
                                    setEditData({ name: list.name, teacher: list.teacher, grade: list.grade })
                                    setEdit(true)
                                }}>
                                    <Pencil size={15} />
                                </button>
                            </div>
                        </span>

                        <span className="flex gap-2 p-2 text-xs text-gray-500">
                            <Book size={15} className="text-gray-400" />
                            {list.grade}
                        </span>

                        <span className="flex gap-2 p-2 text-xs text-gray-500">
                            <User2 size={15} />
                            0 student
                        </span>

                        <hr />

                        <span className="p-2 text-xs text-gray-500">class teacher</span>
                        <span className="p-2 text-sm">{list.teacher}</span>
                    </div>
                ))}

                
            </div>
        </div>
    );
};

export default Classes;
