"use client"
import { LayoutDashboard, BookOpen, ClipboardList, DollarSign, Users, Bell, MessageCircle, LogOut, GraduationCap, Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TeacherSidebar = () => {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    const links = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/component/teacher" },
        { label: "My Classes", icon: <BookOpen size={18} />, href: "/component/teacher/myClass" },
        { label: "Results", icon: <ClipboardList size={18} />, href: "/component/teacher/result" },
        { label: "Salary", icon: <DollarSign size={18} />, href: "/component/teacher/salary" },
        { label: "PTA Meetings", icon: <Users size={18} />, href: "/component/teacher/pta" },
        { label: "Announcements", icon: <Bell size={18} />, href: "/component/teacher/announcement" },
        { label: "Messages", icon: <MessageCircle size={18} />, href: "/teacher/messages" },
    ]

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md p-2 rounded-lg"
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay */}
            {open && (
                <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300
                ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
                    <div className="bg-blue-500 p-1.5 rounded-lg">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-800">Ammar Mnagment System</h1>
                        <p className="text-xs text-gray-400">Teacher Portal</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="px-4 py-4 flex flex-col gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`flex gap-4 items-center font-sans mb-3 text-xs text-gray-600 hover:bg-blue-500 w-52 px-2 rounded-md py-2 hover:text-white
                                ${pathname === link.href
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-600 hover:bg-blue-500"
                                }`}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-6 left-0 right-0 px-4">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}

export default TeacherSidebar