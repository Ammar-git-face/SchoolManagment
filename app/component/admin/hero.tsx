"use client";

import { Book, User2, GraduationCap, DollarSignIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Pie, PieChart, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import Sidebar from "./sidevar";
import { authFetch } from "./utils/api"

const COLORS = ["#4F46E5", "#F59E0B", "#EF4444", "#22C55E"];

const hero = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        feesCollected: 0,
        feesPending: 0,
        pieData: [],
        barData: [],
        recentPayments: []
    })
    const [loading, setLoading] = useState(true)

    const getStats = async () => {
        try {
            const res = await authFetch('http://localhost:5000/stats/dashboard-stats')
            const result = await res.json()
            // ✅ always merge with safe defaults so no field is ever undefined
            setStats({
                totalStudents: result.totalStudents || 0,
                totalTeachers: result.totalTeachers || 0,
                totalClasses: result.totalClasses || 0,
                feesCollected: result.feesCollected || 0,
                feesPending: result.feesPending || 0,
                pieData: Array.isArray(result.pieData) ? result.pieData : [],
                barData: Array.isArray(result.barData) ? result.barData : [],
                recentPayments: Array.isArray(result.recentPayments) ? result.recentPayments : []
            })
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { getStats() }, [])

    const cards = [
        {
            title: "Total Students",
            heading: loading ? "..." : stats.totalStudents,
            content: "Live from database",
            icon: <GraduationCap size={35} className="p-1.5 text-blue-500 bg-blue-200 rounded-xl" />
        },
        {
            title: "Total Teachers",
            heading: loading ? "..." : stats.totalTeachers,
            content: "Live from database",
            icon: <User2 size={34} className="p-1.5 text-green-500 bg-green-200 rounded-xl" />
        },
        {
            title: "Total Classes",
            heading: loading ? "..." : stats.totalClasses,
            content: "Live from database",
            icon: <Book size={34} className="p-1.5 text-yellow-500 bg-yellow-200 rounded-xl" />
        },
        {
            title: "Fees Collected",
            heading: loading ? "..." : `₦${stats.feesCollected.toLocaleString()}`,
            content: `₦${stats.feesPending.toLocaleString()} pending`,
            icon: <DollarSignIcon size={35} className="p-1.5 text-gray-500 bg-gray-200 rounded-xl" />
        }
    ]

    return (
        <div>
            <Sidebar />
            <div className="fixed top-0 left-0 right-0 md:ml-64 font-sans border-gray-300 px-4 py-3  bg-gray-200 z-10">
                <h1 className="text-black font-semibold">WELCOME BACK Mr, Ammar</h1>
                <p className="text-sm text-gray-400">Here is what is going on in your school</p>
            </div>

            {/* Stat Cards */}


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:ml-64 pt-20 pb-6">
                {cards.map((card, i) => (
                    <div key={i} className="p-4.5 shadow-md rounded-md h-30 space-x-2 bg-gray-100">
                        <p className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            {card.title} <span>{card.icon}</span>
                        </p>
                        <h1 className="text-xl font-bold font-sans mb-1">{card.heading}</h1>
                        <p className="text-sm text-gray-400">{card.content}</p>
                    </div>
                ))}
            </div>

            <div className="px-4 md:ml-64">

                {/* Charts */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">

                    {/* Bar Chart */}
                    <section className="shadow-md w-full lg:w-1/2 rounded-md">
                        <div className="p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Students per Class</p>
                            <p className="text-xs text-gray-400 mb-3">Live distribution across all classes</p>
                            <div className="h-64 w-full">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-400">Loading...</div>
                                ) : stats.barData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-400">No class data yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.barData}>
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Students" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Pie Chart */}
                    <section className="shadow-md w-full lg:w-1/2 rounded-md flex flex-col items-center justify-center p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1 self-start">Fee Payment Status</p>
                        <p className="text-xs text-gray-400 mb-3 self-start">Paid vs pending breakdown</p>
                        {loading ? (
                            <div className="h-48 flex items-center justify-center text-xs text-gray-400">Loading...</div>
                        ) : stats.pieData.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-xs text-gray-400">No fee data yet</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={stats.pieData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            isAnimationActive
                                        >
                                            {stats.pieData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <nav className="flex items-center gap-4 flex-wrap justify-center mt-2">
                                    {stats.pieData.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1">
                                            <i className="w-3 h-3 rounded-full inline-block"
                                                style={{ backgroundColor: COLORS[i % COLORS.length] }}></i>
                                            <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                                        </div>
                                    ))}
                                </nav>
                            </>
                        )}
                    </section>
                </div>

                {/* Recent Payments + Quick Stats */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">

                    {/* Recent Fee Payments */}
                    <div className="w-full lg:w-1/2 rounded-md shadow-md overflow-x-auto">
                        <h1 className="p-5 font-bold text-md">Recent Fee Payments</h1>
                        <table className="rounded-xl p-2 w-full min-w-[400px]">
                            <thead>
                                <tr className="bg-gray-200">
                                    {["Student", "Amount", "Term", "Description", "Status"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-6">Loading...</td></tr>
                                ) : stats.recentPayments.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-6">No payments yet</td></tr>
                                ) : stats.recentPayments.map((payment) => (
                                    <tr key={payment._id} className="border-t text-xs border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-700">{payment.studentName}</td>
                                        <td className="px-4 py-3 text-gray-700">₦{(payment.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500">{payment.term}</td>
                                        <td className="px-4 py-3 text-gray-500">{payment.description}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">Paid</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Quick Stats */}
                    <div className="shadow-xl w-full lg:w-1/2 rounded-md p-5">
                        <h1 className="font-bold text-md mb-4">Quick Stats</h1>
                        {loading ? (
                            <p className="text-xs text-gray-400">Loading...</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {[
                                    { label: "Total Fees Collected", value: `₦${stats.feesCollected.toLocaleString()}`, color: "bg-green-100 text-green-700" },
                                    { label: "Total Fees Pending", value: `₦${stats.feesPending.toLocaleString()}`, color: "bg-yellow-100 text-yellow-700" },
                                    { label: "Total Students", value: stats.totalStudents, color: "bg-blue-100 text-blue-700" },
                                    { label: "Total Teachers", value: stats.totalTeachers, color: "bg-purple-100 text-purple-700" },
                                    { label: "Total Classes", value: stats.totalClasses, color: "bg-orange-100 text-orange-700" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                        <span className="text-xs text-gray-600">{item.label}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.color}`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default hero;