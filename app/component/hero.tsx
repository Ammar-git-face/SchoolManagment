"use client";

import { Book, User2, GraduationCap, DollarSignIcon, Search, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Pie, PieChart, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import Sidebar from "./admin/sidevar";

const hero = () => {

    const data = [
        { name: "paid", value: 60, id: 1 },
        { name: "pending", value: 30, id: 1 },
        { name: "overdue", value: 10, id: 1 }
    ];
    const [datas, setData] = useState([]);


    const [search, setSearch] = useState("")
    const students = [
        { id: 1, name: "Alex Smith", amount: "$1000", term: "1st term", pending: "paid" },
        { id: 2, name: "Emma Davis", amount: "$300", term: "1st term", pending: "paid" },
        { id: 3, name: "Alex Smith", amount: "$2999", term: "1st term", pending: "paid" },
        { id: 4, name: "Emma Davis", amount: "$653", term: "1st term", pending: "paid" }
    ];

    const sections = [
        { name: "Nur Section", value: 30, id: 1 },
        { name: "Pri Section", value: 70, id: 2 },
        { name: "sec Section", value: 50, id: 3 },
        { name: "Teachers performance", value: 120, id: 4 },
        { name: "Parent performance", value: 80, id: 5 }
    ];

    const filtered = students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );
    const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        feesCollected: 0,
        feesPending: 0
    });


    const first = [
        {
            title: "Total students",
            heading: stats.students,
            content: "Live from database",
            icon: (
                <GraduationCap
                    size={35}
                    className="p-1.5 text-blue-500 bg-blue-200 rounded-xl"
                />
            ),
            id: 1
        },
        {
            title: "Total teachers",
            heading: stats.teachers,
            content: "Live from database",
            icon: (
                <User2
                    size={34}
                    className="p-1.5 text-green-500 bg-green-200 rounded-xl"
                />
            ),
            id: 2
        },
        {
            title: "Total classes",
            heading: stats.classes,
            content: "Live from database",
            icon: (
                <Book
                    size={34}
                    className="p-1.5 text-yellow-500 bg-yellow-200 rounded-xl"
                />
            ),
            id: 3
        },
        {
            title: "Fee collected",
            heading:"₦500,000",
            content:"This Term",
           // heading: `₦${stats.feesCollected.toLocaleString()}`,
           // content: `₦${stats.feesPending.toLocaleString()} pending`,
            icon: (
                <DollarSignIcon
                    size={35}
                    className="p-1.5 text-gray-500 bg-gray-200 rounded-xl"
                />
            ),
            id: 4
        }
    ];


    const getStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/stats/dashboard-stats')
            const result = await res.json()
            setStats(result)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        getStats()
    })



    return (
        <div>
            {/* Top banner */}
            < Sidebar />
            <div className="fixed top-1 left-0 right-0 md:ml-64 font-sans h-22 border-gray-300 px-4 py-3 bg-gray-200 z-10">
                <h1 className="text-black font-semibold">WELCOME BACK Mr, Ammar</h1>
                <p className="text-sm text-gray-400">Here is what is going on in your school</p>
            </div>

            {/* hero cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:ml-64 pt-28 pb-6">
                {first.map((list) => (
                    <div key={list.id} className="p-3.5 shadow-md rounded-md h-30 space-x-2 bg-gray-100">
                        <p className="flex items-center justify-between text-xs text-gray-500 mb-1">{list.title} <span>{list.icon}</span></p>
                        <h1 className="text-xl font-bold font-sans mb-1">{list.heading}</h1>
                        <p className="text-sm text-gray-400">{list.content}</p>
                    </div>
                ))}
            </div>

            <div className="px-4 md:ml-64">

                {/* Charts */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <section className="shadow-md w-full lg:w-1/2">
                        <div className="p-4 rounded-md">
                            <p className="text-xs text-gray-500 mb-2">Classes Distribution</p>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sections}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    <section className="shadow-md w-full lg:w-1/2 flex flex-col items-center justify-center p-4">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    isAnimationActive
                                >
                                    {data.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <nav className="flex items-center gap-4 flex-wrap justify-center mb-5">
                            <div className="flex items-center gap-1"><i className="bg-blue-500 w-3 h-3 rounded-xl"></i><ul className="text-sm">paid:60</ul></div>
                            <div className="flex items-center gap-1"><i className="bg-green-500 w-3 h-3 rounded-xl"></i><ul className="text-sm">pending:30</ul></div>
                            <div className="flex items-center gap-1"><i className="bg-yellow-500 w-3 h-3 rounded-xl"></i><ul className="text-sm">Overdue:10</ul></div>
                        </nav>
                    </section>
                </div>

                {/* Recent payments + Quick stats */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="w-full lg:w-1/2 rounded-md shadow-md overflow-x-auto">
                        <h1 className="p-5 font-bold text-md">Recent fee Payments</h1>
                        <table className="rounded-xl p-2 w-full min-w-[400px]">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-6 py-3 text-left text-xs text-gray-600">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">term</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((student) => (
                                    <tr key={student.id} className="border-t text-xs border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <span className="text-xs">{student.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-700">{student.amount}</td>
                                        <td className="px-6 py-4 text-xs text-gray-700">{student.term}</td>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <button className="text-gray-600 hover:text-blue-500 bg-blue-200 border-s rounded-md p-1 text-xs">
                                                {student.pending}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="shadow-xl w-full lg:w-1/2 h-85">
                        <h1 className="p-5 font-bold text-md">Quick Stats</h1>
                        <p className="text-center">no recent data</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default hero;