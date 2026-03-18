"use client"
import { Calendar, User2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../sidevar";
import { authFetch } from "../utils/api";
import { API } from "../../../config/api"

const AlertPage = () => {
    const [create, setCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [to, setTo] = useState("All");
    const [display, setDisplay] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleDelete = async (id) => {
        try {
            const res = await authFetch(`${API}/alert/${id}`, { method: "DELETE" })
            if (res.ok) getData()
        } catch (err) { console.log(err) }
    }

    const Send = async (e) => {
        e.preventDefault()
        try {
            const res = await authFetch(`${API}/alert`, {
                method: "POST",
                body: JSON.stringify({ title, message, to }),
            })
            if (res.ok) {
                setCreate(false)
                setTitle(""); setMessage(""); setTo("All")
                getData()
            }
        } catch (err) { console.log(err) }
    }

    const getData = async () => {
        try {
            const res = await authFetch(`${API}/alert/get`)
            const data = await res.json()
            setDisplay(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
    }

    useEffect(() => { getData() }, [])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div className="fixed inset-0   bg-opacity-40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile topbar */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black">Announcements</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-6 pt-8 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-black">Announcements</h1>
                            <p className="text-xs text-gray-400 mt-1">Send announcements to teachers and parents</p>
                        </div>
                        <button onClick={() => setCreate(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs hover:bg-blue-600 transition">
                            + Create Announcement
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {display.length === 0 ? (
                            <div className="text-center text-xs text-gray-400 py-16">No announcements yet</div>
                        ) : display.map((list) => (
                            <div key={list._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <h2 className="font-bold text-black text-sm">{list.title}</h2>
                                    <button className="text-red-400 hover:text-red-600 ml-3 flex-shrink-0"
                                        onClick={() => handleDelete(list._id)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    <Calendar size={13} />
                                    <span>{new Date(list.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric", month: "short", day: "numeric"
                                    })}</span>
                                    <User2 size={13} />
                                    <span className="bg-blue-100 text-blue-200 px-2 py-0.5 rounded-full">{list.to}</span>
                                </div>
                                <p className="text-xs text-black mb-3">{list.message}</p>
                                <p className="text-xs text-gray-400 italic">— School Headmaster</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {create && (
                <div className="fixed inset-0 w-full  /60 z-50 flex items-start justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mt-20">
                        <h2 className="font-bold text-black mb-1">Create Announcement</h2>
                        <p className="text-xs text-gray-400 mb-5">Send an announcement to teachers, parents, or both</p>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs text-black mb-1 block">Title</label>
                                <input type="text" placeholder="Announcement title"
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-black mb-1 block">Message</label>
                                <textarea placeholder="Announcement message"
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    value={message} onChange={(e) => setMessage(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-black0 mb-1 block">Send To</label>
                                <select className="w-full border border-gray-200 rounded-xl p-2.5 text-black text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={to} onChange={(e) => setTo(e.target.value)}>
                                    <option>All</option>
                                    <option>Parent</option>
                                    <option>Teachers</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setCreate(false)}
                                className="flex-1 text-xs text-black border border-gray-200 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                            <button onClick={Send}
                                className="flex-1 text-xs bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AlertPage;