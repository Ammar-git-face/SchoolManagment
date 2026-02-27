"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Book, LayoutDashboard, GraduationCap, User2, BookOpen, DollarSign, Wallet, Video, Bell, MessageCircle , File } from "lucide-react"

const Sidebar = () => {
  const [open, setOpen] = useState(false)

  const items = [
    { id: 1, title: "Dashboard", icon: <LayoutDashboard size={16} />, url: "/" },
    { id: 2, title: "Student", icon: <GraduationCap size={16} />, url: "/component/admin/student" },
    { id: 3, title: "Teachers", icon: <User2 size={16} />, url: "/component/admin/Teachers" },
    { id: 4, title: "Classes", icon: <BookOpen size={16} />, url: "/component/admin/classes" },
    { id: 5, title: "Result", icon: <File size={16} />, url: "/component/admin/results" },
    { id: 6, title: "Fee Mnagment", icon: <DollarSign size={16} />, url: "/component/admin/fee" },
    { id: 7, title: "Salaries", icon: <Wallet size={16} />, url: "/component/admin/salary" },
    { id: 8, title: "PTA Mettings", icon: <Video size={16} />, url: "/component/admin/pta" },
    { id: 9, title: "Announcement", icon: <Bell size={16} />, url: "/component/admin/alert" },
    { id: 10, title: "Messages", icon: <MessageCircle size={16} />, url: "/component/admin/message" },
  ]

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h1 className="text-blue-500 font-bold text-lg flex items-center gap-2">
          <Image src={"/Capture.PNg"} alt="Logo" height={25} width={25} />
        Ammar Managment System
        </h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 focus:outline-none"
        >
          <Book size={24} />
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 h-full  border-r-2 border-gray-300 px-6 py-6 w-64 transform 
        ${open ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        <div>
          <h1 className="text-black font-bold font-sans text-sm flex items-center gap-2 mb-6">
            <Image src={"/Capture.PNg"} alt="Logo" height={25} width={25} />
            Ammar Managment System
          </h1>
          <hr className="w-[230px] border-[1.5px] border-gray-300 mb-6" />
        </div>

        <div className="space-y-4 font-semibold ">
          {items.map((list) => (
            <Link
              href={list.url}
              key={list.id}
              className="flex gap-4 items-center font-sans mb-3 text-xs text-gray-600 hover:bg-blue-500 w-52 px-2 rounded-md py-2 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <span>{list.icon}</span>
              <span className=""> {list.title}</span>
            </Link>
          ))}
        </div>
        <hr  className="mb-3"/>
        <h1 className="text-black text-xl font-semibold text-center">Dr Ammar</h1>
        <p className="text-center text-sm text-gray-600">Admin</p>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-40"
        ></div>
      )}
    </>
  )
}

export default Sidebar
