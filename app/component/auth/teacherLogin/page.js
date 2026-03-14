"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { API_BASE } from "../../admin/utils/api"

const TeacherLogin = () => {
    const router = useRouter()
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState("")
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({ email: "", password: "" })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        const { email, password } = form
        if (!email || !password) return setError("Email and password are required")
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${API_BASE}/auth/teacher/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Invalid email or password")

            // ✅ Backend returns FLAT — no data.user wrapper
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify({
                id:              data._id             || "",
                _id:             data._id             || "",
                name:            data.fullname        || data.name || "",
                fullname:        data.fullname        || data.name || "",
                email:           data.email           || email,
                role:            "teacher",
                schoolCode:      data.schoolCode      || "",
                assignedClasses: Array.isArray(data.assignedClasses) ? data.assignedClasses : [],
            }))

            router.push("/component/teacher")
        } catch {
            setError("Could not connect to server")
        } finally { setLoading(false) }
    }

    const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit() }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Teacher Login</h1>
                        <p className="text-xs text-gray-400">Welcome back — sign in to continue</p>
                    </div>
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">{error}</div>
                )}
                <div className="flex flex-col gap-3 mb-6">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                        <input type="email" placeholder="your@email.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={form.email} onChange={e => set("email", e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                    <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block">Password</label>
                        <input type={showPass ? "text" : "password"} placeholder="Your password"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                            value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={handleKeyDown} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition text-sm">
                    {loading ? "Signing in..." : "Sign In"}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <button onClick={() => router.push("/component/auth/teacherRegister")}
                        className="text-green-500 hover:underline font-medium">Register</button>
                </p>
            </div>
        </div>
    )
}

export default TeacherLogin