"use client"
import { useState, useEffect } from "react"
import {
    School, Users, TrendingUp, Shield, LogOut, Search,
    ToggleLeft, ToggleRight, Trash2, Crown, Bell, RefreshCw,
    ChevronDown, CheckCircle, XCircle, BarChart2
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API } from "../../config/api"

// ─── LOGIN PAGE ───────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true); setError("")
        try {
            const res = await fetch(`${API}/superadmin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Login failed")
            localStorage.setItem("superAdmin", JSON.stringify({ email: data.email, token: data.token }))
            onLogin(data.token)
        } catch {
            setError("Server not reachable")
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-2xl mb-4">
                        <Shield size={28} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Super Admin</h1>
                    <p className="text-xs text-gray-400 mt-1">Platform Management Console</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="superadmin@platform.com"
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-6">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleLogin} disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
                    {loading ? "Signing in..." : "Sign In"}
                </button>
                <p className="text-xs text-gray-400 text-center mt-4">
                    Set credentials in your backend <code>.env</code> file
                </p>
            </div>
        </div>
    )
}

// ─── PLAN BADGE ───────────────────────────────────────────────
const PlanBadge = ({ plan }) => {
    const styles = {
        free:    "bg-gray-100 text-gray-600 border-gray-200",
        basic:   "bg-blue-50 text-blue-600 border-blue-200",
        premium: "bg-yellow-50 text-yellow-600 border-yellow-200"
    }
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${styles[plan] || styles.free}`}>
            {plan === "premium" && <Crown size={10} className="inline mr-0.5 mb-0.5" />}
            {plan}
        </span>
    )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────
const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [schools, setSchools] = useState([])
    const [search, setSearch] = useState("")
    const [filterPlan, setFilterPlan] = useState("all")
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [msg, setMsg] = useState(null)
    const [activeTab, setActiveTab] = useState("dashboard")
    const [newCount, setNewCount] = useState(0)

    const token = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("superAdmin") || "{}")?.token : ""

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/superadmin/stats`, { credentials: "include", headers })
            const data = await res.json()
            setStats(data)
            // count schools registered in last 24h as "new"
            const oneDayAgo = Date.now() - 86400000
            const fresh = (data.recentRegistrations || []).filter(s => new Date(s.createdAt) > oneDayAgo)
            setNewCount(fresh.length)
        } catch (err) { console.log(err) }
    }

    const fetchSchools = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API}/superadmin/schools`, { credentials: "include", headers })
            const data = await res.json()
            setSchools(Array.isArray(data) ? data : [])
        } catch (err) { console.log(err) }
        finally { setLoading(false) }
    }

    useEffect(() => {
        fetchStats()
        fetchSchools()
    }, [])

    const showMsg = (type, text) => {
        setMsg({ type, text })
        setTimeout(() => setMsg(null), 3000)
    }

    const toggleStatus = async (id) => {
        setActionLoading(id + "_toggle")
        try {
            const res = await fetch(`${API}/superadmin/toggle/${id}`, {
                method: "PUT", credentials: "include", headers
            })
            const data = await res.json()
            if (!res.ok) return showMsg("error", data.error)
            setSchools(prev => prev.map(s => s._id?.toString() === id.toString() ? { ...s, isActive: data.isActive } : s))
            showMsg("success", data.message)
            fetchSchools()   // ✅ re-fetch so UI is always in sync with DB
        } catch { showMsg("error", "Action failed") }
        finally { setActionLoading(null) }
    }

    const updatePlan = async (id, plan) => {
        setActionLoading(id + "_plan")
        try {
            const res = await fetch(`${API}/superadmin/plan/${id}`, {
                method: "PUT", credentials: "include", headers,
                body: JSON.stringify({ plan })
            })
            const data = await res.json()
            if (!res.ok) return showMsg("error", data.error)
            setSchools(prev => prev.map(s => s._id?.toString() === id.toString() ? { ...s, plan: data.plan } : s))
            showMsg("success", `Plan updated to ${plan}`)
        } catch { showMsg("error", "Action failed") }
        finally { setActionLoading(null) }
    }

    const deleteSchool = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
        try {
            await fetch(`${API}/superadmin/school/${id}`, {
                method: "DELETE", credentials: "include", headers
            })
            setSchools(prev => prev.filter(s => s._id?.toString() !== id.toString()))
            showMsg("success", "School deleted")
        } catch { showMsg("error", "Delete failed") }
    }

    const handleLogout = () => {
        localStorage.removeItem("superAdmin")
        window.location.reload()
    }

    const filtered = schools.filter(s => {
        const matchSearch = s.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
            s.fullname?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase())
        const matchPlan = filterPlan === "all" || s.plan === filterPlan
        return matchSearch && matchPlan
    })

    const statCards = stats ? [
        { label: "Total Schools",   value: stats.totalSchools,   icon: <School size={20} />,     color: "bg-blue-50 border-blue-100",   icon2: "bg-blue-100 text-blue-500" },
        { label: "Active Schools",  value: stats.activeSchools,  icon: <CheckCircle size={20} />, color: "bg-green-50 border-green-100", icon2: "bg-green-100 text-green-500" },
        { label: "Free Plan",       value: stats.freeSchools,    icon: <Users size={20} />,      color: "bg-gray-50 border-gray-100",   icon2: "bg-gray-100 text-gray-500" },
        { label: "Basic Plan",      value: stats.basicSchools,   icon: <BarChart2 size={20} />,  color: "bg-indigo-50 border-indigo-100",icon2: "bg-indigo-100 text-indigo-500" },
        { label: "Premium Schools", value: stats.premiumSchools, icon: <Crown size={20} />,      color: "bg-yellow-50 border-yellow-100",icon2: "bg-yellow-100 text-yellow-500" },
    ] : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                        <Shield size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-800">Super Admin Console</h1>
                        <p className="text-xs text-gray-400">Platform Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {newCount > 0 && (
                        <div className="relative">
                            <Bell size={18} className="text-gray-500" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {newCount}
                            </span>
                        </div>
                    )}
                    <button onClick={() => { fetchStats(); fetchSchools() }}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                        <RefreshCw size={15} />
                    </button>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 text-xs text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>

            <div className="px-6 py-8 max-w-7xl mx-auto">

                {/* Alert message */}
                {msg && (
                    <div className={`text-xs p-3 rounded-xl mb-5 border flex items-center gap-2
                        ${msg.type === "success" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {msg.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {msg.text}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    {["dashboard", "schools"].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`text-xs px-4 py-2 rounded-xl capitalize font-medium transition-all
                                ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ─── DASHBOARD TAB ─────────────────────────── */}
                {activeTab === "dashboard" && stats && (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            {statCards.map((card, i) => (
                                <div key={i} className={`border rounded-2xl p-4 flex items-center justify-between ${card.color}`}>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                                        <h2 className="text-2xl font-bold text-gray-800">{card.value}</h2>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${card.icon2}`}>{card.icon}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Monthly growth chart */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrendingUp size={15} className="text-blue-500" /> Monthly School Registrations
                                </h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={stats.monthlyData}>
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="schools" radius={[6, 6, 0, 0]} name="New Schools">
                                            {stats.monthlyData.map((_, i) => (
                                                <Cell key={i} fill={i === stats.monthlyData.length - 1 ? "#2563eb" : "#93c5fd"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Plan distribution */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-4">Plan Distribution</h2>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { label: "Free", count: stats.freeSchools, total: stats.totalSchools, color: "bg-gray-400" },
                                        { label: "Basic", count: stats.basicSchools, total: stats.totalSchools, color: "bg-blue-500" },
                                        { label: "Premium", count: stats.premiumSchools, total: stats.totalSchools, color: "bg-yellow-500" },
                                    ].map(item => {
                                        const pct = stats.totalSchools > 0 ? Math.round(item.count / stats.totalSchools * 100) : 0
                                        return (
                                            <div key={item.label}>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span className="font-medium">{item.label}</span>
                                                    <span>{item.count} schools ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent registrations */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Bell size={14} className="text-blue-500" />
                                    Recent Registrations
                                    {newCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{newCount} new</span>
                                    )}
                                </h2>
                            </div>
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["School", "Owner", "Email", "Plan", "Status", "Date"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats.recentRegistrations || []).map(s => (
                                        <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50">
                                            <td className="px-5 py-3 text-sm font-semibold text-gray-800">{s.schoolName}</td>
                                            <td className="px-5 py-3 text-sm text-gray-600">{s.ownerName}</td>
                                            <td className="px-5 py-3 text-xs text-gray-400">{s.email}</td>
                                            <td className="px-5 py-3"><PlanBadge plan={s.plan} /></td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                    ${s.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
                                                    {s.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-400">
                                                {new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ─── SCHOOLS TAB ───────────────────────────── */}
                {activeTab === "schools" && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search schools..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">All Plans</option>
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                            </select>
                            <span className="text-xs text-gray-400 self-center">{filtered.length} schools</span>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["School", "Owner", "Email", "School Code", "Plan", "Status", "Actions"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={7} className="text-center text-xs text-gray-400 py-10">Loading schools...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center text-xs text-gray-400 py-10">No schools found</td></tr>
                                    ) : filtered.map(s => (
                                        <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.schoolName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.fullname}</td>
                                            <td className="px-4 py-3 text-xs text-gray-400">{s.email}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-purple-600">{s.schoolCode}</td>
                                            <td className="px-4 py-3">
                                                {/* Plan selector */}
                                                <div className="relative">
                                                    <select
                                                        value={s.plan}
                                                        onChange={e => updatePlan(s._id, e.target.value)}
                                                        disabled={actionLoading === s._id + "_plan"}
                                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer">
                                                        <option value="free">Free</option>
                                                        <option value="basic">Basic</option>
                                                        <option value="premium">Premium</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border
                                                    ${s.isActive !== false ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                                                    {s.isActive !== false ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Toggle active/inactive */}
                                                    <button
                                                        onClick={() => toggleStatus(s._id)}
                                                        disabled={actionLoading === s._id + "_toggle"}
                                                        title={s.isActive !== false ? "Deactivate" : "Activate"}
                                                        className={`p-1.5 rounded-lg transition-all
                                                            ${s.isActive !== false ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                                                        {s.isActive !== false
                                                            ? <ToggleRight size={18} />
                                                            : <ToggleLeft size={18} />}
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => deleteSchool(s._id, s.schoolName)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function SuperAdminPage() {
    const [token, setToken] = useState(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("superAdmin") || "{}")
        if (stored?.token) setToken(stored.token)
        setChecked(true)
    }, [])

    if (!checked) return null

    if (!token) return <LoginPage onLogin={t => setToken(t)} />
    return <SuperAdminDashboard />
}