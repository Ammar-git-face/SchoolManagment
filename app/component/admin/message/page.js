"use client"
import { useEffect, useState } from "react";
import Sidebar from "../sidevar";
import { authFetch } from "../utils/api";
import { API } from "../../../config/api"

const MessagePage = () => {
    const [teachers, setTeachers] = useState([])
    const [parents, setParents] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, pRes] = await Promise.all([
                    authFetch(`${API}/teacher/getTeachers`),
                    authFetch(`${API}/student/getStudent`),
                ])
                const tData = await tRes.json()
                const pData = await pRes.json()
                setTeachers(Array.isArray(tData) ? tData : [])
                setParents(Array.isArray(pData) ? pData : [])
            } catch (err) { console.log(err) }
        }
        fetchData()
    }, [])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 md:ml-64 min-h-screen">
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-gray-800">Messages</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-6 pt-8 pb-10">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Messages</h1>
                    <p className="text-xs text-gray-400 mb-6">Communicate with teachers and parents</p>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm h-[500px] w-full md:w-2/5 overflow-y-auto">
                        <h2 className="font-bold text-gray-800 p-4 border-b border-gray-100 text-sm">Conversations</h2>

                        {teachers.length === 0 && parents.length === 0 ? (
                            <div className="text-center text-xs text-gray-400 py-8">No contacts found</div>
                        ) : (
                            <>
                                {teachers.map((t) => (
                                    <div key={t._id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                                            {t.fullname?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{t.fullname}</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-500 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Teacher</span>
                                    </div>
                                ))}
                                {parents.map((p) => (
                                    <div key={p._id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs flex-shrink-0">
                                            {p.parent?.charAt(0).toUpperCase() || "P"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{p.parent}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-500 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Parent</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessagePage;