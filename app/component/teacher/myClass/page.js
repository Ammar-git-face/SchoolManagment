"use client"
import { BookOpen, Users } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"

const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

const getAvgColor = (avg) => {
    if (avg >= 70) return "text-green-500"
    if (avg >= 50) return "text-yellow-500"
    return "text-orange-400"
}

const getAvgIcon = (avg) => {
    if (avg >= 70) return "↗"
    if (avg >= 50) return "→"
    return "↘"
}

const MyClasses = () => {
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)

    const buildClasses = async () => {
        setLoading(true)
        try {
            // TODO: replace TEACHER_ID with logged-in teacher's id once auth is done
            const TEACHER_ID = "TEACHER_ID_HERE"

            const [teacherRes, studentRes, resultRes] = await Promise.all([
                fetch(`http://localhost:5000/teacher/${TEACHER_ID}`),
                fetch("http://localhost:5000/student/getStudent"),
                fetch("http://localhost:5000/result")
            ])

            const teacher = await teacherRes.json()
            const students = await studentRes.json()
            const results = await resultRes.json()

            // get this teacher's assigned class names
            const assignedClasses = teacher.assignedClasses || []

            // for each assigned class, find matching students
            const classData = assignedClasses.map((ac) => {
                const classStudents = students.filter(s => s.studentClass === ac.className)
                return {
                    className: ac.className,
                    subject: ac.subject,
                    students: classStudents,
                    results
                }
            })

            setClasses(classData)
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    useEffect(() => {
        buildClasses()
    }, [])

    const getStudentAvg = (studentId, results) => {
        const studentResults = results.filter(r => r.studentId === studentId)
        if (studentResults.length === 0) return 0
        const sum = studentResults.reduce((acc, r) => acc + (r.total || 0), 0)
        return Math.round(sum / studentResults.length)
    }

    return (
        <div>
            <Sidebar />

            <div className="md:ml-64 px-6 pt-8 pb-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
                    <p className="text-xs text-gray-400 mt-1">View your assigned classes and students</p>
                </div>

                {loading ? (
                    <p className="text-xs text-gray-400">Loading classes...</p>
                ) : classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-2xl border border-gray-100">
                        <BookOpen size={40} className="text-gray-300 mb-3" />
                        <p className="text-sm text-gray-400">No classes assigned yet</p>
                        <p className="text-xs text-gray-300 mt-1">Ask your admin to assign you a class</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {classes.map(({ className, subject, students, results }) => (
                            <div key={className} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">

                                {/* Class Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <BookOpen size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-800 text-sm">{className}</h2>
                                            <p className="text-xs text-gray-400">{subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Users size={14} />
                                        {students.length} {students.length === 1 ? "student" : "students"}
                                    </div>
                                </div>

                                {/* Students Grid */}
                                {students.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-4">No students in this class yet</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {students.map((student) => {
                                            const avg = getStudentAvg(student._id, results)
                                            return (
                                                <div key={student._id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-semibold text-blue-500">
                                                            {getInitials(student.fullname)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-700">{student.fullname}</p>
                                                        <p className={`text-xs font-medium ${getAvgColor(avg)}`}>
                                                            {getAvgIcon(avg)} Avg: {avg}%
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyClasses