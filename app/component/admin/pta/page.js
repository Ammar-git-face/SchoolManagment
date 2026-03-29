"use client"
import { Mic, VideoIcon, Calendar1Icon, Clock, File, X, Trash2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import SideVar from "../sidevar"
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"
import PremiumGate from "../PremiumGate"   // ✅ ADDED: import the gate component

const ScheduleModal = ({ onClose, onSubmit, stats, loading, msg }) => {
    const [title, setTitle]       = useState("")
    const [agenda, setAgenda]     = useState("")
    const [type, setType]         = useState("video")
    const [time, setTime]         = useState("")
    const [date, setDate]         = useState("")
    const [duration, setDuration] = useState("30 minutes")
    const [allTeachers, setAllTeachers] = useState(false)
    const [allParents, setAllParents]   = useState(false)

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 overflow-y-auto px-4 py-8">
            <div className="bg-white p-6 rounded-2xl font-sans w-full max-w-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="font-bold text-sm">Schedule PTA Meeting</h1>
                    <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
                </div>
                {msg && (
                    <div className={`text-xs p-3 rounded-xl mb-4 border ${msg.type === 'error'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {msg.text}
                    </div>
                )}
                <label className="block text-xs font-semibold mb-1 text-black">Meeting Title *</label>
                <input type="text" placeholder="e.g 1st Parent Teacher Conference"
                    className="w-full border border-gray-200 p-2.5 rounded-xl mb-3 text-xs focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                    value={title} onChange={e => setTitle(e.target.value)} />
                <label className="block text-xs font-semibold mb-1 text-black">Agenda</label>
                <textarea placeholder="Meeting topics and discussion points..."
                    className="w-full border border-gray-200 p-2.5 text-xs rounded-xl mb-4 focus:outline-none focus:ring-2 text-black focus:ring-blue-500 resize-none h-20"
                    value={agenda} onChange={e => setAgenda(e.target.value)} />
                <label className="block text-xs font-semibold mb-2 text-black">Meeting Type *</label>
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setType("video")}
                        className={`flex justify-center items-center gap-2 p-2 w-1/2 rounded-xl text-sm transition-all
                            ${type === "video" ? "bg-blue-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}>
                        <VideoIcon size={14} /> Video Call
                    </button>
                    <button onClick={() => setType("audio")}
                        className={`flex justify-center items-center gap-2 p-2 w-1/2 rounded-xl text-sm transition-all
                            ${type === "audio" ? "bg-blue-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}>
                        <Mic size={14} /> Audio Call
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold mb-1 text-black">Time *</label>
                        <input type="time"
                            className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                            value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold mb-1 text-black">Date *</label>
                        <input type="date"
                            className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 text-black focus:ring-blue-500"
                            value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>
                <label className="block text-xs font-semibold mb-1 text-black">Duration</label>
                <select className="w-full border border-gray-200 p-2.5 text-xs rounded-xl mb-5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={duration} onChange={e => setDuration(e.target.value)}>
                    {["15 minutes", "30 minutes", "45 minutes", "1 hour", "2 hours"].map(d =>
                        <option key={d}>{d}</option>
                    )}
                </select>
                <div className="flex flex-col gap-3 mb-6">
                    <label className="flex items-center gap-2 text-xs font-semibold bg-gray-50 border text-black border-gray-100 rounded-xl p-3 cursor-pointer">
                        <input type="checkbox" checked={allTeachers} onChange={e => setAllTeachers(e.target.checked)} />
                        Invite All Teachers ({stats.teachers?.length || 0})
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold bg-gray-50 border text-black border-gray-100 rounded-xl p-3 cursor-pointer">
                        <input type="checkbox" checked={allParents} onChange={e => setAllParents(e.target.checked)} />
                        Invite All Parents ({stats.parents?.length || 0})
                    </label>
                </div>
                <div className="flex items-center justify-end gap-3">
                    <button className="text-xs text-black" onClick={onClose}>Cancel</button>
                    <button onClick={() => onSubmit({ title, agenda, type, time, date, duration, allTeachers, allParents })}
                        disabled={loading}
                        className="bg-blue-500 px-4 py-2 rounded-xl text-white text-xs disabled:opacity-50 hover:bg-blue-600">
                        {loading ? 'Scheduling...' : 'Schedule Meeting'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ ADDED: Wrap the entire page content in a function called PTAContent
//    This is the actual page — PremiumGate will decide whether to show it
// ─────────────────────────────────────────────────────────────────────────────
const PTAContent = () => {                                                    // ✅ ADDED
    const [activeContent, setActiveContent] = useState('upcoming')
    const [showModal, setShowModal]   = useState(false)
    const [meetings, setMeetings]     = useState([])
    const [stats, setStats]           = useState({ teachers: [], parents: [] })
    const [activeCall, setActiveCall] = useState(null)
    const [loading, setLoading]       = useState(false)
    const [msg, setMsg]               = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const getMeetings = async () => {
        try {
            const res = await authFetch(`${API}/pta/get`)
            const data = await res.json()
            setMeetings(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
    }

    const getStats = async () => {
        try {
            const res = await authFetch(`${API}/pta/stats`)
            const data = await res.json()
            setStats(data)
        } catch (err) { console.log(err) }
    }

    useEffect(() => { getMeetings(); getStats() }, [])

    const handleSchedule = async (formData) => {
        if (!formData.title || !formData.date || !formData.time)
            return setMsg({ type: 'error', text: 'Title, date and time are required' })
        setLoading(true); setMsg(null)
        try {
            const res = await authFetch(`${API}/pta`, {
                method: 'POST',
                body: JSON.stringify(formData),
            })
            if (res.ok) { setShowModal(false); getMeetings() }
            else {
                const d = await res.json()
                setMsg({ type: 'error', text: d.error || 'Failed to schedule' })
            }
        } catch { setMsg({ type: 'error', text: 'Something went wrong' }) }
        finally { setLoading(false) }
    }

    const handleComplete = async (id) => {
        try {
            await authFetch(`${API}/pta/complete/${id}`, { method: 'PUT' })
            getMeetings()
        } catch (err) { console.log(err) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this meeting?')) return
        try {
            await authFetch(`${API}/pta/${id}`, { method: 'DELETE' })
            getMeetings()
        } catch (err) { console.log(err) }
    }

    const upcoming  = meetings.filter(m => m.status === 'upcoming')
    const history   = meetings.filter(m => m.status === 'completed')
    const displayed = activeContent === 'upcoming' ? upcoming : history

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideVar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
            <div className="flex-1 md:ml-64 min-h-screen">
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black">PTA Meetings</h1>
                    <div className="w-8" />
                </div>
                <div className="px-4 md:px-6 pt-8 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-black">PTA Meetings</h1>
                            <p className="text-xs text-gray-400 mt-1">Schedule and manage Parent-Teacher meetings</p>
                        </div>
                        <button onClick={() => { setMsg(null); setShowModal(true) }}
                            className="bg-blue-500 px-4 py-2 rounded-xl text-white text-xs hover:bg-blue-600">
                            + Schedule Meeting
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        {[
                            { key: 'upcoming', label: 'Upcoming', count: upcoming.length, icon: <Calendar1Icon size={10} /> },
                            { key: 'history',  label: 'History',  count: history.length,  icon: <Clock size={10} /> },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveContent(tab.key)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all
                                    ${activeContent === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                                {tab.icon} {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                    {displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 bg-white border border-gray-100 rounded-2xl">
                            <File size={36} className="mb-3 text-gray-300" />
                            <p className="text-xs text-gray-400">
                                {activeContent === 'upcoming' ? 'No upcoming meetings' : 'No past meetings found'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayed.map(m => (
                                <div key={m._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="flex items-center gap-1.5 font-bold text-sm text-black">
                                            {m.type === 'video'
                                                ? <VideoIcon size={14} className="text-blue-200" />
                                                : <Mic size={14} className="text-blue-200" />}
                                            {m.title}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2
                                            ${m.status === 'upcoming' ? 'bg-blue-100 text-blue-200' : 'bg-green-100 text-green-600'}`}>
                                            {m.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{m.agenda}</p>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <p className="flex items-center gap-1 text-black text-xs"><Calendar1Icon size={11} />{m.date}</p>
                                        <p className="flex items-center gap-1 text-black text-xs"><Clock size={11} />{m.time} ({m.duration})</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {m.status === 'upcoming' && (
                                            <>
                                                <button onClick={() => setActiveCall(m)}
                                                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-500 text-white py-1.5 rounded-xl hover:bg-blue-600">
                                                    {m.type === 'video' ? <VideoIcon size={12} /> : <Mic size={12} />} Start Call
                                                </button>
                                                <button onClick={() => handleComplete(m._id)}
                                                    className="text-green-500 p-1.5 rounded-xl border border-green-200 hover:bg-green-50">
                                                    <CheckCircle size={14} />
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleDelete(m._id)}
                                            className="text-red-400 p-1.5 rounded-xl border border-red-200 hover:bg-red-50">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {activeCall && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
                        <div className="flex items-center gap-2">
                            {activeCall.type === 'video'
                                ? <VideoIcon size={16} className="text-blue-400" />
                                : <Mic size={16} className="text-blue-400" />}
                            <span className="text-white text-sm font-semibold">{activeCall.title}</span>
                            <span className="text-gray-400 text-xs hidden sm:block">— {activeCall.agenda}</span>
                        </div>
                        <button onClick={() => setActiveCall(null)}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                            <X size={12} /> End Call
                        </button>
                    </div>
                    <iframe
                        src={`https://meet.jit.si/${activeCall.roomName}#userInfo.displayName="Admin"`}
                        className="flex-1 w-full border-0"
                        allow="camera; microphone; fullscreen; display-capture"
                    />
                </div>
            )}
            {showModal && (
                <ScheduleModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSchedule}
                    stats={stats}
                    loading={loading}
                    msg={msg}
                />
            )}
        </div>
    )
}                                                                             // ✅ ADDED: closing brace of PTAContent

// ─────────────────────────────────────────────────────────────────────────────
// ✅ ADDED: AdminPTA now just wraps PTAContent inside PremiumGate
//    - Free schools see the upgrade screen instead of the page
//    - Trial and Premium schools see the full page normally
//    - The feature="" prop sets the message shown on the upgrade screen
// ─────────────────────────────────────────────────────────────────────────────
const AdminPTA = () => {                                                      // ✅ ADDED
    return (                                                                  // ✅ ADDED
        <PremiumGate feature="PTA Meetings">                                  // ✅ ADDED: wrap with gate, name the feature
            <PTAContent />                                                    // ✅ ADDED: render actual page inside gate
        </PremiumGate>                                                        // ✅ ADDED
    )                                                                         // ✅ ADDED
}                                                                             // ✅ ADDED

export default AdminPTA