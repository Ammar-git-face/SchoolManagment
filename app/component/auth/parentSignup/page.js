// app/component/auth/parentRegister/page.js
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Eye, EyeOff } from "lucide-react"
import { API } from "../../../config/api"

const ParentRegister = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({
        fullname: "", email: "", password: "", phone: "", familyCode: ""
    })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        const { fullname, email, password, familyCode } = form
        if (!fullname || !email || !password || !familyCode)
            return setError("All fields marked * are required")
        if (password.length < 6)
            return setError("Password must be at least 6 characters")

        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${API}/auth/parent/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Registration failed")
            router.push("/component/auth/parentLogin")
        } catch {
            setError("Could not connect to server")
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                        <Users size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Parent Registration</h1>
                        <p className="text-xs text-gray-400">You'll need your family code from the school admin</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3 mb-6">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Full Name *</label>
                        <input type="text" placeholder="Your full name"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={form.fullname} onChange={e => set("fullname", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                        <input type="email" placeholder="your@email.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                        <input type="text" placeholder="+234..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </div>
                    <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block">Password *</label>
                        <input type={showPass ? "text" : "password"} placeholder="Min 6 characters"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                            value={form.password} onChange={e => set("password", e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            School Code * <span className="text-gray-400">(given to you by the school)</span>
                        </label>
                        <input type="text" placeholder="e.g. BZNLFHTB"
                            className="w-full border-2 border-purple-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase"
                            value={form.schoolCode} onChange={e => set("schoolCode", e.target.value.toUpperCase())} />
                        <p className="text-xs text-gray-400 mt-1">
                            This ensures your account is linked to the correct school.
                        </p>
                    </div>

                    {/* ✅ Family Code — not school code */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Family Code * <span className="text-gray-400">(get this from your child's school admin)</span>
                        </label>
                        <input type="text" placeholder="e.g. FAM-1234567890-ABC12"
                            className="w-full border-2 border-purple-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                            value={form.familyCode} onChange={e => set("familyCode", e.target.value)} />
                        <p className="text-xs text-gray-400 mt-1">
                            This code links your account to your child. The admin generates it from the Students page.
                        </p>
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition text-sm">
                    {loading ? "Creating Account..." : "Create Parent Account"}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                    Already have an account?{" "}
                    <button onClick={() => router.push("/component/auth/parentLogin")}
                        className="text-purple-500 hover:underline font-medium">Login</button>
                </p>
            </div>
        </div>
    )
}

export default ParentRegister