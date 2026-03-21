"use client"
import { TrendingUp, GraduationCap, AlertTriangle, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"
import { useParent, parentFetch } from "../utils/useParent"
import { API } from "../../../config/api"

const getInitials = (name = "") => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
const getScoreColor = (s) => s >= 70 ? "text-green-500" : s >= 50 ? "text-yellow-500" : "text-red-500"
const getAvgColor = (a) => a >= 70 ? "text-green-500 bg-green-50 border-green-200"
    : a >= 50 ? "text-yellow-500 bg-yellow-50 border-yellow-200"
        : "text-orange-400 bg-orange-50 border-orange-200"

const MyChildren = () => {
    const { user, children } = useParent()   // ✅ always array, no hardcoded name
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.id) return
        const fetchResults = async () => {
            try {
                const res = await parentFetch(`${API}/result`)
                const data = await res.json()
                setResults(Array.isArray(data) ? data : [])
            } catch (err) { console.log(err) }
            finally { setLoading(false) }
        }
        fetchResults()
    }, [user])

    const getChildResults = (id) => results.filter(r => r.studentId?.toString() === id?.toString())
    const getChildAvg = (id) => {
        const r = getChildResults(id)
        return r.length === 0 ? 0 : Math.round(r.reduce((a, x) => a + (x.total || 0), 0) / r.length)
    }
    const getStrengths = (id) => getChildResults(id).map(x => x.strengths).filter(Boolean).join(", ") || "No data yet"
    const getAreasToImprove = (id) => getChildResults(id).map(x => x.areasToImprove).filter(Boolean).join(", ") || "No data yet"

    return (
        <div>
            <Sidebar />
            <div className="md:ml-64 px-6 pt-8 pb-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-black">My Children</h1>
                    <p className="text-xs text-gray-400 mt-1">View detailed information about your children</p>
                </div>

                {loading ? (
                    <p className="text-xs text-gray-400">Loading...</p>
                ) : children.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-2xl border border-gray-100">
                        <GrduationCap size={40} className="text-gray-300 mb-3" />
                        <p className="text-sm text-gray-400">No children linked to your account</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {children.map((child) => {
                            const avg = getChildAvg(child._id)
                            const childResults = getChildResults(child._id)
                            return (
                                <div key={child._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-blue-200">{getInitials(child.fullname)}</span>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-black text-base">{child.fullname}</h2>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="flex items-center gap-1 text-xs text-blue-200 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                                    <GraduationCap size={10} /> {child.studentClass}
                                                </span>
                                                <span className={`flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full ${getAvgColor(avg)}`}>
                                                    <TrendingUp size={10} /> {avg}% Average
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                            <p className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-2">
                                                <CheckCircle size={13} /> Strengths
                                            </p>
                                            <p className="text-xs text-black leading-relaxed">{getStrengths(child._id)}</p>
                                        </div>
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                            <p className="text-xs font-semibold text-orange-500 flex items-center gap-1 mb-2">
                                                <AlertTriangle size={13} /> Areas to Improve
                                            </p>
                                            <p className="text-xs text-black leading-relaxed">{getAreasToImprove(child._id)}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm font-semibold text-black mb-3">Recent Results</p>
                                    {childResults.length === 0 ? (
                                        <p className="text-xs text-gray-400">No results yet</p>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    {["Subject", "Grade", "Score", "Term"].map(h =>
                                                        <th key={h} className="text-left text-xs text-gray-400 font-medium pb-2">{h}</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {childResults.map(r => (
                                                    <tr key={r._id} className="border-t border-gray-50 hover:bg-gray-50">
                                                        <td className="py-3 text-sm text-black">{r.subject}</td>
                                                        <td className="py-3 text-sm text-black">{r.grade}</td>
                                                        <td className={`py-3 text-sm font-semibold ${getScoreColor(r.total)}`}>{r.total}/100</td>
                                                        <td className="py-3 text-sm text-gray-400">{r.term}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyChildren