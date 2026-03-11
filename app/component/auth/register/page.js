// app/component/auth/register/page.js  ← public, no auth needed
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { School, Eye, EyeOff, CheckCircle, Copy, Check } from "lucide-react"

const SchoolRegister = () => {
    const router = useRouter()
    const [step, setStep] = useState(1)  // 1 = form, 2 = success + code
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [schoolCode, setSchoolCode] = useState("")
    const [schoolName, setSchoolNameState] = useState("")

    const [form, setForm] = useState({
        schoolName: "", schoolEmail: "", schoolPhone: "", schoolAddress: "",
        adminName: "", adminEmail: "", adminPassword: ""
    })

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        const { schoolName, schoolEmail, adminName, adminEmail, adminPassword } = form
        if (!schoolName || !schoolEmail || !adminName || !adminEmail || !adminPassword)
            return setError("Please fill in all required fields")
        if (adminPassword.length < 6)
            return setError("Password must be at least 6 characters")

        setLoading(true)
        setError("")
        try {
            const res = await fetch("http://localhost:5000/school/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Registration failed")
            setSchoolCode(data.schoolCode)
            setSchoolNameState(data.schoolName)
            setStep(2)
        } catch (err) {
            setError("Could not connect to server")
        } finally { setLoading(false) }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(schoolCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (step === 2) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="gray-500-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">School Registered!</h1>
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-700">{schoolName}</span> has been successfully registered.
                </p>

                {/* School Code — the most important thing on this screen */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
                    <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                        Your School Code
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-black text-blue-700 tracking-widest">{schoolCode}</span>
                        <button onClick={copyCode}
                            className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition">
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                    <p className="text-xs text-blue-500 mt-3 leading-relaxed">
                        Share this code with your teachers and parents.<br />
                        They will need it to create their accounts.
                    </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-left">
                    <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Save this code!</p>
                    <p className="text-xs text-amber-600">
                        This is the only way your staff and parents can join your school on the platform.
                        Screenshot this page or copy the code now.
                    </p>
                </div>

                <button onClick={() => router.push("/component/auth/admin")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition text-sm">
                    Continue to Admin Login
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <School size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Register Your School</h1>
                        <p className="text-xs text-gray-400">Set up your school management system</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                {/* School Info */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">School Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">School Name *</label>
                        <input type="text" placeholder="e.g. Greenfield Academy"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.schoolName} onChange={e => set("schoolName", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">School Email *</label>
                        <input type="email" placeholder="school@email.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.schoolEmail} onChange={e => set("schoolEmail", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                        <input type="text" placeholder="+234..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.schoolPhone} onChange={e => set("schoolPhone", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Address</label>
                        <input type="text" placeholder="School address"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.schoolAddress} onChange={e => set("schoolAddress", e.target.value)} />
                    </div>
                </div>

                {/* Admin Account */}
                <p className="text-xs font-bold text-gray-500 bg-gray-500 uppercase tracking-wide mb-3">Admin Account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Admin Full Name *</label>
                        <input type="text" placeholder="Your name"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.adminName} onChange={e => set("adminName", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Admin Email *</label>
                        <input type="email" placeholder="admin@email.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.adminEmail} onChange={e => set("adminEmail", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 relative">
                        <label className="text-xs text-gray-500 mb-1 block">Admin Password *</label>
                        <input type={showPass ? "text" : "password"} placeholder="Min 6 characters"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            value={form.adminPassword} onChange={e => set("adminPassword", e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-gray-400 disabled:opacity-50 font-semibold py-3 rounded-2xl transition text-sm">
                    {loading ? "Registering..." : "Register School"}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                    Already registered?{" "}
                    <button onClick={() => router.push("/component/auth/admin")}
                        className="text-blue-500 hover:underline font-medium">
                        Admin Login
                    </button>
                </p>
            </div>
        </div>
    )
}

export default SchoolRegister