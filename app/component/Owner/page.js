'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
    GraduationCap,
    BookOpen,
    Users,
    BarChart2,
    School,
    AlertTriangle,
    CheckCircle2,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { authFetch } from "../admin/utils/api"
import { API } from "../../config/api"
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444']

export default function OwnerDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [ownerName, setOwnerName] = useState('')
    const [schoolName, setSchoolName] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        setOwnerName(localStorage.getItem('ownerName') || 'Owner')
        setSchoolName(localStorage.getItem('schoolName') || 'School')
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const res = await authFetch(`${API}/payroll/owner-stats`)
            const data = await res.json()
            setStats(data)
        } catch (err) { console.log(err) }
        finally { setLoading(false) }
    }

    const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

    const pieData = stats ? [
        { name: 'Fees Collected', value: stats.totalFeesCollected },
        { name: 'Fees Pending', value: stats.totalFeesPending },
    ] : []

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-gray-400 text-lg">Loading dashboard...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Owner Navbar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                            <Menu className="w-5 h-5 text-black" />
                        </button>
                        <div className="flex items-center gap-2">
                            <School className="w-6 h-6 text-blue-200" />
                            <div>
                                <div className="font-bold text-black text-lg">{schoolName}</div>
                                <div className="text-xs text-gray-400">Owner Dashboard</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-medium text-black">{ownerName}</div>
                            <div className="text-xs text-gray-400">School Owner</div>
                        </div>
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {ownerName.charAt(0)}
                        </div>
                        <button onClick={() => {
                            localStorage.clear()
                            window.location.href = '/owner/login'
                        }} className="hidden md:flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0   bg-opacity-40 z-20" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed left-0 top-0 h-full w-64 bg-white z-30 shadow-xl p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="font-bold text-xl text-blue-200">{schoolName}</div>
                            <button onClick={() => setSidebarOpen(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        {['Dashboard', 'Payroll', 'Logout'].map(item => (
                            <button key={item} onClick={() => {
                                if (item === 'Logout') { localStorage.clear(); window.location.href = '/owner/login' }
                                setSidebarOpen(false)
                            }} className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 text-black mb-1 text-sm">
                                {item}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
                <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-black">
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {ownerName}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Here's what's happening at {schoolName} — {stats?.currentMonth} {stats?.currentYear}</p>
                </div>

                {/* Top stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    {[
                        { label: 'Total Students', value: stats?.totalStudents || 0, icon: <GraduationCap className="w-5 h-5" />, color: 'bg-blue-50 text-blue-200' },
                        { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: <BookOpen className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
                        { label: 'Total Parents', value: stats?.totalParents || 0, icon: <Users className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
                        { label: 'Attendance Rate', value: `${stats?.overallAttendanceRate || 0}%`, icon: <BarChart2 className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl shadow p-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                                {card.icon}
                            </div>
                            <div className="text-2xl font-bold text-black">{card.value}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Fee + Payroll financial cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    {[
                        { label: 'Fees Collected', value: formatNaira(stats?.totalFeesCollected), color: 'text-green-600' },
                        { label: 'Fees Outstanding', value: formatNaira(stats?.totalFeesPending), color: 'text-red-500' },
                        { label: 'Payroll Paid', value: formatNaira(stats?.totalPayrollPaid), color: 'text-blue-200' },
                        { label: 'Payroll Pending', value: formatNaira(stats?.totalPayrollPending), color: 'text-yellow-600' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl shadow p-4">
                            <div className={`text-lg md:text-xl font-bold ${card.color}`}>{card.value}</div>
                            <div className="text-xs text-gray-400 mt-1">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Fee collection rate bar */}
                <div className="bg-white rounded-xl shadow p-5 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-black">Fee Collection Rate</h2>
                        <span className={`font-bold text-lg ${(stats?.feeCollectionRate || 0) >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                            {stats?.feeCollectionRate || 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                        <div className={`h-4 rounded-full transition-all ${(stats?.feeCollectionRate || 0) >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${stats?.feeCollectionRate || 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        {(stats?.feeCollectionRate || 0) < 70
                            ? <><AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" /> Fee collection is below target. Follow up with parents.</>
                            : <><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Fee collection is on track.</>
                        }
                    </p>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-black mb-4">Monthly Fee Revenue</h2>
                        {stats?.monthlyRevenue?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={stats.monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={v => formatNaira(v)} />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-300">No revenue data yet</div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-black mb-4">Fee Status Breakdown</h2>
                        {(stats?.totalFeesCollected || 0) + (stats?.totalFeesPending || 0) > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false} fontSize={10}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => formatNaira(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-300">No fee data yet</div>
                        )}
                    </div>
                </div>

                {/* Recent payments */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-5 py-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-black">Recent Fee Payments</h2>
                        <span className="text-xs text-gray-400">Last 5 payments</span>
                    </div>
                    {!stats?.recentPayments?.length ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No payments yet</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {stats.recentPayments.map(p => (
                                <div key={p._id} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-black text-sm">{p.parentName}</div>
                                        <div className="text-xs text-gray-400">{p.studentName} · {p.term}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600 text-sm">{formatNaira(p.amount)}</div>
                                        <div className="text-xs text-gray-400">
                                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}