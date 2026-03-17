"use client"
import { Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"
import { teacherFetch } from "../utils/api"
import { API } from "../../../config/api"


const TeacherAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)

    const getAnnouncements = async () => {
        try {
            const res = await teacherFetch(`${API}/alert/get`)
            const data = await res.json()
            // only show announcements meant for teachers or all
            const filtered = data.filter(a => a.to === 'Teachers' || a.to === 'All')
            setAnnouncements(filtered)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAnnouncements()
    }, [])

    const getBadgeStyle = (to) => {
        if (to === 'All') return 'bg-blue-50 text-blue-400 border border-blue-100'
        if (to === 'Teachers') return 'bg-gray-100 text-gray-500 border border-gray-200'
        return 'bg-gray-100 text-gray-400'
    }

    const getBadgeLabel = (to) => {
        if (to === 'All') return 'Both Parent And Teachers'
        return to
    }

    return (
        <div>
            <Sidebar />

            <div className="md:ml-64 px-6 pt-8 pb-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                    <p className="text-xs text-gray-400 mt-1">View school announcements</p>
                </div>

                {/* Announcements List */}
                {loading ? (
                    <p className="text-xs text-gray-400">Loading announcements...</p>
                ) : announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-sm text-gray-400">No announcements yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {announcements.map((a) => (
                            <div key={a._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <h2 className="font-bold text-gray-800 text-sm">{a.title}</h2>
                                    <span className={`text-xs px-3 py-1 rounded-full ${getBadgeStyle(a.to)}`}>
                                        {getBadgeLabel(a.to)}
                                    </span>
                                </div>
                                <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                                    <Calendar size={12} />
                                    {new Date(a.createdAt).toLocaleDateString('en-CA')}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">{a.message}</p>
                                <p className="text-xs text-gray-400">— School Headmaster</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherAnnouncements