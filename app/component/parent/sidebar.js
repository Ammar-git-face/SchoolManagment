"use client"
import {
    LayoutDashboard, Users, TrendingUp, BookOpen, FileText,
    CreditCard, Users2, Bell, MessageCircle, LogOut, School,
    Settings as SettingsIcon, Menu, X
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Settings from "./settings/page"

const links = [
    { label: "Dashboard",     icon: <LayoutDashboard size={18} />, href: "/component/parent" },
    { label: "My Children",   icon: <Users size={18} />,           href: "/component/parent/child" },
    { label: "Performance",   icon: <TrendingUp size={18} />,      href: "/component/parent/performance" },
    { label: "Attendance",    icon: <BookOpen size={18} />,        href: "/component/parent/Attendance" },
    { label: "Results",       icon: <FileText size={18} />,        href: "/component/parent/result" },
    { label: "Fee Payments",  icon: <CreditCard size={18} />,      href: "/component/parent/fee" },
    { label: "PTA Meetings",  icon: <Users2 size={18} />,          href: "/component/parent/pta" },
    { label: "Announcements", icon: <Bell size={18} />,            href: "/component/parent/alert" },
    { label: "Messages",      icon: <MessageCircle size={18} />,   href: "/component/parent/chat" },
]

const Sidebar = () => {
    const pathname = usePathname()
    const router   = useRouter()

    // ✅ Sidebar manages its own open/close — no props needed from parent pages
    const [isOpen,       setIsOpen]       = useState(false)
    const [name,         setName]         = useState("Parent")
    const [initials,     setInitials]     = useState("P")
    const [schoolName,   setSchoolName]   = useState("School Management")
    const [schoolLogo,   setSchoolLogo]   = useState("")
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("user") || "{}")
        const userName = stored.name || "Parent"
        setName(userName)
        setInitials(userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase())
        setSchoolName(stored.schoolName || "School Management")
        setSchoolLogo(stored.schoolLogo || "")
    }, [])

    // Auto-close when navigating on mobile
    useEffect(() => { setIsOpen(false) }, [pathname])

    const handleLogout = async () => {
        await fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" })
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        router.push("/component/auth/parentLogin")
    }

    return (
        <>
            {/* ── Mobile topbar with hamburger ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
                <button onClick={() => setIsOpen(true)}
                    className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition">
                    <Menu size={22} />
                </button>
                <div className="flex items-center gap-2">
                    {schoolLogo
                        ? <img src={schoolLogo} alt="Logo" className="w-7 h-7 rounded-lg object-cover border border-gray-200" />
                        : <div className="bg-blue-500 p-1 rounded-lg"><School size={16} className="text-white" /></div>
                    }
                    <span className="text-sm font-bold text-gray-800 truncate max-w-[160px]">{schoolName}</span>
                </div>
                <div className="w-9" />
            </div>

            {/* ── Backdrop ── */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* ── Sidebar panel ── */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {schoolLogo ? (
                            <img src={schoolLogo} alt="Logo" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                        ) : (
                            <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
                                <School size={20} className="text-white" />
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <h1 className="text-sm font-bold text-gray-800 truncate">{schoolName}</h1>
                            <p className="text-xs text-gray-400">Parent Portal</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${pathname === link.href ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                            {link.icon}{link.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-100 shrink-0">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-gray-50 transition-all"
                            onClick={() => setShowSettings(true)}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {initials}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{name}</p>
                                    <p className="text-xs text-gray-400">Parent</p>
                                </div>
                            </div>
                            <SettingsIcon size={14} className="text-gray-400 flex-shrink-0" />
                        </div>
                    </div>
                    <div className="px-4 pb-4">
                        <button onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {showSettings && <Settings onClose={() => setShowSettings(false)} role="parent" />}
        </>
    )
}

export default Sidebar