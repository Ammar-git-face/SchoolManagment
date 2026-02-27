"use client"
import { List, Mic, VideoIcon, Calendar1Icon, Clock, File } from "lucide-react"
import { useState, useEffect } from "react"
import SideVar from "../sidevar"

const pta = () => {
    const handle = () => {
        Setslected(!selected)
    }
    const [participants, setParticipants] = useState({
        teachers: { all: false, selected: [] },
        parents: { all: false, selected: [] }
    });

    const [call, setCall] = useState(false)
    const [title, setTitle] = useState("")
    const [active, setActive] = useState(false);
    const [teacher, setTeachers] = useState([])
    const [student, setStudent] = useState([])
    const [history, setHistory] = useState(false)
    const [Upcoming, setUpcoming] = useState(true)
    const [activeContent, setActiveContent] = useState('')

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/teacher/getTeachers')
            const result = await res.json();
            setTeachers(result)
        } catch (err) { console.log }
    }
    useEffect(() => { fetchData(); }, [])

    const getStudent = async () => {
        try {
            const res = await fetch('http://localhost:5000/student/getStudent')
            const result = await res.json();
            setStudent(result)
        } catch (err) { console.log }
    }
    useEffect(() => { getStudent(); }, [])

    const coming = [
        { icon: <Mic size={15} className="text-blue-500" />, title: "parent Awareness", task: "completed", agenda: "parent getting to know school", date: 'Feb 23, 2026', dicon: <Calendar1Icon />, time: "02:15 AM (50min)", ticon: <Clock size={10} />, id: 1 },
        { icon: <Mic size={15} className="text-blue-500" />, title: "parent Awareness", task: "completed", agenda: "parent getting to know school", date: 'Feb 23, 2026', dicon: <Calendar1Icon />, time: "02:15 AM (50min)", ticon: <Clock size={10} />, id: 2 },
        { icon: <Mic size={15} className="text-blue-500" />, title: "parent Awareness", task: "completed", agenda: "parent getting to know school", date: 'Feb 23, 2026', dicon: <Calendar1Icon />, time: "02:15 AM (50min)", ticon: <Clock size={10} />, id: 3 },
    ]

    return (
        <div>
            <SideVar />

            <section className="px-4 md:px-0 md:ml-80 p-6 md:p-10">
                <h1 className="font-bold text-xl text-black mb-1">PTA Meetings</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <p className="text-xs text-gray-500">Schedule and manage Parent-Teacher meetings</p>
                    <button onClick={() => setCall(true)} className="bg-blue-500 p-1 sm:ml-auto w-full sm:w-45 rounded-xl text-white text-sm h-7">+ Schedule Meeting</button>
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

            {activeContent === history && (
                <div className="mx-4 md:ml-80 text-center w-auto md:w-3/5 h-40 bg-gray-100 shadow-xl flex flex-col items-center justify-center">
                    <File size={70} className="mb-4 p-2" />
                    no Past meetings found
                </div>
            )}

            {activeContent === Upcoming && (
                <div className="mx-4 md:ml-80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coming.map((list) => (
                        <div key={list.id} className="shadow-xl hover:shadow-2xl rounded-xl p-3">
                            <nav className="flex justify-between items-center mb-4">
                                <span className="flex items-center text-sm font-bold gap-1">
                                    <i>{list.icon}</i>{list.title}
                                </span>
                                <nav className="text-xs bg-gray-200 rounded-xl px-2 h-4 text-center">{list.task}</nav>
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

            {call && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 overflow-y-auto px-4 py-8">
                    <div className="bg-gray-100 p-6 rounded-xl font-sans w-full max-w-lg">
                        <h1 className="font-bold text-sm mb-4">Schedule PTA Meeting</h1>

                        <label className="block text-xs font-semibold mb-2">Meeting Title *</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded-xl mb-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g 1st Parent Teacher Conference"
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <label className="block text-xs font-semibold mb-2">Agenda *</label>
                        <textarea
                            className="w-full border border-gray-300 p-2 text-xs rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Meeting Topics And Discussion Points..."
                        />

                        <label className="block text-xs font-semibold mb-2">Meeting Type *</label>
                        <span className="flex items-center text-sm gap-2 mb-4">
                            <button
                                onClick={() => setActive("video")}
                                className={`hover:bg-gray-200 rounded-xl shadow-sm flex justify-center gap-2 p-2 w-1/2 ${active === "video" ? "bg-blue-500 text-white" : "bg-white"}`}
                            >
                                <VideoIcon size={20} />video call
                            </button>
                            <button
                                onClick={() => setActive("audio")}
                                className={`hover:bg-gray-200 rounded-xl shadow-sm flex justify-center gap-2 p-2 w-1/2 ${active === "audio" ? "bg-blue-500 text-white" : "bg-white"}`}
                            >
                                <Mic size={20} />audio call
                            </button>
                        </span>

                        <div className="flex flex-col sm:flex-row gap-2 mb-5">
                            <div className="w-full">
                                <label className="block text-xs font-semibold mb-1">Time *</label>
                                <input type="time" className="w-full border border-gray-300 p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-semibold mb-1">Date *</label>
                                <input type="date" className="w-full border border-gray-300 p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <label className="block text-xs font-semibold mb-2">Duration</label>
                        <select className="focus:ring-1 shadow-xl p-2 bg-gray-200 text-xs focus:ring-blue-500 w-full mb-6 rounded-xl">
                            <option>15 minutes</option>
                            <option>30 minutes</option>
                            <option>45 minutes</option>
                            <option>1 hour</option>
                            <option>2 hours</option>
                        </select>

                        <div className="p-2 text-sm mb-6 shadow-md hover:shadow-xl w-full rounded-xl">
                            <input type="checkbox" className="p-2 text-xs mb-2" /> All Teachers
                            {teacher.map((list) => (
                                <div key={list._id} className="px-6 text-xs text-gray-500">
                                    <input type="checkbox" className="p-2 text-xs" /> {list.fullname}
                                </div>
                            ))}
                        </div>

                        <div className="p-2 text-sm mb-6 shadow-md hover:shadow-xl w-full rounded-xl">
                            <input type="checkbox" className="p-2 text-xs rounded-xl" /> All Parents
                            {student.map((list) => (
                                <div key={list._id} className="px-6 text-xs text-gray-500">
                                    <input type="checkbox" className="p-2 text-xs mb-2" /> {list.parent}
                                </div>
                            ))}
                        </div>

                        <span className="flex items-center justify-end gap-4">
                            <button onClick={() => setCall(false)}>cancel</button>
                            <button className="bg-blue-500 p-2 h-8 rounded-xl text-white text-xs">Schedule Meeting</button>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
export default pta;