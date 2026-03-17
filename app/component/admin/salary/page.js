"use client"
import { DollarSign, Send, X, Loader } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidevar"
import { authFetch } from "../utils/api"
import { API } from "../../../config/api"
const AdminSalaries = () => {
    const [teachers, setTeachers] = useState([])
    const [banks, setBanks] = useState([])
    const [paying, setPaying] = useState(null)
    const [msg, setMsg] = useState(null)
    const [confirmTeacher, setConfirmTeacher] = useState(null)

    const getTeachers = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await authFetch(`${API}/teacher/getTeachers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            // match whatever key your API returns e.g. data.teachers / data.data
            setTeachers(Array.isArray(data) ? data : data.teachers || [])
        } catch (err) { console.log(err) }
    }

    const getBanks = async () => {
        try {
            const res = await authFetch(`${API}/fees/banks`)
            const data = await res.json()
            setBanks(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
    }

    useEffect(() => {
        getTeachers()
        getBanks()
    }, [])

    const handlePaySalary = async (teacher) => {
        if (!teacher.accountNumber || !teacher.bankCode) {
            return setMsg({ type: "error", text: `${teacher.fullname} has no bank details saved` })
        }
        setPaying(teacher._id)
        setMsg(null)
        try {
            const res = await authFetch(`${API}/fees/pay-salary`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    teacherId: teacher._id,
                    teacherName: teacher.fullname,
                    accountNumber: teacher.accountNumber,
                    bankCode: teacher.bankCode,
                    amount: teacher.salary,
                    narration: `Monthly salary - ${teacher.fullname}`
                })
            })
            const data = await res.json()
            if (!res.ok) return setMsg({ type: "error", text: data.error })
            setMsg({ type: "success", text: `✓ Salary of ₦${teacher.salary?.toLocaleString()} sent to ${teacher.fullname}` })
            getTeachers()
        } catch (err) {
            setMsg({ type: "error", text: "Transfer failed. Check your Flutterwave balance." })
        } finally {
            setPaying(null)
            setConfirmTeacher(null)
        }
    }

    const getBankName = (code) => {
        const bank = banks.find(b => b.code === code)
        return bank?.name || code
    }

    return (
        <div>
            <Sidebar />
            <div className="md:ml-64 px-6 pt-8 pb-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Salary Management</h1>
                    <p className="text-xs text-gray-400 mt-1">Pay teacher salaries directly via Flutterwave</p>
                </div>

                {msg && (
                    <div className={`text-xs p-3 rounded-xl mb-5 border ${msg.type === "success"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"}`}>
                        {msg.text}
                    </div>
                )}

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Teacher", "Subject", "Bank", "Account No", "Salary", "Status", "Action"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.length === 0 ? (
                                <tr><td colSpan={7} className="text-center text-xs text-gray-400 py-8">No teachers found</td></tr>
                            ) : teachers.map(teacher => (
                                <tr key={teacher._id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-xs font-medium text-gray-700">{teacher.fullname}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{teacher.subject}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {teacher.bankCode ? getBankName(teacher.bankCode) : <span className="text-red-400">No bank</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {teacher.accountNumber || <span className="text-red-400">No account</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                                        ₦{teacher.salary?.toLocaleString() || "0"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium
                                            ${teacher.paid === "paid"
                                                ? "text-green-600 bg-green-50 border border-green-200"
                                                : "text-red-500 bg-red-50 border border-red-200"}`}>
                                            {teacher.paid === "paid" ? "Paid" : "Unpaid"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setConfirmTeacher(teacher)}
                                            disabled={paying === teacher._id || teacher.paid === "paid"}
                                            className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-xl hover:bg-green-600 disabled:opacity-40">
                                            {paying === teacher._id
                                                ? <><Loader size={12} className="animate-spin" /> Sending...</>
                                                : <><Send size={12} /> Pay Now</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmTeacher && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-gray-800">Confirm Salary Payment</h2>
                            <button onClick={() => setConfirmTeacher(null)}><X size={16} className="text-gray-400" /></button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Teacher</span>
                                <span className="font-semibold text-gray-700">{confirmTeacher.fullname}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Bank</span>
                                <span className="font-semibold text-gray-700">{getBankName(confirmTeacher.bankCode)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Account</span>
                                <span className="font-semibold text-gray-700">{confirmTeacher.accountNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs border-t border-gray-200 pt-2 mt-2">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-green-600 text-sm">₦{confirmTeacher.salary?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmTeacher(null)}
                                className="flex-1 text-xs text-gray-500 border border-gray-200 py-2 rounded-xl hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handlePaySalary(confirmTeacher)}
                                disabled={paying === confirmTeacher._id}
                                className="flex-1 text-xs bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1">
                                {paying ? <><Loader size={12} className="animate-spin" /> Sending...</> : "Confirm & Pay"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminSalaries