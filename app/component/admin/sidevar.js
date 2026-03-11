"use client"
import {
    LayoutDashboard, GraduationCap, User2, BookOpen, BookMarked,
    ClipboardList, File, DollarSign, Wallet, Video, Bell,
    MessageCircle, LogOut, School, X, Settings
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const items = [
    { title: "Dashboard", icon: <LayoutDashboard size={16} />, url: "/" },
    { title: "Students", icon: <GraduationCap size={16} />, url: "/component/admin/student" },
    { title: "Teachers", icon: <User2 size={16} />, url: "/component/admin/Teachers" },
    { title: "Classes", icon: <BookOpen size={16} />, url: "/component/admin/classes" },
    { title: "Subjects", icon: <BookMarked size={16} />, url: "/component/admin/subject" },
    { title: "Attendance", icon: <ClipboardList size={16} />, url: "/component/admin/Attendance" },
    { title: "Results", icon: <File size={16} />, url: "/component/admin/results" },
    { title: "Fee Management", icon: <DollarSign size={16} />, url: "/component/admin/fee" },
    { title: "Payroll", icon: <Wallet size={16} />, url: "/component/admin/salary" },
    { title: "PTA Meetings", icon: <Video size={16} />, url: "/component/admin/pta" },
    { title: "Announcements", icon: <Bell size={16} />, url: "/component/admin/alert" },
    { title: "Messages", icon: <MessageCircle size={16} />, url: "/component/admin/chat" },
    { title: "settings", icon: <Settings size={16} />, url: "/component/admin/settings" },
]

const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname()
    const router = useRouter()

    const [adminName, setAdminName] = useState("Admin")
    const [schoolName, setSchoolName] = useState("School Management")
    const [schoolLogo, setSchoolLogo] = useState("")

    useEffect(() => {
        const stored = localStorage.getItem("user")
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setAdminName(parsed.name || "Admin")
                setSchoolName(parsed.schoolName || "School Management")
                setSchoolLogo(parsed.schoolLogo || "")
            } catch { }
        }
    }, [])

    const handleLogout = () => {
        localStorage.clear()
        router.push("/component/auth/adminLogin")
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            {/* School branding header */}
            <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    {schoolLogo ? (
                        <img src={schoolLogo} alt="Logo"
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                    ) : (
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <School size={18} className="text-white" />
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <h1 className="text-sm font-bold text-gray-800 truncate">{schoolName}</h1>
                        <p className="text-[10px] text-gray-400">Admin Portal</p>
                    </div>
                </div>
                <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <X size={18} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {items.map(item => {
                    const active = pathname === item.url
                    return (
                        <Link key={item.url} href={item.url} onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                                ${active ? "bg-blue-200 text-black" : "text-gray-600 hover:bg-black hover:text-blue-200"}`}>
                            <span className={active ? "text-black" : "text-black-400 "}>{item.icon}</span>
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                            {adminName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-800 truncate max-w-[110px]">{adminName}</p>
                            <p className="text-[10px] text-gray-400">Administrator</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} title="Logout"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:flex fixed top-0 left-0 h-full w-64 z-30 flex-col border-r border-gray-200 shadow-sm">
                <SidebarContent />
            </div>
            {/* Mobile drawer */}
            <div className={`fixed top-0 left-0 h-full w-64 z-30 transform transition-transform duration-300 ease-in-out md:hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <SidebarContent />
            </div>
        </>
    )
}

export default Sidebar