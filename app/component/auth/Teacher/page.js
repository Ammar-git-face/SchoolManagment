// app/component/auth/teacherRegister/page.js
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff } from "lucide-react"

const TeacherRegister = () => {
    const router  = useRouter()
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState("")
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({
        name: "", email: "", password: "", phone: "", schoolCode: ""
    })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        const { name, email, password, schoolCode } = form
        if (!name || !email || !password || !schoolCode)
            return setError("All fields marked * are required")
        if (password.length < 6)
            return setError("Password must be at least 6 characters")
        if (schoolCode.length !== 8)
            return setError("School code must be 8 characters — ask your admin")

        setLoading(true)
        setError("")
        try {
            const res = await fetch("http://localhost:5000/auth/teacher/create-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, schoolCode: schoolCode.toUpperCase() })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Registration failed")

            // ✅ Save token and user so teacherFetch works on every page
            if (data.token) localStorage.setItem("token", data.token)
            if (data.user)  localStorage.setItem("user",  JSON.stringify(data.user))

            router.push("/component/auth/teacherLogin")
        } catch (err) {
            setError("Could not connect to server")
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Teacher Registration</h1>
                        <p className="text-xs text-gray-400">You'll need your school code from admin</p>
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
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                        <input type="email" placeholder="your@email.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                        <input type="text" placeholder="+234..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </div>
                    <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block">Password *</label>
                        <input type={showPass ? "text" : "password"} placeholder="Min 6 characters"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                            value={form.password} onChange={e => set("password", e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* School Code — key field */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">School Code * <span className="text-gray-400">(get this from your admin)</span></label>
                        <input type="text" placeholder="e.g. A3F9B2C1" maxLength={8}
                            className="w-full border-2 border-green-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono tracking-widest uppercase"
                            value={form.schoolCode} onChange={e => set("schoolCode", e.target.value.toUpperCase())} />
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition text-sm">
                    {loading ? "Creating Account..." : "Create Teacher Account"}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                    Already have an account?{" "}
                    <button onClick={() => router.push("/component/auth/teacherLogin")}
                        className="text-green-500 hover:underline font-medium">Login</button>
                </p>
            </div>
        </div>
    )
}

export default TeacherRegister