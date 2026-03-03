"use client"
import { List, Mic, VideoIcon, Calendar1Icon, Clock, File } from "lucide-react"
import { useState, useEffect } from "react";
import Sidebar from "../sidebar";



Sidebar

const Teacherpta = () => {

    const [history, setHistory] = useState(false)
    const [meetings, setMeetings] = useState([])
    const [Upcoming, setUpcoming] = useState(true)
    const [activeContent, setActiveContent] = useState('')


    const coming = [
        { icon: <Mic size={15} className="text-blue-500" />, title: "parent Awareness", task: "completed", agenda: "parent getting to know school", date: 'Feb 23, 2026', dicon: <Calendar1Icon />, time: "02:15 AM (50min)", ticon: <Clock size={10} />, id: 1 },
        { icon: <Mic size={15} className="text-blue-500" />, title: "parent Awareness", task: "completed", agenda: "parent getting to know school", date: 'Feb 23, 2026', dicon: <Calendar1Icon />, time: "02:15 AM (50min)", ticon: <Clock size={10} />, id: 2 },
        { icon: <Mic size={15} className="text-blue-500" />, title: "parent Awareness", task: "completed", agenda: "parent getting to know school", date: 'Feb 23, 2026', dicon: <Calendar1Icon />, time: "02:15 AM (50min)", ticon: <Clock size={10} />, id: 3 },
    ]

    const getMeetings = async () => {
        try {
            const res = await fetch('http://localhost:5000/pta/get')
            const result = await res.json()
            setMeetings(result)
        } catch (err) { console.log(err) }
    }
    useEffect(() => {
        getMeetings()
    }, [])
    return (

        <div>
            <Sidebar />

            <nav>
                <section className="px-4 md:px-0 md:ml-80 p-6 md:p-10">
                    <h1 className="font-bold text-xl text-black mb-1">PTA Meetings</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <p className="text-xs text-gray-500">Manage calls</p>
                    </div>

                    <span className="flex items-center gap-3">
                        <button className={`bg-gray-100 rounded-sm shadow-sm w-23 text-center items-center gap-1 flex p-1 text-xs hover:bg-white ${activeContent === coming}`} onClick={() => setActiveContent(Upcoming)}>
                            <Calendar1Icon size={10} />Upcoming
                        </button>
                        <button className={`bg-gray-100 rounded-sm shadow-sm w-23 text-center items-center gap-1 flex p-1 text-xs hover:bg-white ${activeContent === history}`} onClick={() => setActiveContent(history)}>
                            <Clock size={10} />History
                        </button>
                    </span>
                </section>

                {activeContent === Upcoming && (
                    <div className="mx-4 md:ml-80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {meetings.map((list) => (
                            <div key={list._id} className="shadow-xl hover:shadow-2xl rounded-xl p-3">
                                <nav className="flex justify-between items-center mb-4">
                                    <span className="flex items-center text-sm font-bold gap-1">
                                        {/* icon logic based on type */}
                                        {list.type === 'video'
                                            ? <VideoIcon size={15} className="text-blue-500" />
                                            : <Mic size={15} className="text-blue-500" />
                                        }
                                        {list.title}
                                    </span>
                                    <nav className="text-xs bg-gray-200 rounded-xl px-2 h-4 text-center">upcoming</nav>
                                </nav>
                                <p className="text-xs text-gray-400 px-1 mb-4">{list.agenda}</p>
                                <span className="flex flex-wrap gap-4">
                                    <p className="flex items-center gap-1 text-gray-500 text-xs"><Calendar1Icon size={12} />{list.date}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} />{list.time}</p>
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {activeContent === history && (
                    <div className="mx-4 md:ml-80 text-center w-auto md:w-3/5 h-40 bg-gray-100 shadow-xl flex flex-col items-center justify-center">
                        <File size={70} className="mb-4 p-2" />
                        no Past meetings found
                    </div>
                )}
            </nav>
        </div>
    );
}

export default Teacherpta;