"use client"
import { Bell, Calendar, Search } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"
import { useParent, parentFetch } from "../utils/useParent"

const ParentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    const getAnnouncements = async () => {
        try {
            const res = await parentFetch("http://localhost:5000/alert/get")
            const data = await res.json()
            // only show announcements meant for parents or all
            const filtered = data.filter(a => a.to === "Parent" || a.to === "All")
            setAnnouncements(filtered)
        } catch (err) { console.log(err) }
        finally { setLoading(false) }
    }

    useEffect(() => {
        getAnnouncements()
    }, [])

    const filtered = announcements.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.message?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <Sidebar />
            <div className="md:ml-64 px-6 pt-8 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                        <p className="text-xs text-gray-400 mt-1">Stay updated with the latest school announcements</p>
                    </div>
                    <span className="bg-blue-100 text-blue-500 text-xs font-semibold px-3 py-1 rounded-full">
                        {announcements.length} Total
                    </span>
                </div>

                {/* Search */}
                <div className="relative max-w-sm mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search announcements..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Announcements List */}
                {loading ? (
                    <p className="text-xs text-gray-400">Loading...</p>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-2xl border border-gray-100">
                        <Bell size={40} className="text-gray-300 mb-3" />
                        <p className="text-sm text-gray-400">No announcements yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map((a) => (
                            <div key={a._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-xl">
                                            <Bell size={16} className="text-blue-500" />
                                        </div>
                                        <h2 className="text-sm font-bold text-gray-800">{a.title}</h2>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border
                                            ${a.to === "All" ? "bg-purple-50 text-purple-500 border-purple-200" : "bg-blue-50 text-blue-500 border-blue-200"}`}>
                                            {a.to}
                                        </span>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{a.message}</p>
                                <p className="text-xs text-gray-300 mt-3">— School Headmaster</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ParentAnnouncements