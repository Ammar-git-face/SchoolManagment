"use client"
import { DollarSign, Search, Download, Users, BookOpen, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import Sidebar from "../sidevar"
import { authFetch, API_BASE } from "../utils/api"
import { API } from "../../../config/api"

const downloadReceipt = (record, type) => {
    const isTeacher = type === "teacher"
    const lines = [
        "========================================",
        "           PAYMENT RECEIPT              ",
        "========================================",
        `Date:        ${new Date().toLocaleDateString("en-GB")}`,
        `Type:        ${isTeacher ? "Salary Payment" : "Fee Payment"}`,
        "----------------------------------------",
        `Name:        ${isTeacher ? record.teacherName : record.studentName}`,
        isTeacher
            ? `Month:       ${record.month} ${record.year}`
            : `Class:       ${record.studentClass || "—"}`,
        isTeacher
            ? `Basic Salary: ₦${Number(record.basicSalary || 0).toLocaleString()}`
            : `Term:        ${record.term}`,
        isTeacher
            ? `Net Pay:     ₦${Number(record.netPay || 0).toLocaleString()}`
            : `Amount:      ₦${Number(record.amount || 0).toLocaleString()}`,
        `Status:      ${record.status?.toUpperCase()}`,
        record.paidAt
            ? `Paid On:     ${new Date(record.paidAt).toLocaleDateString("en-GB")}`
            : "",
        record.flwRef
            ? `Reference:   ${record.flwRef}`
            : record.txRef
            ? `TX Ref:      ${record.txRef}`
            : "",
        "----------------------------------------",
        "  Thank you. Keep this receipt safe.    ",
        "========================================",
    ].filter(Boolean).join("\n")

    const blob = new Blob([lines], { type: "text/plain" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `receipt-${(isTeacher ? record.teacherName : record.studentName)?.replace(/\s+/g, "-")}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
}

const Badge = ({ status }) => {
    const cfg = {
        paid:    "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        unpaid:  "bg-red-100 text-red-700",
    }
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${cfg[status] || cfg.pending}`}>
            {status}
        </span>
    )
}

export default function AdminFees() {
    const [tab,          setTab]          = useState("students")
    const [fees,         setFees]         = useState([])
    const [payrolls,     setPayrolls]     = useState([])
    const [loading,      setLoading]      = useState(true)
    const [search,       setSearch]       = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    // FIX: added sidebarOpen state for mobile hamburger
    const [sidebarOpen,  setSidebarOpen]  = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [fRes, pRes] = await Promise.all([
                    authFetch(`${API_BASE}/fees/all`),
                    authFetch(`${API_BASE}/payroll/all`),
                ])
                if (fRes.ok) setFees(await fRes.json())
                if (pRes.ok) { const pd = await pRes.json(); setPayrolls(Array.isArray(pd) ? pd : (pd.records || [])) }
            } catch (err) {
                console.log("Fee load error:", err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const feeCollected = fees.filter(f => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0)
    const feePending   = fees.filter(f => f.status !== "paid").reduce((s, f) => s + (f.amount || 0), 0)
    const salaryPaid   = payrolls.filter(p => p.status === "paid").reduce((s, p) => s + (p.netPay || 0), 0)
    const salaryPend   = payrolls.filter(p => p.status !== "paid").reduce((s, p) => s + (p.netPay || 0), 0)

    const cards = tab === "students"
        ? [
            { label: "Total Collected",  amount: feeCollected, color: "bg-green-50",  icon: "text-green-500 bg-green-100" },
            { label: "Pending Payment",  amount: feePending,   color: "bg-yellow-50", icon: "text-yellow-500 bg-yellow-100" },
            { label: "Total Records",    amount: fees.length,  color: "bg-blue-50",   icon: "text-blue-200 bg-blue-100",  isCount: true },
        ]
        : [
            { label: "Salary Paid",    amount: salaryPaid,       color: "bg-green-50",  icon: "text-green-500 bg-green-100" },
            { label: "Salary Pending", amount: salaryPend,       color: "bg-yellow-50", icon: "text-yellow-500 bg-yellow-100" },
            { label: "Total Records",  amount: payrolls.length,  color: "bg-blue-50",   icon: "text-blue-200 bg-blue-100", isCount: true },
        ]

    const activeData = tab === "students" ? fees : payrolls

    const filtered = activeData.filter(r => {
        const name   = tab === "students" ? r.studentName : r.teacherName
        const matchS = name?.toLowerCase().includes(search.toLowerCase())
        const matchF = statusFilter === "all" || r.status === statusFilter
        return matchS && matchF
    })

    const headers = tab === "students"
        ? ["Name", "Class", "Amount", "Term", "Session", "Status", "Paid On", "Receipt"]
        : ["Name", "Month", "Year", "Basic Salary", "Net Pay", "Status", "Paid On", "Receipt"]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* FIX: pass isOpen and onClose props so sidebar works on mobile */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* FIX: mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            {/* Header — FIX: added mobile hamburger button */}
            <div className="fixed top-0 left-0 right-0 md:ml-64 bg-white border-b border-gray-200 px-4 py-3 z-10 shadow-sm flex items-center gap-3">
                {/* FIX: hamburger only visible on mobile */}
                <button onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-black flex-shrink-0">
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="text-sm font-semibold text-black">Finance Overview</h1>
                    <p className="text-xs text-gray-400">Student fees & teacher payroll</p>
                </div>
            </div>

            <div className="md:ml-64 pt-20 px-4 pb-10">

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    {[
                        { key: "students", label: "Student Fees",    icon: <Users size={14} /> },
                        { key: "teachers", label: "Teacher Payroll", icon: <BookOpen size={14} /> },
                    ].map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); setStatusFilter("all") }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition
                                ${tab === t.key
                                    ? "bg-blue-200 text-black shadow-sm"
                                    : "bg-white text-black border border-gray-200 hover:bg-gray-50"}`}>
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {cards.map((c, i) => (
                        <div key={i} className={`rounded-xl p-4 shadow-sm border border-gray-100 ${c.color}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-black font-medium">{c.label}</p>
                                <div className={`p-2 rounded-lg ${c.icon}`}>
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-black">
                                {c.isCount ? c.amount : `₦${Number(c.amount).toLocaleString()}`}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={`Search ${tab === "students" ? "students" : "teachers"}...`}
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs text-black focus:outline-none text-blackq focus:ring-2 focus:ring-blue-400 bg-white" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {headers.map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs text-black font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={headers.length} className="text-center py-10 text-xs text-gray-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={headers.length} className="text-center py-10 text-xs text-gray-400">No records found</td></tr>
                            ) : tab === "students" ? (
                                filtered.map((f, i) => (
                                    <tr key={f._id || i} className="border-t border-gray-100 hover:bg-gray-50 text-xs">
                                        <td className="px-4 py-3 font-medium text-black">{f.studentName || "—"}</td>
                                        <td className="px-4 py-3 text-black">{f.studentClass || "—"}</td>
                                        <td className="px-4 py-3 text-black font-medium">₦{Number(f.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-black">{f.term || "—"}</td>
                                        <td className="px-4 py-3 text-black">{f.session || "—"}</td>
                                        <td className="px-4 py-3"><Badge status={f.status} /></td>
                                        <td className="px-4 py-3 text-black">
                                            {f.paidAt ? new Date(f.paidAt).toLocaleDateString("en-GB") : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => downloadReceipt(f, "student")}
                                                disabled={f.status !== "paid"}
                                                className="flex items-center gap-1 text-blue-200 hover:text-blue-200 disabled:text-gray-300 disabled:cursor-not-allowed transition">
                                                <Download size={13} />
                                                <span>Receipt</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filtered.map((p, i) => (
                                    <tr key={p._id || i} className="border-t border-gray-100 hover:bg-gray-50 text-xs">
                                        <td className="px-4 py-3 font-medium text-black">{p.teacherName || "—"}</td>
                                        <td className="px-4 py-3 text-black">{p.month || "—"}</td>
                                        <td className="px-4 py-3 text-black">{p.year || "—"}</td>
                                        <td className="px-4 py-3 text-black">₦{Number(p.basicSalary || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-black font-medium">₦{Number(p.netPay || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3"><Badge status={p.status} /></td>
                                        <td className="px-4 py-3 text-black">
                                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GB") : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => downloadReceipt(p, "teacher")}
                                                disabled={p.status !== "paid"}
                                                className="flex items-center gap-1 text-blue-200 hover:text-blue-200 disabled:text-gray-300 disabled:cursor-not-allowed transition">
                                                <Download size={13} />
                                                <span>Receipt</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <p className="text-xs text-gray-400 mt-3">
                        Showing {filtered.length} of {activeData.length} records
                    </p>
                )}
            </div>
        </div>
    )
}