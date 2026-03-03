"use client"
import { DollarSign, CheckCircle, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"

const TeacherSalary = () => {
    const [salaryData, setSalaryData] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    // TODO: replace with logged-in teacher's ID once auth is done
    const TEACHER_ID = "TEACHER_ID_HERE"

    const getSalaryData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/teachers/${TEACHER_ID}`)
            const data = await res.json()
            setSalaryData(data)
        } catch (err) {
            console.log(err)
        }
    }

    const getSalaryHistory = async () => {
        try {
            const res = await fetch(`http://localhost:5000/salary/history/${TEACHER_ID}`)
            const data = await res.json()
            setHistory(data)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getSalaryData()
        getSalaryHistory()
    }, [])

    // calculate total received (YTD) from paid history
    const totalReceived = history
        .filter(h => h.status === 'paid')
        .reduce((acc, h) => acc + Number(h.amount), 0)

    return (
        <div>
            <Sidebar />

            <div className="md:ml-64 px-6 pt-8 pb-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">My Salary</h1>
                    <p className="text-xs text-gray-400 mt-1">View your salary details and payment history</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {/* Monthly Salary */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Monthly Salary</p>
                            <h2 className="text-2xl font-bold text-gray-800">
                                ₦{Number(salaryData?.salary || 0).toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <DollarSign size={22} className="text-blue-400" />
                        </div>
                    </div>

                    {/* Current Month Status */}
                    <div className={`border rounded-2xl p-5 flex items-center justify-between
                        ${salaryData?.paid === 'paid' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Current Month Status</p>
                            <h2 className={`text-2xl font-bold capitalize
                                ${salaryData?.paid === 'paid' ? 'text-gray-800' : 'text-yellow-600'}`}>
                                {salaryData?.paid || "Unpaid"}
                            </h2>
                        </div>
                        <div className={`p-3 rounded-xl ${salaryData?.paid === 'paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <CheckCircle size={22} className={salaryData?.paid === 'paid' ? 'text-green-400' : 'text-yellow-400'} />
                        </div>
                    </div>

                    {/* Total Received YTD */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Total Received (YTD)</p>
                            <h2 className="text-2xl font-bold text-gray-800">
                                ₦{totalReceived.toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-gray-200 p-3 rounded-xl">
                            <Calendar size={22} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Payment History Table */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium">Month</th>
                                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium">Amount</th>
                                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium">Status</th>
                                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium">Paid Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-xs text-gray-400 py-10">Loading...</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-xs text-gray-400 py-10">No payment history found</td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item._id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-700">{item.month}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            ₦{Number(item.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-3 py-1 rounded-full border
                                                ${item.status === 'paid'
                                                    ? 'text-green-600 bg-green-50 border-green-200'
                                                    : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                                }`}>
                                                {item.status === 'paid' ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {item.paidDate
                                                ? new Date(item.paidDate).toLocaleDateString('en-CA')
                                                : '—'
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TeacherSalary