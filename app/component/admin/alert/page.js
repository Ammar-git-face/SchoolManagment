"use client"
import { Calendar, User2Icon, Trash2, Router } from "lucide-react";
import { useState, useEffect } from "react";
import { getDefaultCompilerOptions } from "typescript";
import Sidebar from "../sidevar";

const alert = () => {
    const [create, setCreate] = useState(false)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [aLL, setAll] = useState("")
    const [display, setDisplay] = useState([])

    const announce = [
        { Title: "School Annual Day", icon: <Calendar size={15} />, icon2: <User2Icon size={15} />, Message: "The Annual Day celebration will be held on April 15th... ", Name: "Dr Amar", Action: <Trash2 /> }
    ]

    const Send = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:5000/alert/', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, message, to })
            })
            const result = await res.json()

            if (res) {
                setCreate(false)
            } else {
                throw new Error(result.error || 'invalid')
            }

        } catch (err) {
            console.log(err)
        }
    }

 
    const getData = async () => {
        const res = await fetch("http://localhost:5000/alert")
        const data = await res.json()
        setDisplay(data)
    }

    useEffect(() => {
        getData()
    }, [])
       
    return (
        <div>
            <Sidebar />
            <div className="p-4 md:p-6 ml-0 md:ml-70">
                <span className="">
                    <h1 className="text-xl font-bold">{display.title}</h1>
                    <nav className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <p className="text-gray-500 text-xs">Send announcements to teachers and parents</p>
                        <button className="bg-blue-500 h-7 w-full sm:w-50 text-xs text-white rounded-xl" onClick={() => setCreate(true)}>+ Create Announcement</button>
                    </nav>
                </span>
                <div>
                    <p>{display.message}</p>
                    {create && (
                        <div className="fixed inset-0 w-full bg-black/60 z-50 flex items-start justify-center px-4">
                            <div className="bg-white rounded-xl p-5 w-full max-w-md mt-20">
                                <h1 className="font-bold font-sans text-md">Create Announcement</h1>
                                <p className="text-gray-500 text-xs font-light mb-6">Send an announcement to teachers, parents, or both</p>
                                <p className="text-sm mb-2 text-gray-600">Title</p>
                                <input
                                    type="text"
                                    placeholder="Enter Announcement Title"
                                    id="title"
                                    className="text-xs p-2 focus:outline-none focus:ring-1 mb-2 focus:ring-blue-500 w-full h-10 rounded-xl"
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-sm mb-2 text-gray-600">Message</p>
                                <textarea
                                    placeholder="Enter Announcement Message"
                                    id="message"
                                    className="text-xs p-2 focus:outline-none shadow-sm focus:ring-1 focus:ring-blue-500 w-full h-28 rounded-xl"
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-sm mb-2 text-gray-600">Send To</p>
                                <select className="text-xs p-2 focus:outline-none shadow-sm focus:ring-1 mb-4 focus:ring-blue-500 w-full rounded-xl"
                                    onChange={(e) => setAll(e.target.value)}
                                >
                                    <option>All</option>
                                    <option>Parent</option>
                                    <option>Teachers</option>
                                </select>
                                <span className="flex items-center justify-end gap-4">
                                    <button onClick={() => setCreate(false)}>cancel</button>
                                    <button onCanPlay={() => Send} className="bg-blue-500 p-2 h-8 rounded-xl text-white text-xs">Schedule Meeting</button>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default alert;