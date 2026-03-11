"use client"
import { TrendingUp, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { useParent, parentFetch } from "../utils/useParent"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import Sidebar from "../sidebar"

const getGradeLabel = (avg) => {
    if (avg >= 90) return { grade: "A+", gpa: 4.0, label: "Excellent" }
    if (avg >= 80) return { grade: "A", gpa: 3.7, label: "Very Good" }
    if (avg >= 70) return { grade: "B", gpa: 3.0, label: "Good" }
    if (avg >= 60) return { grade: "C", gpa: 2.0, label: "Average" }
    if (avg >= 50) return { grade: "D", gpa: 1.0, label: "Below Average" }
    return { grade: "F", gpa: 0.0, label: "Fail" }
}

const gradeColor = (g) => {
    if (g?.startsWith("A")) return "text-green-500 bg-green-100"
    if (g?.startsWith("B")) return "text-blue-500 bg-blue-100"
    if (g?.startsWith("C")) return "text-yellow-500 bg-yellow-100"
    return "text-red-500 bg-red-100"
}

const scoreColor = (val, max) => {
    const pct = (val / max) * 100
    if (pct >= 80) return "text-green-500"
    if (pct >= 60) return "text-blue-500"
    if (pct >= 40) return "text-yellow-500"
    return "text-red-500"
}

const Performance = () => {
    const { children }       = useParent()
    // const [children, setChildren] = useState([])
    const [selectedChild, setSelectedChild] = useState(null)
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)

    const getChildren = async (parentId) => {
        try {
            const res = await fetch(`http://localhost:5000/student/parent/${parentId}`)
            const data = await res.json()
            setChildren(data)
            if (data.length > 0) setSelectedChild(data[0])
        } catch (err) { console.log(err) }
    }

    const getResults = async () => {
        try {
            const res = await parentFetch("http://localhost:5000/result/approved")
            const data = await res.json()
            setResults(data)
        } catch (err) { console.log(err) }
        finally { setLoading(false) }
    }

    useEffect(() => {
        const stored = localStorage.getItem("user")
        if (stored) {
            const parsed = JSON.parse(stored)
            getChildren(parsed.id)
            getResults()
        }
    }, [])

    const childResults = selectedChild ? results.filter(r => r.studentId === selectedChild._id) : []
    const avgTotal = childResults.length === 0 ? 0 : Math.round(childResults.reduce((acc, r) => acc + (r.total || 0), 0) / childResults.length)
    const avgGpa = childResults.length === 0 ? 0 : (childResults.reduce((acc, r) => acc + (r.gpa || 0), 0) / childResults.length).toFixed(2)
    const subjects = [...new Set(childResults.map(r => r.subject))].length
    const { grade, label } = getGradeLabel(avgTotal)

    const trendData = childResults.map(r => ({ name: `${r.subject} (${r.term})`, Total: r.total }))

    const subjectMap = {}
    childResults.forEach(r => {
        if (!subjectMap[r.subject]) subjectMap[r.subject] = { subject: r.subject, Test: 0, NoteCA: 0, Assignment: 0, Exam: 0, count: 0 }
        subjectMap[r.subject].Test += r.test || 0
        subjectMap[r.subject].NoteCA += r.note || 0
        subjectMap[r.subject].Assignment += r.assignment || 0
        subjectMap[r.subject].Exam += r.exam || 0
        subjectMap[r.subject].count += 1
    })
    const barData = Object.values(subjectMap).map(s => ({
        subject: s.subject,
        Test: Math.round(s.Test / s.count),
        "Note/CA": Math.round(s.NoteCA / s.count),
        Assignment: Math.round(s.Assignment / s.count),
        Exam: Math.round(s.Exam / s.count),
    }))

    return (
        <div>
               <Sidebar />
            <div className="md:ml-64 px-6 pt-8 pb-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>
                    <p className="text-xs text-gray-400 mt-1">Track your child academic progress</p>
                </div>

                <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                    value={selectedChild?._id || ""}
                    onChange={(e) => setSelectedChild(children.find(c => c._id === e.target.value))}>
                    {children.map(c => <option key={c._id} value={c._id}>{c.fullname}</option>)}
                </select>

                {loading ? <p className="text-xs text-gray-400">Loading...</p> : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Average Total", value: `${avgTotal}/100`, sub: label },
                                { label: "Overall Grade", value: grade, sub: `GPA ${avgGpa}` },
                                { label: "GPA", value: avgGpa, sub: "Out of 4.0" },
                                { label: "Subjects", value: subjects, sub: "recorded" }
                            ].map((card, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                    <p className="text-xs text-gray-400 mb-2">{card.label}</p>
                                    <h2 className="text-2xl font-bold text-gray-800">{card.value}</h2>
                                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="w-full lg:w-1/2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-blue-500" /> Score Trend
                                </h2>
                                {trendData.length === 0 ? <p className="text-xs text-gray-400 text-center py-10">No data yet</p> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={trendData}>
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="Total" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="w-full lg:w-1/2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen size={16} className="text-green-500" /> Score Breakdown by Subject
                                </h2>
                                {barData.length === 0 ? <p className="text-xs text-gray-400 text-center py-10">No data yet</p> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={barData}>
                                            <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Legend wrapperStyle={{ fontSize: 10 }} />
                                            <Bar dataKey="Test" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Note/CA" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Assignment" fill="#A855F7" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Exam" fill="#F97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                            <h2 className="font-bold text-sm p-5 flex items-center gap-2 border-b border-gray-100">
                                <span className="text-yellow-500">🏆</span> Detailed Results
                            </h2>
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Subject","Term","Test/20","Note/20","Assign/10","Exam/50","Total/100","Grade","GPA","Strengths","Weakness"].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {childResults.length === 0 ? (
                                        <tr><td colSpan={11} className="text-center text-xs text-gray-400 py-8">No results found</td></tr>
                                    ) : childResults.map((r) => (
                                        <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-700">{r.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{r.term}</td>
                                            <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.test, 20)}`}>{r.test}</td>
                                            <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.note, 20)}`}>{r.note}</td>
                                            <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.assignment, 10)}`}>{r.assignment}</td>
                                            <td className={`px-6 py-4 text-sm font-medium ${scoreColor(r.exam, 50)}`}>{r.exam}</td>
                                            <td className={`px-6 py-4 text-sm font-bold ${scoreColor(r.total, 100)}`}>{r.total}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{r.gpa?.toFixed(1)}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 max-w-[120px] truncate">{r.strengths || "—"}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 max-w-[120px] truncate">{r.areasToImprove || "None"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Performance