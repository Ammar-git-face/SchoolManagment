"use client"
import { useEffect, useState } from "react";
import Sidebar from "../sidevar";

const message = () => {

    const [parent, setParent] = useState([])
    const [teacher, setTeacher] = useState([])

    const getTeacher = async () => {
        try {
            const res = await fetch('http://localhost:5000/teacher/getTeachers')
            const result = await res.json();
            setTeacher(result)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        getTeacher()
    }, [])

    const getParent = async () => {
        const res = await fetch("http://localhost:5000/student/getStudent")
        const data = await res.json()
        setParent(data)
    }
    useEffect(() => {
        getParent()
    }, [])

    return (
        <div className="min-h-screen">
            <div>< Sidebar /></div>

            <div className="ml-0 md:ml-80 mt-10 px-4 md:px-6">
                <h1 className="text-md font-bold">Messages</h1>
                <p className="text-xs text-gray-500 mb-6">Communicate with teachers and parents</p>

                <div className="shadow-xl h-[500px] w-full md:w-2/5 bg-gray-100 rounded-xl overflow-y-auto scroll-smooth">
                    <h2 className="font-bold text-black p-3">Conversation</h2>

                    {teacher.map((t) => (
                        <div key={t._id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg mx-2">
                            <h2 className="text-sm">{t.fullname}</h2>
                            <button className="bg-blue-200 text-xs h-5 w-17 rounded-xl">teacher</button>
                        </div>
                    ))}

                    {parent.map((t) => (
                        <div key={t._id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg mx-2">
                            <h2 className="text-sm">{t.parent}</h2>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default message;