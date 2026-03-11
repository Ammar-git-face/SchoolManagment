"use client"
import { Mic, VideoIcon, Calendar1Icon, Clock, File, X } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"
import { useTeacher, teacherFetch } from "../utils/api"

const TeacherPTA = () => {
    const { user } = useTeacher()
    const [activeContent, setActiveContent] = useState('upcoming')
    const [meetings, setMeetings] = useState([])
    const [activeCall, setActiveCall] = useState(null)

    useEffect(() => {
        getMeetings()
    }, [])

    const getMeetings = async () => {
        try {
            const res = await teacherFetch('http://localhost:5000/pta/get')
            const result = await res.json()
            setMeetings(Array.isArray(result) ? result : [])
        } catch (err) { console.log(err) }
    }

    const upcoming  = meetings.filter(m => m.status === 'upcoming')
    const history   = meetings.filter(m => m.status === 'completed')
    const displayed = activeContent === 'upcoming' ? upcoming : history

    // use name from useTeacher hook instead of reading localStorage manually
    const userName = user?.name || "Teacher"

    return (
        <div>
            <Sidebar />

            <section className="px-4 md:px-0 md:ml-80 p-6 md:p-10">
                <h1 className="font-bold text-xl text-black mb-1">PTA Meetings</h1>
                <p className="text-xs text-gray-500 mb-4">View and join scheduled meetings</p>
                <span className="flex items-center gap-3 mb-6">
                    <button onClick={() => setActiveContent('upcoming')}
                        className={`rounded-xl px-3 py-1.5 text-xs flex items-center gap-1 transition-all
                            ${activeContent === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <Calendar1Icon size={10} /> Upcoming ({upcoming.length})
                    </button>
                    <button onClick={() => setActiveContent('history')}
                        className={`rounded-xl px-3 py-1.5 text-xs flex items-center gap-1 transition-all
                            ${activeContent === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <Clock size={10} /> History ({history.length})
                    </button>
                </span>
            </section>

            <div className="mx-4 md:ml-80 -mt-6">
                {displayed.length === 0 ? (
                    <div className="text-center w-full md:w-3/5 h-40 bg-gray-100 shadow-xl rounded-xl flex flex-col items-center justify-center">
                        <File size={40} className="mb-3 text-gray-300" />
                        <p className="text-xs text-gray-400">
                            {activeContent === 'upcoming' ? 'No upcoming meetings' : 'No past meetings'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayed.map((m) => (
                            <div key={m._id} className="shadow-xl hover:shadow-2xl rounded-xl p-4 bg-white">
                                <nav className="flex justify-between items-center mb-3">
                                    <span className="flex items-center text-sm font-bold gap-1">
                                        {m.type === 'video'
                                            ? <VideoIcon size={15} className="text-blue-500" />
                                            : <Mic size={15} className="text-blue-500" />}
                                        {m.title}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full
                                        ${m.status === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                        {m.status}
                                    </span>
                                </nav>
                                <p className="text-xs text-gray-400 mb-3">{m.agenda}</p>
                                <span className="flex flex-wrap gap-3 mb-4">
                                    <p className="flex items-center gap-1 text-gray-500 text-xs">
                                        <Calendar1Icon size={11} />{m.date}
                                    </p>
                                    <p className="flex items-center gap-1 text-gray-500 text-xs">
                                        <Clock size={11} />{m.time} ({m.duration})
                                    </p>
                                </span>
                                {m.status === 'upcoming' && (
                                    <button onClick={() => setActiveCall(m)}
                                        className="w-full flex items-center justify-center gap-1 text-xs bg-blue-500 text-white py-1.5 rounded-xl hover:bg-blue-600">
                                        {m.type === 'video' ? <VideoIcon size={12} /> : <Mic size={12} />}
                                        Join Call
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Jitsi Call */}
            {activeCall && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
                        <div className="flex items-center gap-2">
                            {activeCall.type === 'video'
                                ? <VideoIcon size={16} className="text-blue-400" />
                                : <Mic size={16} className="text-blue-400" />}
                            <span className="text-white text-sm font-semibold">{activeCall.title}</span>
                        </div>
                        <button onClick={() => setActiveCall(null)}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                            <X size={12} /> Leave Call
                        </button>
                    </div>
                    <iframe
                        src={`https://meet.jit.si/${activeCall.roomName}#userInfo.displayName="${encodeURIComponent(userName)}"`}
                        className="flex-1 w-full border-0"
                        allow="camera; microphone; fullscreen; display-capture"
                    />
                </div>
            )}
        </div>
    )
}

export default TeacherPTA