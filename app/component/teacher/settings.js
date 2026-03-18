"use client"
import { X, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { teacherFetch, getUser, setUser, API_BASE } from "../teacher/utils/api"
import { API } from "../../config/api"

const Settings = ({ onClose, role }) => {
    const [activeTab, setActiveTab] = useState("profile")
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [profileMsg, setProfileMsg] = useState(null)
    const [passwordMsg, setPasswordMsg] = useState(null)

    // ✅ Use getUser() helper — handles safe JSON parse
    const stored = getUser()

    // ✅ Handle both id and _id — login may save either shape
    const userId = stored.id || stored._id

    const [name, setName] = useState(stored.name || stored.fullname || "")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // ✅ API_BASE instead of hardcoded localhost — works for mobile too
    // ✅ userId is now always defined — was `stored.id` which was undefined when login saved `_id`
    const endpoint = role === "teacher"
        ? `${API_BASE}/auth/teacher/update/${userId}`
        : `${API_BASE}/auth/parent/update/${userId}`

    const handleUpdateProfile = async () => {
        if (!userId) return setProfileMsg({ type: "error", text: "User ID not found. Please log in again." })
        try {
            const res = await teacherFetch(endpoint, {
                method: "PUT",
                body: JSON.stringify({ fullname: name })
            })
            const data = await res.json()
            if (!res.ok) return setProfileMsg({ type: "error", text: data.error })
            // ✅ setUser fires userUpdated event — sidebar and header update live
            setUser({ name, fullname: name })
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
        if (!userId) return setPasswordMsg({ type: "error", text: "User ID not found. Please log in again." })

        try {
            const res = await teacherFetch(endpoint, {
                method: "PUT",
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
        <div className="fixed inset-0  /50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="font-semibold text-black text-sm">Settings</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-black">
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {["profile", "password"].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-xs font-medium capitalize transition-colors
                                ${activeTab === tab
                                    ? "text-blue-200 border-b-2 border-blue-600"
                                    : "text-black hover:text-black"}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div>
                            {profileMsg && (
                                <div className={`text-xs p-3 rounded-xl mb-4 border
                                    ${profileMsg.type === "success"
                                        ? "bg-green-50 text-green-600 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"}`}>
                                    {profileMsg.text}
                                </div>
                            )}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-200 text-lg font-bold">
                                    {name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-black">{name || "—"}</p>
                                    <p className="text-xs text-gray-400 capitalize">{role}</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-black mb-1">Full Name</p>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5" />
                            <div className="flex justify-end">
                                <button onClick={handleUpdateProfile}
                                    className="bg-blue-500 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-600 transition">
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
                                    ${passwordMsg.type === "success"
                                        ? "bg-green-50 text-green-600 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"}`}>
                                    {passwordMsg.text}
                                </div>
                            )}
                            {[
                                { label: "Current Password", val: oldPassword, set: setOldPassword, show: showOld, toggle: () => setShowOld(!showOld), ph: "Enter current password" },
                                { label: "New Password",     val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew), ph: "Enter new password" },
                                { label: "Confirm Password", val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm), ph: "Confirm new password" },
                            ].map(({ label, val, set, show, toggle, ph }) => (
                                <div key={label} className="mb-4">
                                    <p className="text-xs font-semibold text-black mb-1">{label}</p>
                                    <div className="relative">
                                        <input type={show ? "text" : "password"} value={val}
                                            onChange={(e) => set(e.target.value)} placeholder={ph}
                                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                                        <button type="button" onClick={toggle}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {show ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button onClick={handleChangePassword}
                                    className="bg-blue-500 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-600 transition">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings