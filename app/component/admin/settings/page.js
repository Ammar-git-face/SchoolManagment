// app/component/admin/settings/page.js
"use client"
import { useState, useEffect, useRef } from "react"
import { School, Upload, Check, Eye, EyeOff, Save, Copy } from "lucide-react"
import Sidebar from "../sidevar"
import { authFetch } from "../utils/api"

const AdminSettings = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // School info
    const [schoolName,    setSchoolName]    = useState("")
    const [schoolPhone,   setSchoolPhone]   = useState("")
    const [schoolAddress, setSchoolAddress] = useState("")
    const [schoolCode,    setSchoolCode]    = useState("")
    const [schoolLogo,    setSchoolLogo]    = useState("")
    const [logoPreview,   setLogoPreview]   = useState("")
    const [copied,        setCopied]        = useState(false)

    // Admin password change
    const [oldPass,   setOldPass]   = useState("")
    const [newPass,   setNewPass]   = useState("")
    const [showOld,   setShowOld]   = useState(false)
    const [showNew,   setShowNew]   = useState(false)

    // UI state
    const [infoMsg,  setInfoMsg]  = useState(null)
    const [logoMsg,  setLogoMsg]  = useState(null)
    const [passMsg,  setPassMsg]  = useState(null)
    const [savingInfo,  setSavingInfo]  = useState(false)
    const [savingLogo,  setSavingLogo]  = useState(false)
    const [savingPass,  setSavingPass]  = useState(false)

    const fileRef = useRef()

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("user") || "{}")
        setSchoolName(stored.schoolName   || "")
        setSchoolPhone(stored.schoolPhone || "")
        setSchoolAddress(stored.schoolAddress || "")
        setSchoolCode(stored.schoolCode   || "")
        setSchoolLogo(stored.schoolLogo   || "")
        setLogoPreview(stored.schoolLogo  || "")
    }, [])

    const token = () => localStorage.getItem("token")

    // ── Copy school code ──────────────────────────────
    const copyCode = () => {
        navigator.clipboard.writeText(schoolCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // ── Save school info ──────────────────────────────
    const saveInfo = async () => {
        setSavingInfo(true)
        setInfoMsg(null)
        try {
            const res = await authFetch("http://localhost:5000/school/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                credentials: 'include',
                body: JSON.stringify({ name: schoolName, phone: schoolPhone, address: schoolAddress })
            })
            const data = await res.json()
            if (!res.ok) return setInfoMsg({ type: "error", text: data.error })

            // Update localStorage
            const stored = JSON.parse(localStorage.getItem("user") || "{}")
            stored.schoolName    = schoolName
            stored.schoolPhone   = schoolPhone
            stored.schoolAddress = schoolAddress
            localStorage.setItem("user", JSON.stringify(stored))

            setInfoMsg({ type: "success", text: "School info updated successfully" })
        } catch { setInfoMsg({ type: "error", text: "Failed to save" }) }
        finally { setSavingInfo(false) }
    }

    // ── Logo file pick ────────────────────────────────
    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 500_000) return setLogoMsg({ type: "error", text: "Logo must be under 500KB" })
        const reader = new FileReader()
        reader.onload = (ev) => setLogoPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    // ── Save logo ─────────────────────────────────────
    const saveLogo = async () => {
        if (!logoPreview || logoPreview === schoolLogo) return
        setSavingLogo(true)
        setLogoMsg(null)
        try {
            const res = await authFetch("http://localhost:5000/school/logo", {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                credentials: 'include',
                body: JSON.stringify({ logo: logoPreview })
            })
            const data = await res.json()
            if (!res.ok) return setLogoMsg({ type: "error", text: data.error })

            const stored = JSON.parse(localStorage.getItem("user") || "{}")
            stored.schoolLogo = logoPreview
            localStorage.setItem("user", JSON.stringify(stored))
            setSchoolLogo(logoPreview)

            setLogoMsg({ type: "success", text: "Logo saved! It will appear in all sidebars and report cards." })
        } catch { setLogoMsg({ type: "error", text: "Failed to upload logo" }) }
        finally { setSavingLogo(false) }
    }

    // ── Change password ───────────────────────────────
    const changePassword = async () => {
        if (!oldPass || !newPass) return setPassMsg({ type: "error", text: "Both fields are required" })
        if (newPass.length < 6)   return setPassMsg({ type: "error", text: "New password must be at least 6 characters" })
        setSavingPass(true)
        setPassMsg(null)
        try {
            const res = await authFetch("http://localhost:5000/auth/admin/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
            })
            const data = await res.json()
            if (!res.ok) return setPassMsg({ type: "error", text: data.error })
            setPassMsg({ type: "success", text: "Password changed successfully" })
            setOldPass(""); setNewPass("")
        } catch { setPassMsg({ type: "error", text: "Failed to change password" }) }
        finally { setSavingPass(false) }
    }

    const Msg = ({ msg }) => msg ? (
        <div className={`text-xs p-3 rounded-xl mb-4 border ${msg.type === "success"
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-red-50 text-red-600 border-red-200"}`}>
            {msg.text}
        </div>
    ) : null

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile topbar */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-gray-800">Settings</h1>
                    <div className="w-8" />
                </div>

                <div className="md:px-6 px-4 pt-8 pb-10 max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-xs text-gray-400 mt-1">Manage your school profile and account</p>
                    </div>

                    {/* ── School Code (read-only, copy) ── */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
                        <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Your School Code</p>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-blue-700 tracking-widest">{schoolCode || "—"}</span>
                            <button onClick={copyCode}
                                className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-blue-500 mt-2">
                            Share this code with teachers and parents so they can register and join your school.
                        </p>
                    </div>

                    {/* ── School Logo ── */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
                        <p className="text-sm font-semibold text-gray-700 mb-4">School Logo</p>
                        <Msg msg={logoMsg} />
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <School size={28} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-3">
                                    Shown in all sidebars and printed on every report card. Max 500KB, PNG or JPG.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => fileRef.current.click()}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition">
                                        <Upload size={13} /> Choose File
                                    </button>
                                    {logoPreview && logoPreview !== schoolLogo && (
                                        <button onClick={saveLogo} disabled={savingLogo}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition disabled:opacity-50">
                                            <Check size={13} />
                                            {savingLogo ? "Saving..." : "Save Logo"}
                                        </button>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/png,image/jpeg"
                                    className="hidden" onChange={handleFile} />
                            </div>
                        </div>
                    </div>

                    {/* ── School Info ── */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
                        <p className="text-sm font-semibold text-gray-700 mb-4">School Information</p>
                        <Msg msg={infoMsg} />
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">School Name</label>
                                <input type="text" value={schoolName}
                                    onChange={e => setSchoolName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                                <input type="text" value={schoolPhone}
                                    onChange={e => setSchoolPhone(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Address</label>
                                <input type="text" value={schoolAddress}
                                    onChange={e => setSchoolAddress(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <button onClick={saveInfo} disabled={savingInfo}
                            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition disabled:opacity-50">
                            <Save size={14} /> {savingInfo ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    {/* ── Change Password ── */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-4">Change Password</p>
                        <Msg msg={passMsg} />
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
                                <input type={showOld ? "text" : "password"} value={oldPass}
                                    onChange={e => setOldPass(e.target.value)} placeholder="Enter current password"
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                                <button type="button" onClick={() => setShowOld(!showOld)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                                    {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            <div className="relative">
                                <label className="text-xs text-gray-500 mb-1 block">New Password</label>
                                <input type={showNew ? "text" : "password"} value={newPass}
                                    onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters"
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                                <button type="button" onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <button onClick={changePassword} disabled={savingPass}
                            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm rounded-xl transition disabled:opacity-50">
                            <Check size={14} /> {savingPass ? "Saving..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSettings