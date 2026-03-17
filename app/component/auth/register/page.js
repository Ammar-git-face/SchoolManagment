"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { School, Eye, EyeOff, CheckCircle, Copy, Check, ArrowLeft } from "lucide-react"
import { API } from "../../../config/api"

const SchoolRegister = () => {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [result, setResult] = useState({ schoolCode: "", schoolName: "" })

    const [form, setForm] = useState({
        fullname: "",        // ✅ matches ownerRegister controller
        email: "",           // ✅ owner/admin email
        password: "",        // ✅ plain — controller hashes it
        phone: "",
        schoolName: "",
        schoolAddress: "",
        plan: "free"
    })

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        const { fullname, email, password, schoolName } = form
        if (!fullname || !email || !password || !schoolName)
            return setError("Please fill in all required fields")
        if (password.length < 6)
            return setError("Password must be at least 6 characters")

        setLoading(true)
        setError("")
        try {
            // ✅ Correct endpoint: /payroll/owner-register (public, no auth needed)
            const res = await fetch(`${API}/payroll/owner-register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Registration failed")
            setResult({ schoolCode: data.schoolCode, schoolName: data.owner?.schoolName || form.schoolName })
            setStep(2)
        } catch {
            setError("Could not connect to server. Make sure the backend is running.")
        } finally { setLoading(false) }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(result.schoolCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // ── Step 2: Success screen ─────────────────────────────────────────────
    if (step === 2) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">School Registered!</h1>
                <p className="text-sm black mb-6">
                    <span className="font-semibold black">{result.schoolName}</span> is now live on the platform.
                </p>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-widest">Your School Code</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-black text-blue-700 tracking-widest font-mono">
                            {result.schoolCode}
                        </span>
                        <button onClick={copyCode}
                            className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all">
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                    <p className="text-xs text-blue-500 mt-3 leading-relaxed">
                        Share this code with your teachers and parents.<br />
                        They need it to create their accounts.
                    </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-left">
                    <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Screenshot this page!</p>
                    <p className="text-xs text-amber-600">
                        Your login credentials have been emailed to you. Your school code is the only way staff and parents can join.
                    </p>
                </div>

                <button onClick={() => router.push("/component/auth/admin")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition text-sm">
                    Continue to Admin Login →
                </button>
            </div>
        </div>
    )

    // ── Step 1: Registration form ──────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.push("/")} className="p-2 rounded-xl hover:bg-gray-100 text-black mr-1">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <School size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Register Your School</h1>
                        <p className="text-xs black">Set up your school management system</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                {/* School Info */}
                <p className="text-xs font-bold text-black uppercase tracking-widest mb-3">School Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="sm:col-span-2">
                        <label className="text-xs text-black mb-1 block">School Name *</label>
                        <input type="text" placeholder="e.g. Greenfield Academy"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.schoolName} onChange={e => set("schoolName", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs black mb-1 block">Phone</label>
                        <input type="text" placeholder="+234..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs black mb-1 block">Address</label>
                        <input type="text" placeholder="School address"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.schoolAddress} onChange={e => set("schoolAddress", e.target.value)} />
                    </div>
                </div>

                {/* Owner / Admin Account */}
                <p className="text-xs font-bold black uppercase tracking-widest mb-3">Your Account</p>
                <p className="text-xs black mb-3 -mt-1">This will be your admin login credentials</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div>
                        <label className="text-xs black mb-1 block">Full Name *</label>
                        <input type="text" placeholder="Your full name"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.fullname} onChange={e => set("fullname", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs black mb-1 block">Email *</label>
                        <input type="email" placeholder="you@email.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 relative">
                        <label className="text-xs black mb-1 block">Password * <span className="black">(min 6 characters)</span></label>
                        <input type={showPass ? "text" : "password"} placeholder="Create a password"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            value={form.password} onChange={e => set("password", e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 black hover:black">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 font-semibold py-3 rounded-2xl transition text-sm">
                    {loading ? "Registering your school..." : "Register School"}
                </button>

                <p className="text-xs text-center black mt-4">
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