"use client"
import { Search, Pencil, Trash2, Rss } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../sidevar";

const student = () => {

    const getData = async (req, res) => {
        try {
            const res = await fetch('http://localhost:5000/teacher/getTeachers')
            const result = await res.json()
            setTeacher(result)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getData();
    }, []);

    const sendData = async (req, res) => {
        try{ const res = await fetch('http://localhost:5000/teacher', {
                method: "post",
                headers: ({ "Content-Type": "application/json" }),
                body: JSON.stringify({ subject, salary, email, fullname, paid })
            })
        }catch(err){
            console.log(err)
        }
            await getData()
    }

    const [search, setSearch] = useState("")
    const [teacher, setTeacher] = useState([])
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [salary, setSalary] = useState('');
    const [subject, setSubject] = useState('')
    const [paid, setPaid] = useState('')
    const [addStudent, setAddStudent] = useState(false)

    const getInitials = (name, string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    return (
        <div className="">
            <Sidebar />
            <div className="ml-0 md:ml-78 mt-10 p-4">
                <h1 className="text-black text-sm font-semibold mb-2 font-sans">Teachers</h1>
                <p className="text-gray-500 text-md -mb-5">Manage All Teachers</p>
                <button className="bg-blue-500 text-white p-1 rounded-xl w-full sm:w-36 h-7 mt-6 sm:float-right text-xs" onClick={setAddStudent}> + Add Teacher</button>
            </div>

            {/* search */}
            <div className="relative px-4 md:ml-80 max-w-sm mt-4">
                <Search
                    size={18}
                    className="absolute left-6 md:left-2 top-1/2 -translate-y-1/2 text-gray-400"
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
                        <h1 className="text-md">Add New Student</h1>
                        <p className="text-gray-500 text-xs mb-10">Enter Student Details Below</p>
                        <p className="mb-2 text-xs font-bold">Full Name</p>
                        <input type="text" placeholder="Student Name" className="w-full pl-10 p-1 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={((e) => setFullname(e.target.value))} />
                        <p className="text-xs p-2 font-bold">email</p>
                        <input type="email" placeholder="enter your email." className="w-full p-2 mb-6 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={((e) => setEmail(e.target.value))} />
                        <p className="text-xs p-2 font-bold">monthly salary ($)</p>
                        <input type="number" placeholder="enter your email." className="w-full p-2 mb-6 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={((e) => setSalary(e.target.value))} />
                        <p className="text-xs p-2 font-bold">subject</p>
                        <input type="text" placeholder="e.g math , pysics" className="w-full p-2 mb-6 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={((e) => setSubject(e.target.value))} />
                        <div className="flex justify-end gap-4 mt-2">
                            <button className="text-xs" onClick={() => setAddStudent(false)}>cancel</button>
                            <button className="text-xs bg-blue-500 p-1 w-35 h-10 rounded-xl text-white" onClick={sendData}>Add Student</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="ml-0 md:ml-80 mt-10 md:mt-20 px-4 overflow-x-auto">
                <table className="shadow-md rounded-xl w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-6 py-3 text-left text-xs text-gray-600">
                                teacher
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {teacher.map((student) => (
                            <tr
                                key={student._id}
                                className="border-t text-xs border-gray-200 hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <span className="text-xs">{student.fullname} <p className="text-gray-500 text-xs">{student.email}</p></span>
                                </td>
                                <td className="px-6 text-gray-700">
                                    <span className="bg-gray-100 rounded-xl text-xs p-2">{student.subject}</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-700">
                                    {student.salary}
                                </td>
                                <td>
                                    <span className="bg-yellow-100 p-1 cursor-pointer hover:bg-blue-100 transition-all text-xs rounded-xl">{student.paid}</span>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <button className="text-gray-600 hover:text-blue-500">
                                        <Pencil size={16} />
                                    </button>
                                    <button className="text-red-500 hover:text-red-600">
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

export default student;