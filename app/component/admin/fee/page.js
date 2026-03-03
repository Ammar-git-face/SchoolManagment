"use client"
import { DollarSign, Search, Download } from "lucide-react";
import { useState, useEffect } from "react"
import Sidebar from "../sidevar";

const fee = () => {
    const fees = [
        { Total: "Total Collected ", amount: '$1000', icon: <DollarSign size={40} className="shadow-md p-2 rounded-md text-green-400 bg-green-100" />, id: 1 },
        { Total: "Pending Payment", amount: '$1000', icon: <DollarSign size={40} className="shadow-md p-2 rounded-md text-blue-400 bg-blue-100" />, id: 2 },
        { Total: "Overdue Payment", amount: '$1000', icon: <DollarSign size={40} className="shadow-md p-2 rounded-md text-red-400 bg-red-100" />, id: 3 }
    ]
    const [teacher, setTeacher] = useState({fullname:0, salart:0, })
    const student = [
        { name: teacher.fullname, money: "$100", term: "first", due: "20/02/26", status: "paid", action: "print", id: 1 },
        { name: 'alex', money: "$100", term: "first", due: "24/02/10", status: "Due.", action: "print", id: 2 },
        { name: 'alex', money: "$100", term: "first", due: "24/02/10", status: "Due", action: "print", id: 3 },
        { name: 'alex', money: "$100", term: "first", due: "24/02/10", status: "paid", action: "print", id: 4 }
    ]
   

    const getData = async () => {
        try {
            const res = await fetch('http://localhost:5000/teacher/getTeachers')
            const result = await res.json()
            setTeacher(result)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        getData()
    }, [])

    return (
        <div className="overflow-x-hidden">
            <Sidebar />
            <nav>
                {/* top cards */}
                <div className="ml-0 md:ml-80 mt-10 md:mt-20 flex flex-col sm:flex-row items-center gap-4 md:gap-8 mb-10 px-4">
                    {fees.map((list, index) => (
                        <nav key={list.id} className={`shadow-xl w-full sm:w-68 h-25 p-2 rounded-xl hover:shadow-2xl ${index === 0 ? 'bg-green-50' : index === 1 ? 'bg-blue-50' : 'bg-red-50'}`}>
                            <p className="text-gray-400 text-xs mb-2">{list.Total}</p>
                            <nav className="flex justify-between items-center text-black text-2xl font-semibold">
                                <h1>{list.amount}</h1>
                                {list.icon}
                            </nav>
                        </nav>
                    ))}
                </div>

                {/* Search */}
                <div className="relative px-4 md:ml-80 max-w-sm mb-4">
                    <Search size={15} className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-6 py-2 border rounded-lg focus:outline-none focus:ring-1 h-8 text-sm focus:ring-blue-500"
                    />
                </div>

                {/* Table */}
                <div className="px-4 md:ml-80 overflow-x-auto">
                    <table className="shadow-xl w-full min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Term</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {student.map((b) => (
                                <tr key={b.id} className="text-xs border-gray-200 border-t hover:bg-gray-100">
                                    <td className="px-4 py-3 text-xs text-gray-700">{b.name}</td>
                                    <td className="px-4 py-3 text-xs text-gray-700">{b.money}</td>
                                    <td className="px-4 py-3 text-xs text-gray-700">{b.term}</td>
                                    <td className="px-4 py-3 text-xs text-gray-700">{b.due}</td>
                                    <td className="px-4 py-3 text-xs text-gray-700">{b.status}</td>
                                    <td className="px-4 py-3 text-xs flex items-center gap-2 text-gray-700"><Download size={15} />{b.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </nav>
        </div>
    );
}

export default fee;