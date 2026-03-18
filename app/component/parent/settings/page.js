"use client"
import { X, Eye, EyeOff, User, Lock } from "lucide-react"
import { useState } from "react"
import { API } from "../../../config/api"

const Settings = ({ onClose, role }) => {
    const [activeTab, setActiveTab] = useState("profile")
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [profileMsg, setProfileMsg] = useState(null)
    const [passwordMsg, setPasswordMsg] = useState(null)

    const stored = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
    const [name, setName] = useState(stored.name || "")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const endpoint = role === "teacher"
        ? `${API}/auth/teacher/update/${stored.id}`
        : `${API}/auth/parent/update/${stored.id}`

    const handleUpdateProfile = async () => {
        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fullname: name })
            })
            const data = await res.json()
            if (!res.ok) return setProfileMsg({ type: "error", text: data.error })
            // update localStorage
            localStorage.setItem("user", JSON.stringify({ ...stored, name }))
            setProfileMsg({ type: "success", text: "Name updated successfully!" })
        } catch (err) {
            setProfileMsg({ type: "error", text: "Something went wrong" })
        }
    }

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword)
            return setPasswordMsg({ type: "error", text: "Please fill all fields" })
        if (newPassword !== confirmPassword)
            return setPasswordMsg({ type: "error", text: "New passwords do not match" })
        if (newPassword.length < 6)
            return setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" })

        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ oldPassword, newPassword })
            })
            const data = await res.json()
            if (!res.ok) return setPasswordMsg({ type: "error", text: data.error })
            setPasswordMsg({ type: "success", text: "Password changed successfully!" })
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err) {
            setPasswordMsg({ type: "error", text: "Something went wrong" })
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-bold text-black">Settings</h2>
                    <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all
                            ${activeTab === "profile" ? "bg-blue-500 text-white border-blue-500" : "text-black border-gray-200 hover:bg-gray-50"}`}>
                        <User size={13} /> Profile
                    </button>
                    <button onClick={() => setActiveTab("password")}
                        className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all
                            ${activeTab === "password" ? "bg-blue-500 text-white border-blue-500" : "text-black border-gray-200 hover:bg-gray-50"}`}>
                        <Lock size={13} /> Change Password
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div>
                        {profileMsg && (
                            <div className={`text-xs p-3 rounded-xl mb-4 border
                                ${profileMsg.type === "success" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                {profileMsg.text}
                            </div>
                        )}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-200 text-lg font-bold">
                                {name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-black">{name}</p>
                                <p className="text-xs text-gray-400 capitalize">{role}</p>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-black mb-1">Full Name</p>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5" />
                        <div className="flex justify-end">
                            <button onClick={handleUpdateProfile}
                                className="bg-blue-500 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-600">
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                    <div>
                        {passwordMsg && (
                            <div className={`text-xs p-3 rounded-xl mb-4 border
                                ${passwordMsg.type === "success" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                {passwordMsg.text}
                            </div>
                        )}
                        <p className="text-xs font-semibold text-black mb-1">Current Password</p>
                        <div className="relative mb-4">
                            <input type={showOld ? "text" : "password"} value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                            <button type="button" onClick={() => setShowOld(!showOld)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-black mb-1">New Password</p>
                        <div className="relative mb-4">
                            <input type={showNew ? "text" : "password"} value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                            <button type="button" onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-black mb-1">Confirm New Password</p>
                        <div className="relative mb-5">
                            <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleChangePassword}
                                className="bg-blue-500 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-600">
                                Change Password
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Settings