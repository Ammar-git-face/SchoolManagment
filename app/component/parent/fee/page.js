"use client"
import { CreditCard, CheckCircle, Clock, Download, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidebar"
import { useParent, parentFetch } from "../utils/useParent"
import { API } from "../../../config/api"

const ParentFeePayments = () => {
    const { user, children } = useParent()
    const [fees,          setFees]          = useState([])
    const [selectedChild, setSelectedChild] = useState("all")
    const [showModal,     setShowModal]     = useState(false)
    const [loading,       setLoading]       = useState(false)
    const [msg,           setMsg]           = useState(null)
    const [form, setForm] = useState({
        childId: "", childName: "", amount: "", term: "Term 1", session: "", description: ""
    })

    const fetchFees = async () => {
        if (!user?.id) return
        try {
            const res  = await parentFetch(`${API}/fees/parent/${user.id}`)
            const data = await res.json()
            setFees(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
    }

    useEffect(() => { if (user?.id) fetchFees() }, [user])

    const totalFees    = fees.reduce((a, f) => a + (f.amount || 0), 0)
    const totalPaid    = fees.filter(f => f.status === "paid").reduce((a, f) => a + (f.amount || 0), 0)
    const outstanding  = totalFees - totalPaid
    const filteredFees = selectedChild === "all" ? fees : fees.filter(f => f.studentId === selectedChild)

    const handlePayNow = async () => {
        if (!form.childId || !form.amount || !form.description)
            return setMsg({ type: "error", text: "Please fill all fields" })
        setLoading(true); setMsg(null)
        try {
            const feeRes = await parentFetch(`${API}/fees/create`, {
                method: "POST",
                body: JSON.stringify({
                    parentId:    user.id,
                    parentName:  user.name,
                    studentId:   form.childId,
                    studentName: form.childName,
                    amount:      Number(form.amount),
                    term:        form.term,
                    session:     form.session,
                    description: form.description,
                    schoolCode:  user.schoolCode,   // ✅ required by the Fee model
                })
            })
            const feeData = await feeRes.json()
            if (!feeRes.ok) return setMsg({ type: "error", text: feeData.error })

            const payRes = await parentFetch(`${API}/fees/initialize`, {
                method: "POST",
                body: JSON.stringify({
                    feeId:       feeData._id,
                    amount:      Number(form.amount),
                    email:       user.email || `${user.id}@parent.edu`,
                    name:        user.name,
                    description: form.description
                })
            })
            const payData = await payRes.json()
            if (!payRes.ok) return setMsg({ type: "error", text: payData.error })

            if (window.FlutterwaveCheckout) {
                window.FlutterwaveCheckout({
                    public_key:      payData.publicKey,
                    tx_ref:          payData.txRef,
                    amount:          Number(form.amount),
                    currency:        "NGN",
                    payment_options: "card,ussd,banktransfer",
                    customer:        { email: user.email, name: user.name },
                    customizations:  { title: "School Fee Payment", description: form.description },
                    callback: async (response) => {
                        if (response.status === "successful") {
                            await parentFetch(`${API}/fees/verify`, {
                                method: "POST",
                                body: JSON.stringify({ txRef: response.tx_ref, feeId: feeData._id })
                            })
                            setMsg({ type: "success", text: "Payment successful!" })
                            setShowModal(false)
                            setForm({ childId: "", childName: "", amount: "", term: "Term 1", session: "", description: "" })
                            fetchFees()
                        }
                    },
                    onclose: () => setLoading(false)
                })
            }
        } catch { setMsg({ type: "error", text: "Something went wrong" }) }
        finally { setLoading(false) }
    }

    const handleDownloadReceipt = async (fee) => {
        try {
            const res  = await parentFetch(`${API}/fees/receipt/${fee._id}`)
            const blob = await res.blob()
            const url  = URL.createObjectURL(blob)
            const a    = document.createElement("a")
            a.href = url; a.download = `receipt-${fee._id}.pdf`; a.click()
        } catch (err) { console.log(err) }
    }

    return (
        <>
            <script src="https://checkout.flutterwave.com/v3.js" async />
            <div>
                <Sidebar />
                <div className="md:ml-64 pt-14 md:pt-0 px-6 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Fee Payments</h1>
                            <p className="text-xs text-gray-400 mt-1">View and pay your children's school fees</p>
                        </div>
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-blue-500 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-600">
                            <Plus size={14} /> Make Payment
                        </button>
                    </div>

                    {msg && (
                        <div className={`text-xs p-3 rounded-xl mb-5 border ${msg.type === "success"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"}`}>{msg.text}</div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Total Fees",  value: totalFees,   bg: "bg-blue-50   border-blue-100"   },
                            { label: "Total Paid",  value: totalPaid,   bg: "bg-green-50  border-green-100"  },
                            { label: "Outstanding", value: outstanding, bg: "bg-yellow-50 border-yellow-100" }
                        ].map(s => (
                            <div key={s.label} className={`${s.bg} border rounded-2xl p-5`}>
                                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-800">₦{s.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    {/* Child filter tabs */}
                    <div className="flex gap-2 mb-5 flex-wrap">
                        <button onClick={() => setSelectedChild("all")}
                            className={`text-xs px-4 py-2 rounded-xl border transition-all
                                ${selectedChild === "all" ? "bg-blue-500 text-white border-blue-500" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                            All Children
                        </button>
                        {children.map(c => (
                            <button key={c._id} onClick={() => setSelectedChild(c._id)}
                                className={`text-xs px-4 py-2 rounded-xl border transition-all
                                    ${selectedChild === c._id ? "bg-blue-500 text-white border-blue-500" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                                {c.fullname}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Child","Class","Term","Description","Amount","Status","Date","Receipt"].map(h =>
                                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFees.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center text-xs text-gray-400 py-8">No fee records found</td></tr>
                                ) : filteredFees.map(fee => (
                                    <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-xs font-medium text-gray-700">{fee.studentName}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{fee.studentClass}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{fee.term}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{fee.description}</td>
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-700">₦{fee.amount?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit
                                                ${fee.status === "paid"
                                                    ? "text-green-600 bg-green-50 border border-green-200"
                                                    : "text-yellow-600 bg-yellow-50 border border-yellow-200"}`}>
                                                {fee.status === "paid" ? <CheckCircle size={11} /> : <Clock size={11} />}
                                                {fee.status === "paid" ? "Paid" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">
                                            {fee.createdAt ? new Date(fee.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {fee.status === "paid" && (
                                                <button onClick={() => handleDownloadReceipt(fee)} className="text-blue-500 hover:text-blue-600">
                                                    <Download size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-sm font-bold text-gray-800">Make Fee Payment</h2>
                            <button onClick={() => setShowModal(false)}><X size={16} className="text-gray-400" /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Select Child</p>
                                <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.childId}
                                    onChange={e => {
                                        const child = children.find(c => c._id === e.target.value)
                                        setForm({ ...form, childId: e.target.value, childName: child?.fullname || "" })
                                    }}>
                                    <option value="">— Select child —</option>
                                    {children.map(c => <option key={c._id} value={c._id}>{c.fullname} ({c.studentClass})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Term</p>
                                    <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                                        value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}>
                                        <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Session</p>
                                    <input type="text" placeholder="e.g 2024/2025"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                                        value={form.session} onChange={e => setForm({ ...form, session: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Description</p>
                                <input type="text" placeholder="e.g School fees, Uniform, Books"
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Amount (₦)</p>
                                <input type="number" placeholder="e.g 50000"
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                            </div>
                            {msg && (
                                <div className={`text-xs p-3 rounded-xl border ${msg.type === "success"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-red-50 text-red-600 border-red-200"}`}>{msg.text}</div>
                            )}
                            <button onClick={handlePayNow} disabled={loading}
                                className="bg-blue-500 text-white text-sm py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">
                                <CreditCard size={16} />
                                {loading ? "Processing..." : `Pay ₦${Number(form.amount || 0).toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ParentFeePayments