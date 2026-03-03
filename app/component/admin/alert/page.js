"use client"
import { Calendar, User2Icon, Trash2, Pencil, User2 } from "lucide-react";
import { useState, useEffect } from "react";

import Sidebar from "../sidevar";

const alert = () => {
    const [create, setCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [to, setTo] = useState("All");
    const [display, setDisplay] = useState([]);
    const [edit, setEdit] = useState(false)
    const [editData, setEditData] = useState({ title: "", message: "", to: "" })
    const [editId, setEditId] = useState(null)


    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/alert/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                getData() // re-fetch to update the list
            }
        } catch (err) {
            console.log(err)
        }
    }

    const Send = async (e) => {
        e.preventDefault()
        console.log("Sending:", { title, message, to }) // 👈 check values aren't empty
        try {
            const res = await fetch('http://localhost:5000/alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message, to })
            })
            const result = await res.json()
            console.log("Response:", result) // 👈 see what backend returns

            if (res.ok) {
                setCreate(false)
                getData()  // ← add this
            } else {
                throw new Error(result.error || 'invalid')
            }
        } catch (err) {
            console.log(err)
        }
    }
    const getData = async () => {

        try {
            const res = await fetch("http://localhost:5000/alert/get")
            const data = await res.json()
            console.log(data)
            setDisplay(data)

        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div>
            <Sidebar />
            <div className="p-4 md:p-6 ml-0 md:ml-70">
                <span className="">
                    <h1 className="text-xl font-bold">Create Announcement</h1>

                    <nav className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <p className="text-gray-500 text-xs">Send announcements to teachers and parents</p>
                        <button className="bg-blue-500 h-7 w-full sm:w-50 text-xs text-white rounded-xl" onClick={() => setCreate(true)}>+ Create Announcement</button>
                    </nav>
                </span>
                <div>

                    <div>
                        {
                            display.map((list) => (
                                <div key={list._id} className=" p-5 w-full rounded-md shadow">
                                    <h1 className=" text-black font-bold font-xl mb-2 flex justify-between">{list.title}   <button className="text-red-500" onClick={() => handleDelete(list._id)}>
                                        <Trash2 size={15} />
                                    </button>
                                    </h1>
                                    <span className="flex mb-3 items-center gap-2 text-xs font-gray-500">< Calendar size={15} />
                                        <p>{new Date(list.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</p>
                                        <p><User2 size={13} /></p> <span className="text-xs bg-blue-200 rounded-xl  w-15 text-center text-blue-400"> {list.to}</span></span>
                                    <p className="text-gray-500 text-xs mb-3 ">{list.message}</p>
                                    <p className="text-xs text-gray-500 p-3">-School headmaster</p>

                                </div>
                            ))
                        }
                    </div>

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
                                    onChange={(e) => setTo(e.target.value)}
                                >
                                    <option>All</option>
                                    <option>Parent</option>
                                    <option>Teachers</option>
                                </select>
                                <span className="flex items-center justify-end gap-4">
                                    <button onClick={() => setCreate(false)}>cancel</button>
                                    <button onClick={Send} className="bg-blue-500 p-2 h-8 rounded-xl text-white text-xs">Schedule Meeting</button>
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