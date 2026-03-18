// "use client"
// import { Mic, VideoIcon, Calendar1Icon, Clock, File, X, Trash2, CheckCircle } from "lucide-react"
// import { useState, useEffect } from "react"
// import SideVar from "../sidevar"

// const AdminPTA = () => {
//     const [activeContent, setActiveContent] = useState('upcoming')
//     const [call, setCall] = useState(false)
//     const [meetings, setMeetings] = useState([])
//     const [stats, setStats] = useState({ teachers: [], parents: [] })
//     const [activeCall, setActiveCall] = useState(null) // holds meeting for Jitsi

//     // form state
//     const [title, setTitle] = useState("")
//     const [agenda, setAgenda] = useState("")
//     const [type, setType] = useState("video")
//     const [time, setTime] = useState("")
//     const [date, setDate] = useState("")
//     const [duration, setDuration] = useState("30 minutes")
//     const [allTeachers, setAllTeachers] = useState(false)
//     const [allParents, setAllParents] = useState(false)
//     const [loading, setLoading] = useState(false)
//     const [msg, setMsg] = useState(null)

//     const getMeetings = async () => {
//         try {
//             const res = await fetch('${API}/pta/get')
//             const result = await res.json()
//             setMeetings(Array.isArray(result) ? result : [])
//         } catch (err) { console.log(err) }
//     }

//     const getStats = async () => {
//         try {
//             const res = await fetch('${API}/pta/stats')
//             const result = await res.json()
//             setStats(result)
//         } catch (err) { console.log(err) }
//     }

//     useEffect(() => {
//         getMeetings()
//         getStats()
//     }, [])

//     const scheduleMeeting = async () => {
//         if (!title || !date || !time) return setMsg({ type: 'error', text: 'Title, date and time are required' })
//         setLoading(true)
//         setMsg(null)
//         try {
//             const res = await fetch('${API}/pta', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ title, agenda, type, time, date, duration, allTeachers, allParents })
//             })
//             if (res.ok) {
//                 setCall(false)
//                 setTitle(""); setAgenda(""); setTime(""); setDate("")
//                 setAllTeachers(false); setAllParents(false)
//                 getMeetings()
//             } else {
//                 const data = await res.json()
//                 setMsg({ type: 'error', text: data.error })
//             }
//         } catch (err) {
//             setMsg({ type: 'error', text: 'Something went wrong' })
//         } finally { setLoading(false) }
//     }

//     const handleComplete = async (id) => {
//         try {
//             await fetch(`${API}/pta/complete/${id}`, { method: 'PUT' })
//             getMeetings()
//         } catch (err) { console.log(err) }
//     }

//     const handleDelete = async (id) => {
//         try {
//             await fetch(`${API}/pta/${id}`, { method: 'DELETE' })
//             getMeetings()
//         } catch (err) { console.log(err) }
//     }

//     const upcoming = meetings.filter(m => m.status === 'upcoming')
//     const history = meetings.filter(m => m.status === 'completed')
//     const displayed = activeContent === 'upcoming' ? upcoming : history

//     return (
//         <div>
//             <SideVar />

//             <section className="px-4 md:px-0 md:ml-80 p-6 md:p-10">
//                 <h1 className="font-bold text-xl text-black mb-1">PTA Meetings</h1>
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
//                     <p className="text-xs text-black">Schedule and manage Parent-Teacher meetings</p>
//                     <button onClick={() => setCall(true)}
//                         className="bg-blue-500 px-4 sm:ml-auto w-full sm:w-auto rounded-xl text-white text-xs h-8">
//                         + Schedule Meeting
//                     </button>
//                 </div>
//                 <span className="flex items-center gap-3 mb-6">
//                     <button
//                         onClick={() => setActiveContent('upcoming')}
//                         className={`rounded-xl px-3 py-1.5 text-xs flex items-center gap-1 transition-all
//                             ${activeContent === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
//                         <Calendar1Icon size={10} /> Upcoming ({upcoming.length})
//                     </button>
//                     <button
//                         onClick={() => setActiveContent('history')}
//                         className={`rounded-xl px-3 py-1.5 text-xs flex items-center gap-1 transition-all
//                             ${activeContent === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
//                         <Clock size={10} /> History ({history.length})
//                     </button>
//                 </span>
//             </section>

//             <div className="mx-4 md:ml-80 -mt-6">
//                 {displayed.length === 0 ? (
//                     <div className="text-center w-full md:w-3/5 h-40 bg-gray-100 shadow-xl rounded-xl flex flex-col items-center justify-center">
//                         <File size={40} className="mb-3 text-gray-300" />
//                         <p className="text-xs text-gray-400">
//                             {activeContent === 'upcoming' ? 'No upcoming meetings' : 'No past meetings found'}
//                         </p>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {displayed.map((m) => (
//                             <div key={m._id} className="shadow-xl hover:shadow-2xl rounded-xl p-4 bg-white">
//                                 <nav className="flex justify-between items-center mb-3">
//                                     <span className="flex items-center text-sm font-bold gap-1">
//                                         {m.type === 'video'
//                                             ? <VideoIcon size={15} className="text-blue-200" />
//                                             : <Mic size={15} className="text-blue-200" />}
//                                         {m.title}
//                                     </span>
//                                     <span className={`text-xs px-2 py-0.5 rounded-full
//                                         ${m.status === 'upcoming' ? 'bg-blue-100 text-blue-200' : 'bg-green-100 text-green-600'}`}>
//                                         {m.status}
//                                     </span>
//                                 </nav>
//                                 <p className="text-xs text-gray-400 mb-3">{m.agenda}</p>
//                                 <span className="flex flex-wrap gap-3 mb-4">
//                                     <p className="flex items-center gap-1 text-black text-xs">
//                                         <Calendar1Icon size={11} />{m.date}
//                                     </p>
//                                     <p className="flex items-center gap-1 text-black text-xs">
//                                         <Clock size={11} />{m.time} ({m.duration})
//                                     </p>
//                                 </span>
//                                 <div className="flex items-center gap-2">
//                                     {m.status === 'upcoming' && (
//                                         <button
//                                             onClick={() => setActiveCall(m)}
//                                             className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-500 text-white py-1.5 rounded-xl hover:bg-blue-600">
//                                             {m.type === 'video' ? <VideoIcon size={12} /> : <Mic size={12} />}
//                                             Start Call
//                                         </button>
//                                     )}
//                                     {m.status === 'upcoming' && (
//                                         <button onClick={() => handleComplete(m._id)}
//                                             className="text-green-500 hover:text-green-600 p-1.5 rounded-xl border border-green-200 hover:bg-green-50">
//                                             <CheckCircle size={14} />
//                                         </button>
//                                     )}
//                                     <button onClick={() => handleDelete(m._id)}
//                                         className="text-red-400 hover:text-red-500 p-1.5 rounded-xl border border-red-200 hover:bg-red-50">
//                                         <Trash2 size={14} />
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Jitsi Call Modal */}
//             {activeCall && (
//                 <div className="fixed inset-0   z-50 flex flex-col">
//                     <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
//                         <div className="flex items-center gap-2">
//                             {activeCall.type === 'video'
//                                 ? <VideoIcon size={16} className="text-blue-400" />
//                                 : <Mic size={16} className="text-blue-400" />}
//                             <span className="text-white text-sm font-semibold">{activeCall.title}</span>
//                             <span className="text-gray-400 text-xs">— {activeCall.agenda}</span>
//                         </div>
//                         <button onClick={() => setActiveCall(null)}
//                             className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-xl text-xs flex items-center gap-1">
//                             <X size={12} /> End Call
//                         </button>
//                     </div>
//                     <iframe
//                         src={`https://meet.jit.si/${activeCall.roomName}#userInfo.displayName="Admin"`}
//                         className="flex-1 w-full border-0"
//                         allow="camera; microphone; fullscreen; display-capture"
//                     />
//                 </div>
//             )}

//             {/* Schedule Modal */}
//             {call && (
//                 <div className="fixed inset-0  /60 flex justify-center items-start z-50 overflow-y-auto px-4 py-8">
//                     <div className="bg-gray-100 p-6 rounded-xl font-sans w-full max-w-lg">
//                         <div className="flex justify-between items-center mb-4">
//                             <h1 className="font-bold text-sm">Schedule PTA Meeting</h1>
//                             <button onClick={() => setCall(false)}><X size={16} className="text-gray-400" /></button>
//                         </div>

//                         {msg && (
//                             <div className={`text-xs p-3 rounded-xl mb-4 border ${msg.type === 'error'
//                                 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
//                                 {msg.text}
//                             </div>
//                         )}

//                         <label className="block text-xs font-semibold mb-1">Meeting Title *</label>
//                         <input type="text" placeholder="e.g 1st Parent Teacher Conference"
//                             className="w-full border border-gray-300 p-2 rounded-xl mb-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={title} onChange={(e) => setTitle(e.target.value)} />

//                         <label className="block text-xs font-semibold mb-1">Agenda</label>
//                         <textarea placeholder="Meeting topics and discussion points..."
//                             className="w-full border border-gray-300 p-2 text-xs rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={agenda} onChange={(e) => setAgenda(e.target.value)} />

//                         <label className="block text-xs font-semibold mb-2">Meeting Type *</label>
//                         <span className="flex items-center gap-2 mb-4">
//                             <button onClick={() => setType("video")}
//                                 className={`flex justify-center items-center gap-2 p-2 w-1/2 rounded-xl text-sm transition-all
//                                     ${type === "video" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"}`}>
//                                 <VideoIcon size={16} /> Video Call
//                             </button>
//                             <button onClick={() => setType("audio")}
//                                 className={`flex justify-center items-center gap-2 p-2 w-1/2 rounded-xl text-sm transition-all
//                                     ${type === "audio" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"}`}>
//                                 <Mic size={16} /> Audio Call
//                             </button>
//                         </span>

//                         <div className="flex flex-col sm:flex-row gap-2 mb-4">
//                             <div className="w-full">
//                                 <label className="block text-xs font-semibold mb-1">Time *</label>
//                                 <input type="time"
//                                     className="w-full border border-gray-300 p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     value={time} onChange={(e) => setTime(e.target.value)} />
//                             </div>
//                             <div className="w-full">
//                                 <label className="block text-xs font-semibold mb-1">Date *</label>
//                                 <input type="date"
//                                     className="w-full border border-gray-300 p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     value={date} onChange={(e) => setDate(e.target.value)} />
//                             </div>
//                         </div>

//                         <label className="block text-xs font-semibold mb-1">Duration</label>
//                         <select className="w-full border border-gray-300 p-2 bg-white text-xs rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={duration} onChange={(e) => setDuration(e.target.value)}>
//                             <option>15 minutes</option>
//                             <option>30 minutes</option>
//                             <option>45 minutes</option>
//                             <option>1 hour</option>
//                             <option>2 hours</option>
//                         </select>

//                         <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
//                             <label className="flex items-center gap-2 text-sm font-semibold mb-2 cursor-pointer">
//                                 <input type="checkbox" checked={allTeachers}
//                                     onChange={(e) => setAllTeachers(e.target.checked)} />
//                                 Invite All Teachers ({stats.teachers?.length || 0})
//                             </label>
//                         </div>

//                         <div className="bg-white rounded-xl p-3 mb-6 shadow-sm">
//                             <label className="flex items-center gap-2 text-sm font-semibold mb-2 cursor-pointer">
//                                 <input type="checkbox" checked={allParents}
//                                     onChange={(e) => setAllParents(e.target.checked)} />
//                                 Invite All Parents ({stats.parents?.length || 0})
//                             </label>
//                         </div>

//                         <span className="flex items-center justify-end gap-4">
//                             <button className="text-xs text-black" onClick={() => setCall(false)}>Cancel</button>
//                             <button onClick={scheduleMeeting} disabled={loading}
//                                 className="bg-blue-500 px-4 py-2 rounded-xl text-white text-xs disabled:opacity-50">
//                                 {loading ? 'Scheduling...' : 'Schedule Meeting'}
//                             </button>
//                         </span>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default AdminPTA

"use client"
import { Mic, VideoIcon, Calendar1Icon, Clock, File, X, Trash2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import SideVar from "../sidevar"
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"

// ✅ Outside parent component — prevents cursor jump on inputs
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
        <div className="fixed inset-0  /60 flex justify-center items-start z-50 overflow-y-auto px-4 py-8">
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

const AdminPTA = () => {
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
            {sidebarOpen && <div className="fixed inset-0   bg-opacity-40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile topbar */}
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

                    {/* Tabs */}
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

                    {/* Meetings grid */}
                    {displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 bg-white border border-gray-100 rounded-2xl">
                            <File size={36} className="mb-3 text-black" />
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
                                        <p className="flex items-center gap-1 text-black text-xs">
                                            <Calendar1Icon size={11} />{m.date}
                                        </p>
                                        <p className="flex items-center gap-1 text-black text-xs">
                                            <Clock size={11} />{m.time} ({m.duration})
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {m.status === 'upcoming' && (
                                            <>
                                                <button onClick={() => setActiveCall(m)}
                                                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-500 text-white py-1.5 rounded-xl hover:bg-blue-600">
                                                    {m.type === 'video' ? <VideoIcon size={12} /> : <Mic size={12} />}
                                                    Start Call
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

            {/* Jitsi Call Modal */}
            {activeCall && (
                <div className="fixed inset-0   z-50 flex flex-col">
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

            {/* Schedule Modal */}
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
}

export default AdminPTA